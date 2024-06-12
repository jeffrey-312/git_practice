from django.shortcuts import render, redirect

from django.http import HttpResponse

import json

from datetime import datetime, timedelta, date
from django.conf import settings
import jwt
from django.http import JsonResponse
from django.db import IntegrityError
from django.utils.timezone import now
from .models import UserInfo, Dailytask, Subtask, Maintask

from django.shortcuts import get_object_or_404
import random, string
from django.core.mail import send_mail, BadHeaderError
import re
import uuid
# Create your views here.

state2num = { 'processing' : 0, 'complete' : 1, 'fail' : 2, 'delete' : 3 } 
num2state = { 0 : 'processing', 1 : 'complete', 2 : 'fail' } 


def sort_tasks(tasks):
    return sorted(tasks, key=lambda x: (
        x["state"] != "processing",  # processing 在最前面
        x["state"] != "complete",    # complete 在 processing 後面，fail 在最後面
        datetime.strptime(x.get("end", ""), "%Y-%m-%d %H:%M") if x.get("end") else datetime.max  # 根據 end_time 排序，越早的排越前面
    ))

def get_main_sub_tasks(user_id):
    today = date.today()
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
        
            # 查看子任務是否為今天的
            if subtask.end_time.date() == today:
                today_subtask.append(subtask_data)
        maintask_data["subtasks"] = sort_tasks(maintask_data["subtasks"])
        tasks_data.append(maintask_data)
    
    today_subtask = sort_tasks(today_subtask)
    tasks_data = sort_tasks(tasks_data)
    return tasks_data, today_subtask


