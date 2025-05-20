import { Middleware } from './main';
import * as http from 'http';

function cors(options: { origin?: string | string[]; methods?: string[]; allowedHeaders?: string[];
    credentials?: boolean; } = {}): Middleware {
    const cor =  (req:http.IncomingMessage, res:http.ServerResponse) => {

        const {
            origin = '*',
            methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders = ['Content-Type', 'Authorization'],
            credentials = false,
        } = options;

        const requestOrigin = req.headers.origin || '';

        let allowedOrigin = '*';
        if (Array.isArray(origin)) {
            const origins = new Set(origin);
            if (origins.has(requestOrigin)) {
                allowedOrigin = requestOrigin;
            }
        } else if (origin === '*' || origin === 'true') {
            allowedOrigin = '*';
        } else if (requestOrigin && origin === requestOrigin) {
            allowedOrigin = origin;
        }

        //只设置响应头，不真正发送响应
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
    return cor;
}
export default cors;
