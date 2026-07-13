# ExamHub 部署文档

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、部署架构

```

┌──────────────┐     ┌──────────────┐
│   CDN        │◄────│   浏览器      │
│ 静态资源/加速 │     │  (用户访问)   │
└──────┬───────┘     └──────┬───────┘
       │                    │
       ▼                    ▼
┌──────────────────────────────────────────┐
│           Nginx / 反向代理                │
│     SSL 终止 / 静态文件 / API 代理         │
│     examhub.com / api.examhub.com        │
└────────┬────────────────────┬────────────┘
         │                    │
         ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Node.js App     │  │  Node.js App     │
│  (主实例)         │  │  (备实例)        │
│  Express + TS    │  │  Express + TS    │
│  端口 :3000      │  │  端口 :3001      │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └────────┬────────────┘
                  │
                  ▼
    ┌─────────────────────────┐
    │         Redis           │
    │  缓存 / Session / 锁    │
    │  端口 :6379             │
    └────────┬──────┬─────────┘
             │      │
             ▼      ▼
    ┌──────────┐  ┌──────────┐
    │ Database  │  │   OSS   │
    │  PG/MySQL │  │  对象存储 │
    └──────────┘  └──────────┘

```

---

## 二、环境规划

### 2.1 环境列表

| 环境 | 域名 | 用途 | 配置要求 |
|------|------|------|---------|
| 开发 | localhost | 本地开发 | 最低配置 |
| 测试 | test.examhub.com | 集成测试 | 1C2G |
| 预发布 | staging.examhub.com | 上线前验证 | 2C4G |
| 生产 | examhub.com | 正式运行 | 4C8G x 2 实例 |

### 2.2 环境变量配置

> **注意：** 应用层配置直接书写在 `src/config/` 模块中（参考 `config/env.ts`），不从 `process.env` 获取。下方变量清单仅作为部署期基础设施（数据库、Redis 等）的连接信息参考，应用模块按需在 config 中直接书写。

```bash
# 应用
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1

# 域名
DOMAIN=examhub.com
API_DOMAIN=api.examhub.com
CDN_DOMAIN=cdn.examhub.com
ADMIN_DOMAIN=admin.examhub.com

# 数据库
DB_HOST=
DB_PORT=5432
DB_NAME=examhub
DB_USER=
DB_PASSWORD=

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# OSS
OSS_REGION=
OSS_BUCKET=examhub
OSS_ACCESS_KEY=
OSS_SECRET_KEY=
OSS_ENDPOINT=

# 微信支付
WECHAT_APP_ID=
WECHAT_MCH_ID=
WECHAT_API_KEY=
WECHAT_CERT_PATH=

# 短信
SMS_PROVIDER=
SMS_API_KEY=
SMS_TEMPLATE_ID=

# 邮件
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 三、Docker 部署

### 3.1 Docker Compose（生产）

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    restart: always
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./sql/init:/docker-entrypoint-initdb.d
    environment:
      POSTGRES_DB: examhub
      POSTGRES_USER: examhub
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - '5432:5432'
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    ports:
      - '6379:6379'
    restart: always

volumes:
  pgdata:
  redisdata:
```

### 3.2 Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

### 3.3 .dockerignore

```
node_modules
.git
.gitignore
.env
.env.*
*.md
tests/
docs/
```

---

## 四、Nginx 配置

```nginx
upstream app_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001 backup;
}

server {
    listen 443 ssl http2;
    server_name examhub.com api.examhub.com;

    ssl_certificate /etc/ssl/examhub/fullchain.pem;
    ssl_certificate_key /etc/ssl/examhub/privkey.pem;

    # 静态文件
    location /static/ {
        root /var/www/examhub;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    # 前端 SPA
    location / {
        root /var/www/examhub/dist;
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 20M;
}

server {
    listen 80;
    server_name examhub.com api.examhub.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 五、CI/CD 流程

### 5.1 GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t examhub/app:latest .
      - name: Push to Registry
        run: docker push examhub/app:latest
      - name: Deploy to Server
        run: |
          ssh deploy@server "docker pull examhub/app:latest && docker-compose up -d app"
```

> **注**：`${{ github.sha }}` 在 GitHub Actions 中用于版本标签，实际部署时替换。生产环境建议使用 Git SHA 或语义版本标签。

---

## 六、监控与告警

| 维度 | 监控工具 | 指标 |
|------|---------|------|
| 应用 | Sentry | 错误率、性能追踪 |
| 服务器 | Prometheus + Grafana | CPU/内存/磁盘/网络 |
| 数据库 | pg_stat_monitor | 慢查询、连接数、IO |
| Redis | Redis INFO | 内存、命中率 |
| 可用性 | UptimeRobot | HTTP 状态码、响应时间 |
| 日志 | ELK / Loki | 集中日志管理 |

### 6.1 健康检查接口

```
GET /health
Response: { "status": "ok", "timestamp": "...", "uptime": 12345 }
GET /health/ready
Response: { "status": "ok", "db": true, "redis": true, "oss": true }
```

---

## 七、备份策略

| 数据 | 频率 | 保留策略 | 存储位置 |
|------|------|---------|---------|
| 数据库 | 每日全量 + 每小时 WAL | 全量保留 30 天 | OSS + 异地 |
| 上传文件 | 实时同步 | 永久 | OSS（自带冗余） |
| 配置文件 | Git 管理 | 随代码库 | Git |
| SSL 证书 | 到期前 30 天自动续期 | — | Certbot |

---

*本文档定义 ExamHub 的部署方案。OSS 配置见 `docs/deployment/OSS.md`，缓存策略见 `docs/deployment/Cache.md`。*
