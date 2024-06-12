from django.http import HttpResponse

from connect_db.models import Dailytask, Subtask, UserInfo, Maintask
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import json
from datetime import datetime, date
from connect_db.views import vaild_time
from django.db import IntegrityError


state2num = { 'processing' : 0, 'complete' : 1, 'fail' : 2, 'delete' : 3 } 
num2state = { 0 : 'processing', 1 : 'complete', 2 : 'fail' } 

def sort_tasks(tasks):
    return sorted(tasks, key=lambda x: (
        x["state"] != "processing",  # processing 在最前面
        x["state"] != "complete",    # complete 在 processing 後面，fail 在最後面
        datetime.strptime(x.get("end", ""), "%Y-%m-%d %H:%M") if x.get("end") else datetime.max  # 根據 end_time 排序，越早的排越前面
    ))

def get_all_main_sub_tasks(user_id):
    # 獲得該用戶所有主任務
    # given_datetime.strftime('%Y-%m-%d %H:%M:%S')
    maintasks = Maintask.objects.filter(user_id=user_id)
    tasks_data = []
    today_subtask = []
    for maintask in maintasks:
        maintask_data = {
            "name": maintask.maintask_name,
            "state": num2state[maintask.state],
            "start": maintask.start_time.strftime('%Y-%m-%d %H:%M'),
            "end": maintask.end_time.strftime('%Y-%m-%d %H:%M'),
            "description": maintask.description,
            "subtasks": []
        }
        
        # 獲得主任務的所有子任務
        maintask_id = maintask.maintask_id
        subtasks = Subtask.objects.filter(maintask_id=maintask_id)
        for subtask in subtasks:
            subtask_data = {
                "name": subtask.task_name,
                "state": num2state[subtask.state],
                "belong" : maintask.maintask_name,
                "end": subtask.end_time.strftime('%Y-%m-%d %H:%M'),
                "description": subtask.description
            }
            maintask_data["subtasks"].append(subtask_data)
        
            # 加入子任務
            today_subtask.append(subtask_data)

        maintask_data["subtasks"] = sort_tasks(maintask_data["subtasks"])
        tasks_data.append(maintask_data)
    
    today_subtask = sort_tasks(today_subtask)
    tasks_data = sort_tasks(tasks_data)
    return tasks_data, today_subtask


def get_all_dailytasks(user_id):
    try:
        
        # 查詢該用戶所有dailytask 
        smalltasks = Dailytask.objects.filter(
            user_id=user_id
        )

        # 逐個增加近array
        result = []
        for smalltask in smalltasks:
            #if smalltask.end_time.date() == today:
            data = {
                "name": smalltask.task_name,
                "state": num2state[smalltask.state],
                "end": smalltask.end_time.strftime('%Y-%m-%d %H:%M'),
                "description": smalltask.description
            }
            result.append(data)
        result = sort_tasks(result)
        return result
    except :
        response = {"msg": "error"}
        return JsonResponse(response)


def add_user(request):
    data = json.load(request)
    email = data['email']
    line_id = data['line_id']

    try:
        user = get_object_or_404(UserInfo, useremail = email)
        user.line_id = line_id
        user.save()
        return JsonResponse({"msg": "success"})
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})


def add_small_task(request):
    '''
    輸入: 
    {
        "line_id" : "aaaaaaaa" ,
        "name" : "dailytask name" ,
        "end" : "YYYY-MM-DD hh:mm" , 
        "state" : "processing", 
        "belong" : "none"  ,
        "description" : "任務描述"                
    }
    '''

    data = json.load(request)
    line_id = data['line_id']
    name = data['name']
    end = data['end']
    state = state2num[data["state"]]
    belong = data['belong']
    description = data['description']
    end = datetime.strptime(end, "%Y-%m-%d %H:%M")

    try:
        user = get_object_or_404(UserInfo, line_id = line_id)
        user_id = user.user_id
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})
    
    if belong == "none":
        if not vaild_time('none',end):
            return JsonResponse({"msg":"invalid time"})
        
        if Dailytask.objects.filter(task_name=name, end_time=end, user = user_id).exists():
            data = {"msg": "this daily task already exist"}
            return JsonResponse(data)
        else:
            try:
                Dailytask.objects.create(
                    user_id = user_id ,
                    task_name = name,
                    state = state ,
                    end_time = end,
                    description = description
                )
                data = {"msg": "dailytask add successful"}
                return JsonResponse(data)
            except Exception as e:
                return JsonResponse({"msg": "error", "error_reason": str(e)})
    else: 
        maintask = Maintask.objects.filter(user_id=user_id, maintask_name=belong).first() 
        if maintask:
            maintask_id = maintask.maintask_id
            main_end = maintask.end_time
            main_state = maintask.state
        else:
            data = {"msg" : "maintask doesn't exist"}
            return JsonResponse(data)

    if main_state != 0 :
        return JsonResponse({"msg" : "the state of the maintask is not processing"})

    if Subtask.objects.filter(task_name=name, end_time=end, maintask_id = maintask_id).exists():
        data = {"msg": "this subtask already exist"}
        return JsonResponse(data)  
    else:

        now = datetime.now()
        if main_end < end or end < now:
            return JsonResponse({"msg":"invalid time"})

        try:
            Subtask.objects.create(
                maintask_id = maintask_id ,
                task_name = name,
                state = state ,
                end_time = end,
                description = description
            )
            data = {"msg": "subtask add successful"}
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({"msg": "error", "error_reason": str(e)})


