"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function cors(options) {
    if (options === void 0) { options = {}; }
    return function (req, res) {
        var _a = options.origin, origin = _a === void 0 ? '*' : _a, _b = options.methods, methods = _b === void 0 ? ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] : _b, _c = options.allowedHeaders, allowedHeaders = _c === void 0 ? ['Content-Type', 'Authorization'] : _c, _d = options.credentials, credentials = _d === void 0 ? false : _d;
        var requestOrigin = req.headers.origin || '';
        var allowedOrigin = '*';
        if (Array.isArray(origin)) {
            var origins = new Set(origin);
            if (origins.has(requestOrigin)) {
                allowedOrigin = requestOrigin;
            }
        }
        else if (origin === '*' || origin === 'true') {
            allowedOrigin = '*';
        }
        else if (requestOrigin && origin === requestOrigin) {
            allowedOrigin = origin;
        }
        // ⚠️ 只设置响应头，不真正发送响应
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
        res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
        res.setHeader('Access-Control-Allow-Credentials', credentials ? 'true' : 'false');
        // 预检请求直接结束
        if (req.method === 'OPTIONS') {
            res.writeHead(204); // 使用 204 No Content
            res.end();
            return false; // 停止后续路由处理
        }
        return true; // 继续后续处理
    };
}
exports.default = cors;
