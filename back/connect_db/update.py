from .models import Maintask, Subtask, Dailytask
from datetime import datetime

def check_task_deadlines():
    
    # now = timezone.now()
 
    now = datetime.now()
 
    Maintask.objects.filter(end_time__lt=now, state=0).update(state=2)
    
    Subtask.objects.filter(end_time__lt=now, state=0).update(state=2)
    
    Dailytask.objects.filter(end_time__lt=now, state=0).update(state=2)