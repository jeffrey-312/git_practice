from django.http import HttpResponse

from connect_db.models import Dailytask, Subtask, UserInfo, Maintask
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import json
from datetime import datetime, date

from connect_db.views import get_main_sub_tasks, get_today_tasks

state2num = { 'processing' : 0, 'complete' : 1, 'fail' : 2, 'delete' : 3 } 
num2state = { 0 : 'processing', 1 : 'complete', 2 : 'fail' } 



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
        else:
            data = {"msg" : "maintask doesn't exist"}
            return JsonResponse(data)

    if Subtask.objects.filter(task_name=name, end_time=end, maintask_id = maintask_id).exists():
        data = {"msg": "this subtask already exist"}
        return JsonResponse(data)  
    else:
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
        maintask, subtask = get_main_sub_tasks(user_id)
        dailytask = get_today_tasks(user_id)
        data = {
            "subtask" :subtask,
            "dailytask" : dailytask
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({"msg": "error", "error_reason": str(e)})
    