def change_small_state(request):
    data = json.load(request)
    line_id = data['line_id']
    name = data['name']
    end = data['end']
    state = state2num[data["state"]]
    belong = data['belong']
    end = datetime.strptime(end, "%Y-%m-%d %H:%M")

    try:
        user = get_object_or_404(UserInfo, line_id = line_id)   
        user_id = user.user_id
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})
    
    if belong == 'none':
        try: 
            task = get_object_or_404(Dailytask, task_name=name,user_id = user_id,end_time = end)
            if state != 3 :
                task.state = state
                task.save()
                return JsonResponse({"msg": "success"})
            else :
                task.delete()
                return JsonResponse({"msg": "delete success"})
        except Exception as e:
            return JsonResponse({"msg": "error", "error_reason": str(e)})   
    else: 
        try:
            maintask = Maintask.objects.get(maintask_name = belong, user_id = user_id)
            maintask_id = maintask.maintask_id
            task = get_object_or_404(Subtask, task_name=name,maintask = maintask_id,end_time = end)
            if state != 3 :
                task.state = state
                task.save()
                return JsonResponse({"msg": "success"})
            else :
                task.delete()
                return JsonResponse({"msg": "delete success"})
        except Exception as e:
            return JsonResponse({"msg": "error", "error_reason": str(e)}) 



def get_todolist(request):
    data = json.load(request)
    line_id = data['line_id']
    
    try:
        user = get_object_or_404(UserInfo, line_id = line_id)   
        user_id = user.user_id
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})
    
    try:
        maintask, subtask = get_all_main_sub_tasks(user_id)
        dailytask = get_all_dailytasks(user_id)
        data = {
            "msg" : "success",
            "maintask": maintask,
            "subtask" :subtask,
            "dailytask" : dailytask
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})


def add_maintask(request):
    
    '''
    輸入:

    "user_id" : "3" ,
	"name" : "task name" ,
	"start" : "YYYY/MM/DD/HH/mm" ,
	"end" : "YYYY/MM/DD/HH/mm" ,
	"state" : "processing" ,
	"description" : "任務描述"

    '''
    data = json.load(request)
    line_id = data['line_id']
    name = data['name']
    start = data['start']
    end = data['end']
    state = state2num[data["state"]]
    description = data["description"]
    start = datetime.strptime(start, "%Y-%m-%d %H:%M")
    end = datetime.strptime(end, "%Y-%m-%d %H:%M")
    # start = start
    # end = end
    print(data)
    # print(user_id)
    print(start)
    print(end)
    # print(state)
    # print(description)

    if not vaild_time(start,end):
        return JsonResponse({"msg":"invalid time"})

    try:
        user = get_object_or_404(UserInfo, line_id = line_id)   
        user_id = user.user_id
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})
    

    try:
        Maintask.objects.create(
            user_id = user_id ,
            maintask_name = name,
            state = state ,
	        start_time = start ,
            end_time = end,
            description = description
        )
        data = {"msg": "success"}
        return JsonResponse(data)
    except IntegrityError:
        data = {"msg": "Maintask name already exists"}
        return JsonResponse(data)
    except Exception as e:
        data = {"msg" : "error" ," error_reason" : str(e)}
        print(str(e))
        return JsonResponse(data)
    

def change_main_state(request):
    data = json.load(request)
    line_id = data['line_id']
    name = data['name']
    state = state2num[data['state']]

    try:
        user = get_object_or_404(UserInfo, line_id = line_id)   
        user_id = user.user_id
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})
    

    if state != 3:
        try:
            maintask = get_object_or_404(Maintask, maintask_name=name,user_id = user_id)
            # 更新 state 属性
            maintask.state = state
            maintask.save()
            return JsonResponse({"msg": "success"})
        except Exception as e:
            return JsonResponse({"msg": "error", "error_reason": str(e)})
    else: 
        try:
            maintask = get_object_or_404(Maintask, maintask_name=name, user_id = user_id)
            maintask.delete()
            return JsonResponse({"msg": "delete success"})
        except Exception as e:
            return JsonResponse({"msg": "error", "error_reason": str(e)})
        

def login(request):
    data = json.load(request)
    email = data['email']
    password = data['password']
    print(data)
    try:
        user_info = UserInfo.objects.get(useremail=email)
        correct_password = user_info.password
        if password == correct_password :
            user_id = user_info.user_id
            username = user_info.username
            email = user_info.useremail
            data = {
	                "msg" : "success" ,
	                "email" : email
                }
            return JsonResponse(data)
        else:
            data = {
	                "msg" : "incorrect password" ,
	                "email" : "none"
                }
            return JsonResponse(data) 
    except UserInfo.DoesNotExist:
        data = {
	                "msg" : "email not in database" ,
	                "email" : "none"
            }
        return JsonResponse(data)

