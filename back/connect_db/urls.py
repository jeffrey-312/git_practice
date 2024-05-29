from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    
    path('add_new_user/',views.add_new_user),
    path('login/',views.login),
    path('add_maintask/',views.add_maintask),
    path('add_small_task/',views.add_small_task),
    path('get_todolist/',views.get_todolist),
    path('change_main_state/',views.change_main_state),
    path('change_small_state/',views.change_small_state),
    path('sign_up/',views.sign_up),
    path('forget_send/',views.forget_send),
    path('change_password/',views.change_password),
    path('search_task/',views.search_task),
]

'''
    path('', views.index, name = 'index'),
    path('login_index/',views.login_index),
    path('login/',views.login),
    path('add/',views.add),
    path('delete/',views.delete),
'''