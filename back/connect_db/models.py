from django.db import models
import uuid
# Create your models here.

   
# User info model
class UserInfo(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=30, unique=False)
    useremail = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=256)

    def __str__(self):
        return self.username
    class Meta:
        # 定義table名稱。
        db_table = 'UserInfo'

# Maintask model
class Maintask(models.Model):
    maintask_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(UserInfo, on_delete=models.CASCADE)
    maintask_name = models.CharField(max_length=30, unique=True)
    state = models.IntegerField(default=0)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    description = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.maintask_name
    class Meta:
        db_table = 'Maintask'
    def save(self, *args, **kwargs):
        # 去掉 start_time 和 end_time 的微秒部分
        if self.start_time:
            self.start_time = self.start_time.replace(microsecond=0)
        if self.end_time:
            self.end_time = self.end_time.replace(microsecond=0)
        super().save(*args, **kwargs)

# Subtask model
class Subtask(models.Model):
    subtask_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    maintask = models.ForeignKey(Maintask, on_delete=models.CASCADE)
    task_name = models.CharField(max_length=30, unique=True)
    state = models.IntegerField(default=0)
    end_time = models.DateTimeField()
    description = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.task_name
    class Meta:
        db_table = 'Subtask'
    def save(self, *args, **kwargs):
        # 去掉 end_time 的微秒部分
        if self.end_time:
            self.end_time = self.end_time.replace(microsecond=0)
        super().save(*args, **kwargs)

# Dailytask model
class Dailytask(models.Model):
    dailytask_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(UserInfo, on_delete=models.CASCADE)
    task_name = models.CharField(max_length=30)
    state = models.IntegerField(default=0)
    end_time = models.DateTimeField()
    description = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.task_name
    class Meta:
        db_table = 'Dailytask'
    def save(self, *args, **kwargs):
        # 去掉 start_time 和 end_time 的微秒部分
        if self.end_time:
            self.end_time = self.end_time.replace(microsecond=0)
        super().save(*args, **kwargs)