#!/usr/bin/env bash
# ============================================
# 银行系统 - 一键部署脚本
# 用法:
#   cp deploy/.env.example deploy/.env
#   vim deploy/.env           # 填写真实生产环境参数
#   bash deploy/deploy.sh     # 一键部署
# ============================================
set -euo pipefail

# 颜色
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 项目根目录（脚本所在位置往上两级：deploy/ → bank/）
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

info "========================================"
info "银行系统 一键部署"
info "项目路径: $PROJECT_DIR"
info "========================================"

# =====================
# 1. 检查 .env 配置
# =====================
ENV_FILE="$PROJECT_DIR/deploy/.env"
if [ ! -f "$ENV_FILE" ]; then
    err "缺少 deploy/.env 配置文件！
    请执行以下步骤：
      cp deploy/.env.example deploy/.env
      vim deploy/.env    # 填写数据库、Redis 等生产环境参数"
fi
source "$ENV_FILE"
ok "已加载 .env 配置文件"

# =====================
# 2. 检查 & 自动安装依赖
# =====================
info "检查依赖..."

# 检测包管理器
PKG_MANAGER=""
INSTALL_CMD=""
if command -v dnf &>/dev/null; then
    PKG_MANAGER="dnf"; INSTALL_CMD="sudo dnf install -y"
elif command -v yum &>/dev/null; then
    PKG_MANAGER="yum"; INSTALL_CMD="sudo yum install -y"
elif command -v apt &>/dev/null; then
    PKG_MANAGER="apt"; INSTALL_CMD="sudo apt install -y"
    sudo apt update -y 2>/dev/null || true
fi

# 检查并自动安装
# 用法: ensure <命令> [包名1 包名2 ...]
ensure() {
    local cmd=$1; shift
    if ! command -v "$cmd" &>/dev/null; then
        info "缺少 $cmd，正在安装..."
        if [ -n "$INSTALL_CMD" ]; then
            $INSTALL_CMD "$@" || err "安装 $cmd 失败，请手动安装"
            command -v "$cmd" &>/dev/null || err "安装 $cmd 后仍未检测到，请检查"
            ok "$cmd 已安装"
        else
            err "需要 $cmd，请手动安装：
  CentOS: dnf install -y $*
  Ubuntu: apt install -y $*"
        fi
    else
        ok "$cmd 已存在"
    fi
}

ensure java   java-11-openjdk-devel
ensure javac  java-11-openjdk-devel
ensure mvn    maven
ensure node   nodejs
ensure npm    npm

# 如果 npm 还没装上（某些 CentOS 需要单独装 npm 包）
command -v npm &>/dev/null || ensure npm npm

# =====================
# 3. 选择部署模式
# =====================
USE_DOCKER=false
if command -v docker &>/dev/null && command -v docker-compose &>/dev/null; then
    echo ""
    echo "检测到 Docker，请选择部署模式："
    echo "  1) 直接部署（推荐）— 使用 systemd + Java 直接运行"
    echo "  2) Docker Compose  — 容器化运行后端"
    read -rp "请输入 [1/2] (默认 1): " DEPLOY_MODE
    if [ "${DEPLOY_MODE:-1}" = "2" ]; then
        USE_DOCKER=true
        info "部署模式: Docker Compose"
    else
        info "部署模式: 直接部署 (systemd)"
    fi
else
    info "未检测到 Docker，使用直接部署模式 (systemd)"
fi

# =====================
# 4. 构建前端
# =====================
info "===== 构建前端 ====="
cd "$PROJECT_DIR/bank-frontend"

if [ ! -f "node_modules/.bin/vue-cli-service" ]; then
    info "安装 npm 依赖..."
    npm install
    ok "npm 依赖安装完成"
fi

info "构建前端..."
VUE_APP_BASE_API=/bank/api npm run build
ok "前端构建完成 (bank-frontend/dist/)"

# =====================
# 5. 构建后端
# =====================
info "===== 构建后端 ====="
cd "$PROJECT_DIR/bank-backend"

info "Maven 打包 (跳过测试)..."
mvn clean package -Dmaven.test.skip=true -q
ok "后端构建完成"

