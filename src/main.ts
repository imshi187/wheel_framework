import * as http from 'http';
import * as fs from "fs";
import * as mime from 'mime-types';
import { URL } from 'url';
import * as path from "path";

// 扩展 ServerResponse 类型
type EnhancedResponse = http.ServerResponse & {
    json: (statusCode: number, data: object) => void;
    text: (statusCode: number, message: string) => void;
    file: (statusCode: number, filePath: string) => void;
};

type EnhancedRequest = http.IncomingMessage & {
    queries: Record<string, string>;
}

type RouteHandler = (req: http.IncomingMessage, res: EnhancedResponse, params: Record<string, string>) => void;
type Middleware = (req: http.IncomingMessage, res: EnhancedResponse) => boolean;

interface Route {
    path: string;
    method: string;
    handler: RouteHandler;
    paramNames: string[];
    regex: RegExp;
    middleware: Middleware[];
}
//
type StaticPathConfig = {
    prefix: string;
    directory: string;
};

class Wheel {
    private readonly routes: Route[] = [];
    private middlewares: Middleware[] = [];
    private pathMiddlewares: Record<string, Middleware[]> = {};

    constructor() {
        // this.routes = {}; // Changed to an array of Route objects
    }
    private staticPaths: StaticPathConfig[] = [];

    addStaticPath(prefix: string, directory: string): void {
        if(!fs.existsSync(directory)){
            console.log("the directory does not exist: ",directory)
            return;
        }
        this.staticPaths.push({ prefix, directory });
    }

    private enhanceResponse(res: http.ServerResponse): EnhancedResponse {
        const enhancedRes = res as EnhancedResponse;

        enhancedRes.json = (statusCode: number, data: object) => {
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        };

        enhancedRes.text = (statusCode: number, message: string) => {
            res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
            res.end(message);
        };

        enhancedRes.file = (statusCode: number, filePath: string) => {
            if (!fs.existsSync(filePath)) {
                res.writeHead(404);
                return res.end('File not found');
            }

            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const contentType = mime.lookup(filePath) || 'application/octet-stream';

            res.writeHead(statusCode, {
                'Content-Type': contentType,
                'Content-Length': fileSize
            });

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        };

        return enhancedRes;
    }

    listen(port: number, callback?: () => void): void {
        const server = http.createServer((req, res: http.ServerResponse & { req: http.IncomingMessage }) => { // Explicitly type res
            this.handleRequest(req, this.enhanceResponse(res));
        });
        server.listen(port, callback);
    }

    use(middleware: Middleware): void {
        this.middlewares.push(middleware);
    }
    /*
     parsedUrl:  URL {
          href: 'http://localhost:3000/users/1/sxl',
          origin: 'http://localhost:3000',
          protocol: 'http:',
          username: '',
          password: '',
          host: 'localhost:3000',
          hostname: 'localhost',
          port: '3000',
          pathname: '/users/1/sxl',
          hash: ''
    }*/

    // /static/xx/yy/1.txt


    private handleRequest(req: http.IncomingMessage, res: EnhancedResponse): void {
            const parsedUrl = new URL(req.url || '/', `http://localhost:${process.env.PORT || 3000}`); // Use URL API for better path handling

            //parsedURL是URL对象，包含了请求的url信息
            console.log("parsedUrl: ",parsedUrl)
            // pathname就是实际访问时候的路径 :  /users/1/sxl
            const pathname = parsedUrl.pathname;
            const method = req.method || 'GET';

            //  pathname: '/static/xx/yy/1.html',

            // 1. 先检查静态资源
            for (const { prefix, directory } of this.staticPaths) {
                if (pathname.startsWith(prefix)) {
                    const relativePath = decodeURIComponent(pathname.slice(prefix.length));
                    const filePath = path.join(directory, relativePath);
                    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                        return res.file(200, filePath);
                    }else{
                        return res.text(404, 'Not Found');
                    }
                }
            }

            // 执行全局中间件
            for (const middleware of this.middlewares) {
                if (!middleware(req, res)) {
                    return;
                }
            }

            // 遍历路由
            for (const route of this.routes) {
                // test方法用于测试正则表达式是否匹配
                if (route.method === method && route.regex.test(pathname)) {
                    const match = pathname.match(route.regex);
                    if (match) {
                        const params: Record<string, string> = {};

                        // 遍历参数名，将匹配到的参数值存入params对象
                        for (let i = 0; i < route.paramNames.length; i++) {
                            // route.paramNames里面包含的是路由里面的路径参数名词，如 /users/:id
                            params[route.paramNames[i]] = match[i + 1];
                        }

                        // 执行路由特定中间件
                        for (const middleware of route.middleware) {
                            if (!middleware(req, res)) {
                                return;
                            }
                        }

                        route.handler(req, res, params);
                        return;
                    }
                }
            }

            res.text(404, 'Not Found');
        }

    // '/users/:id'
    private addRoute(method: string, path: string, handler: RouteHandler, middleware: Middleware[] = []): void {

        // 存储的参数
        const paramNames: string[] = [];

        const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
            console.log("param: ",paramName)
            paramNames.push(paramName);
            return '([^/]+)';
        });
        // [^/] 表示"不是斜杠(/)的任意字符"
        console.log("regexPath: ",regexPath)
        const regex = new RegExp(`^${regexPath}/?$`); // Match from the start and optionally allow a trailing slash

        this.routes.push({
            path,
            method,
            handler,
            paramNames,
            regex,
            middleware: middleware
        });
    }

    get(path: string, handler: RouteHandler, middleware: Middleware[] = []): void {
        this.addRoute('GET', path, handler, middleware);
    }

    post(path: string, handler: RouteHandler, middleware: Middleware[] = []): void {
        this.addRoute('POST', path, handler, middleware);
    }
}
// 在文件末尾改为：
export { Wheel, Middleware };