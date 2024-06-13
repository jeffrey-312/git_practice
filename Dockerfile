# 使用 node 作為基礎映像來構建應用
FROM node:20.13.1 AS builder

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

COPY .env ./

# 安裝依賴
RUN npm install

# 複製應用程序代碼
COPY . .

# 構建應用並输出日志
RUN npm run build || cat /root/.npm/_logs/*-debug.log

# 使用 Nginx 作為基礎映像來運行應用
FROM nginx:alpine

# 刪除默認的 Nginx 靜態文件
RUN rm -rf /usr/share/nginx/html/*

# 從 builder 映像中複製構建結果到 Nginx 靜態文件目錄
COPY --from=builder /app/.next /usr/share/nginx/html/_next
COPY --from=builder /app/public /usr/share/nginx/html

# 複製 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3000

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
