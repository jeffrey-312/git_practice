from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import tasklist
import json
# Create your views here.

def index(request):
    # response_messages = ['aaa', 'bbb']
    messages = tasklist.objects.get(user_id=1)  # 到資料庫讀取user_id=1的該筆資料
    array_data = messages.array_data  # 獲得該筆資料中的 array_data

    # print('messages: ',messages)
    # print('array_data: ',array_data)
    # array_data.append('aaa')
    # print('new_array_data: ',array_data)
    # messages = []
    return render(request, 'index.html', {'response_messages': array_data})

def add(request):
    add_task = request.POST.get('message', '')
    if add_task:
        messages = tasklist.objects.get(user_id=1)
        # array_data = messages.array_data 
        messages.array_data.append(add_task)
        messages.save()
    # print('new_messages: ',messages.array_data)
    return redirect('/')

def delete(request):
    delete_task = request.POST.get('selected_text', '')
    delete_task = json.loads(delete_task)
    print('delete_task: ',delete_task)
    if delete_task:
        messages = tasklist.objects.get(user_id=1)
        for i in delete_task:
            messages.array_data.remove(i)
        messages.save()
        
    return redirect('/')