import datetime
import requests
import logging
from django.utils import timezone
from .models import Maintask, Subtask, Dailytask

from django.conf import settings

import os
import environ

PROJECT_PATH = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT, PROJECT_MODULE_NAME = os.path.split(PROJECT_PATH)

env_file = '.env'
env = environ.Env()
env.read_env(env_file=os.path.join(PROJECT_ROOT, env_file))
line_ip = env('line_ip')


logger = logging.getLogger(__name__)


def send_message(line_id, task_name, type):
    if line_id:
        message = '通知: ' + str(type) + ' ' + str(task_name) + ' 可完成剩餘不到十分鐘'
        json_data = {
            'line_id': line_id,
            'message': message
        }
        # url = 'https://5de5-2001-b400-e3ae-2c09-dcc1-f3e5-5679-1c.ngrok-free.app/notification'
        url = line_ip
        try:
            response = requests.post(url, json=json_data)
            response.raise_for_status()
            logger.info("Successfully sent message for task to user.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send message: {e}")
    else:
        logger.warning("User does not have a line_id")

def check_task_deadlines():
    now = timezone.now()
    seven_days_ago = now - datetime.timedelta(days=7)
    ten_minutes_from_now = now + datetime.timedelta(minutes=10)

    # 檢查任務是否過期
    maintask_updated = Maintask.objects.filter(end_time__lt=now, state=0).update(state=2)
    subtask_updated = Subtask.objects.filter(end_time__lt=now, state=0).update(state=2)
    dailytask_updated = Dailytask.objects.filter(end_time__lt=now, state=0).update(state=2)

    logger.info(f"Updated {maintask_updated} maintasks, {subtask_updated} subtasks, and {dailytask_updated} dailytasks to state 2.")

    # 刪除七天前的任務
    maintask_deleted, _ = Maintask.objects.filter(end_time__lt=seven_days_ago).delete()
    subtask_deleted, _ = Subtask.objects.filter(end_time__lt=seven_days_ago).delete()
    dailytask_deleted, _ = Dailytask.objects.filter(end_time__lt=seven_days_ago).delete()

    logger.info(f"Deleted {maintask_deleted} maintasks, {subtask_deleted} subtasks, and {dailytask_deleted} dailytasks older than seven days.")

    # 剩餘時間不到十分鐘
    maintasks_near_deadline = Maintask.objects.filter(end_time__lte=ten_minutes_from_now, end_time__gt=now, state=0)
    for task in maintasks_near_deadline:
        send_message(task.user.line_id, task.maintask_name, '主任務')

    subtasks_near_deadline = Subtask.objects.filter(end_time__lte=ten_minutes_from_now, end_time__gt=now, state=0)
    for task in subtasks_near_deadline:
        send_message(task.maintask.user.line_id, task.task_name, '子任務')

    dailytasks_near_deadline = Dailytask.objects.filter(end_time__lte=ten_minutes_from_now, end_time__gt=now, state=0)
    for task in dailytasks_near_deadline:
        send_message(task.user.line_id, task.task_name, '本日任務')

    logger.info('Task deadline check completed.')

    
def aa():
    print(line_ip)