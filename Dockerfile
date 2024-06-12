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


# 添加 crontab 任務
RUN python3 ./back/manage.py crontab add

# 開放端口
EXPOSE 8000

# 啟動 Django 服務
CMD ["pipenv", "run", "python3", "./back/manage.py", "runserver", "0.0.0.0:8000"]