def get_today_tasks(user_id):
    try:
        today = date.today()
        print(today)
        # 查詢該日的 Subtask 
        smalltasks = Dailytask.objects.filter(
            user_id=user_id,end_time__date =today
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


def vaild_time(start,end):
    now = datetime.now()
    if start == 'none':
        return end > now
    else :
        return end > start and end > now


def login(request):
    data = json.load(request)
    email = data['email']
    password = data['password']
    
    try:
        user_info = UserInfo.objects.get(useremail=email)
        correct_password = user_info.password
        if password == correct_password :
            user_id = user_info.user_id
            username = user_info.username
            data = {
	                "msg" : "success" ,
	                "user_id" : user_id ,
	                "username" : username
                }
            return JsonResponse(data)
        else:
            data = {
	                "msg" : "incorrect password" ,
	                "user_id" : "none" ,
	                "username" : "none"
                }
            return JsonResponse(data) 
    except UserInfo.DoesNotExist:
        data = {
	                "msg" : "email not in database" ,
	                "user_id" : "none" ,
	                "username" : "none"
            }
        return JsonResponse(data)


def add_new_user(request):
    data = json.load(request)
    username = data['username']
    email = data['email']
    password = data['password']

    try:
        user_info = UserInfo.objects.create(
            username=username,
            useremail=email,
            password=password 
        )
        data = {"msg": "success"}
        return JsonResponse(data)
    except Exception as e:
        data = {"msg" : "error", "error_reason": str(e)}
        return JsonResponse(data)


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
    user_id = data['user_id']
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
    print(user_id)
    print(start)
    print(end)
    # print(state)
    # print(description)

    if not vaild_time(start,end):
        return JsonResponse({"msg":"invalid time"})
    
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
        data = {"msg" : "error","error_reason" : str(e)}
        print(str(e))
        return JsonResponse(data)


def add_small_task(request):
    

    data = json.load(request)
    user_id = data['user_id']
    name = data['name']
    end = data['end']
    state = state2num[data["state"]]
    belong = data["belong"]
    description = data["description"]
    end = datetime.strptime(end, "%Y-%m-%d %H:%M")
    
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
                return JsonResponse({"msg": "error", " error_reason": str(e)})
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
            return JsonResponse({"msg": "error.", " error_reason": str(e)})


def get_todolist(request): 
    print(datetime.now())
    data = json.load(request)
    user_id = data['user_id']
    maintask, subtask = get_main_sub_tasks(user_id)
    dailytask = get_today_tasks(user_id)
    data = {
        "maintask" : maintask,
        "subtask" :subtask,
        "dailytask" : dailytask
    }
    return JsonResponse(data)


def change_main_state(request):
    data = json.load(request)
    user_id = data['user_id']
    name = data['name']
    state = state2num[data['state']]
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


def change_small_state(request):
    data = json.load(request)
    user_id = data['user_id']
    name = data['name']
    belong = data['belong']
    state = state2num[data["state"]]
    end = data['end']
    end = datetime.strptime(end, "%Y-%m-%d %H:%M")
    print(data)
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


def send_key(email):
    key = ''.join(random.choice(string.ascii_letters + string.digits) for x in range(6))
    print(key)
    try:
        # 發送電子郵件
        send_mail(
            '驗證碼',  # 標題
            'Hi '+ ' 你的驗證碼是 ' + key,  # 内容
            'b10902235@gapps.ntust.edu.tw',           # 寄件人
            [str(email)],                             # 收件人
            fail_silently=True,                      # 发送失败时是否报错
        )
        result = {"msg": "success", "key": key}
        return result
    except Exception as e:
        result = {"msg": "error", "error_reason": str(e)}
        return result


def vaild_email(email) :
    pat = '^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$'
    if re.search(pat, email):
        return True
    else:
        return False
    

def sign_up(request):
    data = json.load(request)
    email = data['email']
    
    if UserInfo.objects.filter(useremail=email).exists():
        return JsonResponse({"msg": "this email already exist", "key" : "none"})
    else:
        if vaild_email(email) :
            result = send_key(email)
            return JsonResponse(result)
        else :
            return JsonResponse({"msg": "invaild email", "key" : "none"})
    

def forget_send(request):
    data = json.load(request)
    email = data['email']
    if not vaild_email(email) :
        return JsonResponse({"msg": "email error", "key" : "none"})
    if UserInfo.objects.filter(useremail=email).exists():
        result = send_key(email)
        return JsonResponse(result)
    else:
        return JsonResponse({"msg": "this email has not registered yet", "key" : "none"})
    

def change_password(request):
    data = json.load(request)
    user_id = data['user_id']
    email = data['email']
    new_password = data['new_password']
    if email == 'none' :
        try:
            user = get_object_or_404(UserInfo, user_id = user_id)
            
            user.password = new_password
            user.save()
            return JsonResponse({"msg": "success"})
        except Exception as e:
            return JsonResponse({"msg": "error", "error_reason": str(e)})
    else :
        try:
            user = get_object_or_404(UserInfo, useremail = email)
            
            user.password = new_password
            user.save()
            return JsonResponse({"msg": "success"})
        except Exception as e:
            return JsonResponse({"msg": "error", "error_reason": str(e)})


def search_dailytasks(user_id, date, keyword):
    try:
        # 查詢該日的 dailytask 
        if date == 'none':
            smalltasks = Dailytask.objects.filter(
                user_id=user_id,task_name__icontains=keyword
            )
        elif keyword == 'none' :
            smalltasks = Dailytask.objects.filter(
                user_id=user_id,end_time__date=date
            )
        else:
            smalltasks = Dailytask.objects.filter(
                user_id=user_id,end_time__date=date,task_name__icontains=keyword
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
        return result
    except :
        response = {"msg": "error"}
        return JsonResponse(response)


def search_subtasks(user_id, date, keyword):
    
    # 獲得該用戶所有主任務
    # given_datetime.strftime('%Y-%m-%d %H:%M:%S')
    try:
        maintasks = Maintask.objects.filter(user_id=user_id)
        date_subtask = []
        for maintask in maintasks:
            
            # 獲得主任務的所有子任務
            maintask_id = maintask.maintask_id
            if date == 'none':
                subtasks = Subtask.objects.filter(maintask_id=maintask_id,task_name__icontains=keyword)
            elif keyword == 'none':
                subtasks = Subtask.objects.filter(maintask_id=maintask_id,end_time__date=date)
            else: 
                subtasks = Subtask.objects.filter(maintask_id=maintask_id,end_time__date=date,task_name__icontains=keyword)
            for subtask in subtasks:
                subtask_data = {
                    "name": subtask.task_name,
                    "state": num2state[subtask.state],
                    "end": subtask.end_time.strftime('%Y-%m-%d %H:%M'),
                    "belong" : maintask.maintask_name,
                    "description": subtask.description
                }
                date_subtask.append(subtask_data)
                
        return date_subtask
    except:
        return 'error'


def search_task(request):
    data = json.load(request)
    user_id = data['user_id']
    date = data['date']
    keyword = data['keyword']
    print(data)
    daily_result = search_dailytasks(user_id, date, keyword)
    sub_result = search_subtasks(user_id, date, keyword)
    # print(daily_result)
    # print(sub_result)
    if daily_result != 'error' and sub_result != 'error':
        return JsonResponse({'msg' : 'success', 'dailytask' : daily_result, 'subtask' : sub_result})
    else:
        return JsonResponse({'msg' : 'error'})
        
'''
def verify_key(request):
    data = json.load(request)
    email = data['email']
    key = data['key']
    user = get_object_or_404(UserInfo, useremail = email)
    correct_key = user.key
    if key == correct_key :
        return JsonResponse({"msg": "success"})
    else :
        return JsonResponse({"msg": "fail"})
'''
'''
def sign_up_sess(request):
    data = json.load(request)
    email = data['email']

    if UserInfo.objects.filter(useremail=email).exists():
        return JsonResponse({"msg": "this email already exist", "key" : "none"})
    
    if vaild_email(email) :
        result = send_key(email)
        if result['msg'] == 'success':
            session_id = str(uuid.uuid4())
            return JsonResponse(result)
    else :
        return JsonResponse({"msg": "invaild email", "key" : "none"})
'''