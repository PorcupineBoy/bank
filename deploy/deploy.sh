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
# 2. 检查依赖
# =====================
info "检查依赖..."
command -v java   >/dev/null 2>&1 || err "需要 Java 8+，请先安装 openjdk-8-jre"
command -v javac  >/dev/null 2>&1 || err "需要 JDK，请先安装 openjdk-8-jdk"
command -v mvn    >/dev/null 2>&1 || err "需要 Maven，请先安装 maven"
command -v node   >/dev/null 2>&1 || err "需要 Node.js，请先安装 nodejs"
command -v npm    >/dev/null 2>&1 || err "需要 npm，请先安装 npm"
ok "依赖检查通过"

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

if [ ! -d "node_modules" ]; then
    info "安装 npm 依赖..."
    npm install --production
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
mvn clean package -DskipTests -q
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
NGINX_SRC="$PROJECT_DIR/deploy/nginx/bank.conf"
NGINX_TARGET="$NGINX_CONF_DIR/bank.conf"

if [ -d "$NGINX_CONF_DIR" ]; then
    info "=============================="
    info "nginx 配置需手动添加到你的 cloud.conf"
    info "配置内容参考: $NGINX_SRC"
    info ""
    info "执行以下命令查看并复制 location 片段："
    info "  cat $NGINX_SRC"
    info ""
    info "复制后，将 = /bank、^~ /bank/、^~ /bank/api/ 三个 location"
    info "粘贴到 cloud.conf 的 server 块中，然后执行："
    info "  sudo nginx -t && sudo systemctl reload nginx"
    info "=============================="
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
