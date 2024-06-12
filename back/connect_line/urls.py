from django.shortcuts import render

# Create your views here.

from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    
    path('add_user/',views.add_user),
    path('add_small_task/',views.add_small_task),
    path('change_small_state/',views.change_small_state),
    path('get_todolist/',views.get_todolist),
    path('add_maintask/',views.add_maintask),
    path('change_main_state/',views.change_main_state),
    path('login/',views.login),
]