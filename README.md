---

## 📦 Wheel 框架使用文档

### 1. 项目简介

`Wheel` 是一个轻量级的 Node.js HTTP 路由框架，基于原生 `http` 模块实现，支持：

- RESTful 路由注册（GET / POST）
- 静态资源服务（如 `/static/` 路径映射）
- 文件上传解析（通过 `busboy`）
- CORS 中间件支持
- 自定义中间件和响应方法扩展

适合用于构建小型 API 服务或 Web 应用后端。

---

### 2. 安装与依赖

### 安装方式

```bash
npm install wheel

```

> 如果你尚未发布到 npm，可以先本地测试：
>

```bash
npm install --save ./wheelman_framework

```

### 必要依赖

```json
{
  "dependencies": {
    "mime-types": "^2.1.34",
    "busboy": "^1.0.1"
  },
  "devDependencies": {
    "types/node": "^20.x",
    "@types/busboy": "^1.0.1"
  }
}

```

---

### 3. 基本用法

### 创建服务器并监听

```tsx
import Wheel from 'wheelman-framework';

const app = new Wheel();

app.get('/', (req, res) => {
    return res.text(200, 'Hello World');
});

app.listen(3000, () => {
    console.log('Server is running on <http://localhost:3000>');
});

```

### 扩展响应对象

在创建服务器时，`enhanceResponse` 已自动添加了以下便捷方法：

- `res.json(statusCode, data)`：发送 JSON 数据。
- `res.text(statusCode, message)`：发送纯文本。
- `res.file(statusCode, filePath)`：发送文件流（如图片、CSS、JS 等）。

---

### 4. 路由与参数捕获

### 注册路由

```tsx
app.get('/users/:id', (req, res, params) => {
    const userId = params.id;
    return res.json(200, { id: userId });
});

```

### 参数匹配规则

- 使用 `:paramName` 形式捕获路径参数。
- 匹配后会传入 `params` 对象中。

例如访问：

```
<http://localhost:3000/users/123>

```

`params.id` 的值就是 `'123'`。

---

### 5. 静态资源服务

### 设置静态资源目录

```
app.addStaticPath('/static/', './public');

```

- 将 `/static/xxx` 映射为 `./public/xxx`。
- 支持 HTML、CSS、JS、图片等静态资源请求。

### 示例：

如果你有如下文件结构：

```
project-root/
├── public/
│   ├── index.html
│   └── style.css
├── server.ts

```

访问：

```
<http://localhost:3000/static/index.html> → 返回 index.html
<http://localhost:3000/static/style.css> → 返回 style.css

```

---

### 6. 文件上传处理

### 使用 `parseFieldsFiles`

```tsx
import parseFieldsFiles from './parseFieldsFiles';

app.post('/upload', async (req, res) => {
    try {
        const result = await parseFieldsFiles(req);

        console.log("收到字段:", result.fields);
        console.log("收到文件:", result.files);

        // 处理文件
        for (const file of result.files) {
            console.log(`文件 ${file.filename} 写入到了 ${file.filepath}`);
        }

        return res.text(200, '上传成功');
    } catch (err) {
        console.error("上传失败", err);
        return res.text(500, '服务器错误');
    }
});

```

### 注意事项

- 所有上传的文件都会写入临时路径，并返回 `filepath`。
- 你可以自行移动文件或清理缓存。

---

### 7. 错误处理机制

### 异常捕获

- 所有异步操作都建议包裹在 `try...catch` 中。
- `parseFieldsFiles` 可能抛出异常（如非法格式），请务必 `await` 后 `catch` 错误。

### 标准状态码

使用 `StatusCode` 枚举来统一响应码：

```tsx
import StatusCode from 'wheelman-framework/lib/StatusCode';

res.text(StatusCode.BAD_REQUEST, '非法请求');

```

| 状态码 | 描述 |
| --- | --- |
| 200 OK | 请求成功 |
| 204 No Content | OPTIONS 预检请求 |
| 400 Bad Request | 请求格式不正确 |
| 403 Forbidden | 权限不足 |
| 404 Not Found | 页面未找到 |
| 500 Internal Server Error | 服务器内部错误 |

---

### 8. CORS 支持

### 添加全局 CORS 中间件

```tsx
import cors from 'wheelman-framework/middlewares/cors';

app.use(cors({
    origin: ['<http://localhost:8080>', '<https://yourfrontend.com>'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

```

### 默认配置

- 允许所有来源 (`origin: '*'`)
- 允许常见方法 (`methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']`)
- 允许常见 headers (`allowedHeaders: ['Content-Type', 'Authorization']`)
- 不允许携带凭证 (`credentials: false`) (https://zhuanlan.zhihu.com/p/609137863)

---

### 9. 中间件机制

### 注册全局中间件

```tsx
app.use((req, res) => {
    console.log("收到请求:", req.url);
    return true; // 继续执行后续逻辑
});
```

### 控制流程

- 若中间件返回 `false`，则中断后续处理。
- 若中间件已发送响应（如登录验证失败），请不要继续执行后续逻辑。

---

## 🔧 Usage

```tsx
import Wheel from 'wheelman-framework';
import cors from 'wheelman-framework/middlewares/cors';

const app = new Wheel();
app.use(cors());

app.get('/', (req, res) => {
    return res.json(200, { message: 'Hello World' });
});

app.post('/upload', async (req, res) => {
    try {
        const result = await parseFieldsFiles(req);
        return res.text(200, 'Upload success');
    } catch (err) {
        return res.text(500, 'Server error');
    }
});

app.addStaticPath('/static/', './public');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

```