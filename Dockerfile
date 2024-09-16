# 使用archlinux基础镜像
FROM archlinux:latest

# 设置大陆时区
ENV TZ Asia/Shanghai

# 设置工作目录
WORKDIR /Web

# 将本地的所有文件复制到工作目录
COPY . .

# 安装依赖
RUN chmod -R 777 /Web
RUN pacman -Syu --noconfirm
RUN pacman -S --noconfirm nodejs npm
RUN npm install -g pnpm
RUN pnpm install -P

# 暴露端口
EXPOSE 7860

# 启动！
CMD ["node", "app.js"]