# 定位 JAR
JAR_FILE=$(ls target/*.jar 2>/dev/null | head -1)
if [ -z "$JAR_FILE" ]; then
    err "未找到 target/*.jar，构建可能失败"
fi
ok "JAR: $JAR_FILE"

# =====================
# 6. 部署目录准备
# =====================
FRONTEND_DIR="/var/www/bank"
BACKEND_DIR="/opt/bank-backend"
NGINX_CONF_DIR="/etc/nginx/conf.d"

info "===== 部署到服务器 ====="
info "前端目录: $FRONTEND_DIR"
info "后端目录: $BACKEND_DIR"

# 创建目录（需要 sudo）
sudo mkdir -p "$FRONTEND_DIR/dist"
sudo mkdir -p "$BACKEND_DIR"
sudo mkdir -p /opt/bank/log

# =====================
# 7. 部署前端
# =====================
info "部署前端静态文件..."
sudo cp -r "$PROJECT_DIR/bank-frontend/dist/"* "$FRONTEND_DIR/dist/"
ok "前端文件已部署至 $FRONTEND_DIR/dist"

# =====================
# 8. 部署后端配置
# =====================
info "生成生产配置..."
# 使用 envsubst 将 deploy/application-prod.yml 中的 ${VAR} 替换为实际值
if command -v envsubst &>/dev/null; then
    export BACKEND_PORT DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD
    export REDIS_HOST REDIS_PORT REDIS_PASSWORD
    export JWT_SECRET AES_KEY
    envsubst < "$PROJECT_DIR/deploy/application-prod.yml" | sudo tee "$BACKEND_DIR/application-prod.yml" > /dev/null
    ok "配置文件已生成 (envsubst)"
else
    warn "未找到 envsubst，使用 sed 替换..."
    sudo cp "$PROJECT_DIR/deploy/application-prod.yml" "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${BACKEND_PORT}/$BACKEND_PORT/g"     "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${DB_HOST}/$DB_HOST/g"               "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${DB_PORT}/$DB_PORT/g"               "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${DB_NAME}/$DB_NAME/g"               "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${DB_USER}/$DB_USER/g"               "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${DB_PASSWORD}/$DB_PASSWORD/g"       "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${REDIS_HOST}/$REDIS_HOST/g"         "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${REDIS_PORT}/$REDIS_PORT/g"         "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${REDIS_PASSWORD}/$REDIS_PASSWORD/g" "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${JWT_SECRET}/$JWT_SECRET/g"         "$BACKEND_DIR/application-prod.yml"
    sudo sed -i "s/\${AES_KEY}/$AES_KEY/g"               "$BACKEND_DIR/application-prod.yml"
    ok "配置文件已生成 (sed)"
fi

# =====================
# 9. 部署后端
# =====================
if [ "$USE_DOCKER" = true ]; then
    # ---- Docker Compose 模式 ----
    info "部署后端 (Docker Compose)..."
    cd "$PROJECT_DIR/deploy"
    sudo docker-compose -f docker-compose.yml --env-file .env up -d --build
    ok "后端 Docker 容器已启动"
else
    # ---- 直接部署模式 ----
    info "部署后端 JAR..."
    sudo cp "$JAR_FILE" "$BACKEND_DIR/app.jar"
    ok "JAR 已复制至 $BACKEND_DIR/app.jar"

    # 创建/更新 systemd 服务
    SERVICE_FILE="/etc/systemd/system/bank-backend.service"
    if [ ! -f "$SERVICE_FILE" ]; then
        info "安装 systemd 服务..."
        sudo cp "$PROJECT_DIR/deploy/bank-backend.service" "$SERVICE_FILE"
        sudo systemctl daemon-reload
        sudo systemctl enable bank-backend
        ok "systemd 服务已安装"
    fi

    info "启动后端..."
    sudo systemctl restart bank-backend
    ok "后端服务已启动 (bank-backend)"

    # 等待后端启动
    info "等待后端启动..."
    for i in $(seq 1 30); do
        if curl -s "http://127.0.0.1:$BACKEND_PORT/" > /dev/null 2>&1; then
            ok "后端已就绪 (端口 $BACKEND_PORT)"
            break
        fi
        if [ "$i" -eq 30 ]; then
            warn "后端启动可能较慢，请手动检查: sudo journalctl -u bank-backend -f"
        fi
        sleep 2
    done
fi

# =====================
# 10. 部署 nginx 配置
# =====================
info "部署 nginx 配置..."
NGINX_SRC="$PROJECT_DIR/deploy/nginx/bank-locations.config"
NGINX_TARGET="$NGINX_CONF_DIR/bank-locations.config"

if [ -d "$NGINX_CONF_DIR" ]; then
    info "部署 nginx 配置..."
    sudo cp "$NGINX_SRC" "$NGINX_TARGET"
    # 替换前端文件路径
    sudo sed -i "s|/var/www/bank/dist|${FRONTEND_DIR}/dist|g" "$NGINX_TARGET"
    # 替换后端代理端口
    sudo sed -i "s|proxy_pass http://127.0.0.1:8080/api/|proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/|g" "$NGINX_TARGET"

    # 检查 nginx 配置
    if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
        sudo systemctl reload nginx || sudo nginx -s reload || true
        ok "nginx 配置已生效"
    else
        warn "nginx 配置测试失败，请手动检查: sudo nginx -t"
        warn "如果与 cloud.conf 冲突（重复 server_name），请手动合并 location"
    fi
else
    warn "未找到 nginx 配置目录 ($NGINX_CONF_DIR)，请手动配置 nginx"
    warn "参考文件: $NGINX_SRC"
fi

# =====================
# 11. 完成
# =====================
cd "$PROJECT_DIR"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  前端地址: http://${SERVER_NAME:-localhost}:${NGINX_PORT:-80}/bank/"
echo "  API 接口: http://${SERVER_NAME:-localhost}:${NGINX_PORT:-80}/bank/api/"
echo ""

if [ "$USE_DOCKER" = true ]; then
    echo "  后端容器: sudo docker logs -f bank-backend"
else
    echo "  后端日志: sudo journalctl -u bank-backend -f"
fi
echo "  nginx:    sudo nginx -s reload"
echo ""

info "提示：如有防火墙，请确保开放以下端口："
echo "  - ${NGINX_PORT:-80} (HTTP)"
echo "  - ${BACKEND_PORT:-8080} (后端，如非 Docker 部署)"

# 显示当前进程状态
echo ""
info "当前状态："
if systemctl is-active --quiet bank-backend 2>/dev/null; then
    ok "  bank-backend 服务: 运行中"
elif [ "$USE_DOCKER" = true ] && docker ps --format '{{.Names}}' | grep -q "bank-backend" 2>/dev/null; then
    ok "  bank-backend 容器: 运行中"
else
    warn "  后端暂未运行，请检查日志"
fi

if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
    ok "  nginx 配置: 正常"
else
    warn "  nginx 配置: 异常，请检查"
fi
