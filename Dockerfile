# 使用 ubuntu:20.04 
FROM ubuntu:20.04

# 設置環境變量以防止 apt-get 要求輸入
ENV DEBIAN_FRONTEND=noninteractive

# 更新包列表並安裝基本工具和依賴
RUN apt-get update && \
    apt-get install -y python3.8 python3-pip git cron rsyslog pkg-config libmysqlclient-dev debconf-utils

# 配置 postfix 的安裝選項
RUN echo "postfix postfix/mailname string your.hostname.com" | debconf-set-selections && \
    echo "postfix postfix/main_mailer_type string 'No configuration'" | debconf-set-selections && \
    apt-get install -y postfix

# 安裝 pipenv
RUN pip3 install pipenv

# 設置工作目錄
WORKDIR /django_project

# 複製項目文件到容器中
COPY . .

# 安裝項目依賴
RUN pipenv install

# 啟動 rsyslog 和 cron 服務
RUN service rsyslog start && service cron start

ENV EMAIL_HOST_USER='default_user@example.com'
ENV EMAIL_HOST_PASSWORD='default_password'
ENV db_host=35.189.180.59
ENV db_port=33306
ENV line_ip=https://5de5-2001-b400-e3ae-2c09-dcc1-f3e5-5679-1c.ngrok-free.app/notification
ENV db_password=

# 將環境變量導出到 /etc/environment 以便 cron 使用
RUN printenv | grep -v "no_proxy" >> /etc/environment

# 添加 crontab 任務
RUN echo "*/1 * * * * cd /django_project && /usr/local/bin/pipenv run python3 ./back/manage.py check_task_deadlines" > /etc/cron.d/my_custom_cron
RUN chmod 0644 /etc/cron.d/my_custom_cron
RUN crontab /etc/cron.d/my_custom_cron

# 開放端口
EXPOSE 8000

# 啟動所有服務並保持容器運行
CMD ["sh", "-c", "service rsyslog start && service cron start && pipenv run python3 ./back/manage.py runserver 0.0.0.0:8000"]

