from django.db import models

# Create your models here.


class tasklist(models.Model):
    user_id = models.IntegerField(primary_key=True)
    array_data = models.JSONField()

    class Meta:
        db_table = 'task_list'
