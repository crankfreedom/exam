# ExamHub 对象存储（OSS）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

OSS（Object Storage Service）作为 ExamHub 的文件存储底座，负责存储和管理所有静态文件和生成内容。

---

## 二、存储内容

| 存储内容 | 路径前缀 | 公开/私有 | 说明 |
|---------|---------|:---------:|------|
| PDF 缓存 | /pdf/ | 私有 | 按需生成的 PDF 缓存 |
| 商品封面 | /images/products/ | 公开 | 商品封面图 |
| 题目图片 | /images/questions/ | 公开 | 题目中嵌入的图片 |
| 用户头像 | /images/avatars/ | 公开 | 用户头像 |
| Banner 图片 | /images/banners/ | 公开 | 首页轮播图 |
| 新闻封面 | /images/news/ | 公开 | 资讯封面 |
| 导入文件 | /imports/ | 私有 | 管理员上传的导入文件 |
| 系统备份 | /backups/ | 私有 | 数据库备份 |

---

## 三、Bucket 结构

`
examhub/
├── pdf/
│   ├── P000001/
│   │   ├── v1.pdf
│   │   └── v2.pdf
│   └── C000001/
│       └── v1.pdf
├── images/
│   ├── products/
│   │   └── PR000001-cover.jpg
│   ├── questions/
│   │   └── Q000001-img-1.png
│   ├── avatars/
│   │   └── U000001-avatar.jpg
│   ├── banners/
│   │   └── banner-001.jpg
│   └── news/
│       └── news-001.jpg
├── imports/
│   └── 2024/
│       └── 01/
│           └── admin-import-20240101.json
└── backups/
    └── db-examhub-2024-01-01.sql.gz
`

---

## 四、访问控制

### 4.1 公开文件

| 策略 | 说明 |
|------|------|
| 公开读 | 所有人可读 |
| 禁止写 | 仅通过后端上传 |
| CDN 加速 | 通过 CDN 域名访问 |

### 4.2 私有文件（PDF）

| 策略 | 说明 |
|------|------|
| 私有读写 | 不允许公开访问 |
| 临时签名 URL | 授权用户通过签名 URL 访问 |
| 有效期 | 签名 URL 有效期 5 分钟 |
| IP 限制 | 可绑定 IP 白名单 |

### 4.3 签名 URL 生成

`	ypescript
// 生成签名 URL
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: 'examhub',
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}
`

---

## 五、CDN 配置

| 配置项 | 值 |
|--------|-----|
| CDN 服务商 | 阿里云 CDN / Cloudflare / 其他 |
| 加速域名 | cdn.examhub.com |
| 源站 | OSS Bucket |
| 缓存策略 | 图片 30 天，PDF 不缓存 |

---

## 六、上传流程

`mermaid
sequenceDiagram
    Frontend->>Backend: POST /api/upload/image
    Backend->>Backend: 校验文件类型和大小
    Backend->>OSS: 上传文件
    OSS-->>Backend: 返回 URL
    Backend-->>Frontend: 返回图片 URL
    Frontend->>Frontend: 显示图片
`

### 6.1 文件上传限制

| 限制 | 值 |
|------|-----|
| 图片格式 | JPG / PNG / WebP / GIF |
| 图片大小 | ≤ 5MB |
| 图片尺寸 | ≤ 4096 × 4096 |
| 导入文件 | JSON/MD ≤ 10MB, DOCX ≤ 20MB |
| PDF | 不限制（由服务器生成） |

---

## 七、OSS 配置项

| 配置项 | 说明 |
|--------|------|
| OSS_REGION | 区域 |
| OSS_BUCKET | Bucket 名称 |
| OSS_ACCESS_KEY | Access Key |
| OSS_SECRET_KEY | Secret Key |
| OSS_ENDPOINT | Endpoint |
| OSS_CDN_DOMAIN | CDN 加速域名 |
| OSS_PUBLIC_URL | 公开文件访问基础 URL |

---

*本文档定义 OSS 配置和使用规范。缓存策略见 \docs/deployment/Cache.md\，部署架构见 \docs/deployment/Deploy.md\。*
