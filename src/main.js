"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wheel = void 0;
var http = require("http");
var fs = require("fs");
var mime = require("mime-types");
var url_1 = require("url");
var path = require("path");
var Wheel = /** @class */ (function () {
    function Wheel() {
        this.routes = [];
        this.middlewares = [];
        this.pathMiddlewares = {};
        this.staticPaths = [];
        // this.routes = {}; // Changed to an array of Route objects
    }
    Wheel.prototype.addStaticPath = function (prefix, directory) {
        if (!fs.existsSync(directory)) {
            console.log("the directory does not exist: ", directory);
            return;
        }
        this.staticPaths.push({ prefix: prefix, directory: directory });
    };
    Wheel.prototype.enhanceResponse = function (res) {
        var enhancedRes = res;
        enhancedRes.json = function (statusCode, data) {
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        };
        enhancedRes.text = function (statusCode, message) {
            res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
            res.end(message);
        };
        enhancedRes.file = function (statusCode, filePath) {
            if (!fs.existsSync(filePath)) {
                res.writeHead(404);
                return res.end('File not found');
            }
            var stat = fs.statSync(filePath);
            var fileSize = stat.size;
            var contentType = mime.lookup(filePath) || 'application/octet-stream';
            res.writeHead(statusCode, {
                'Content-Type': contentType,
                'Content-Length': fileSize
            });
            var stream = fs.createReadStream(filePath);
            stream.pipe(res);
        };
        return enhancedRes;
    };
    Wheel.prototype.listen = function (port, callback) {
        var _this = this;
        var server = http.createServer(function (req, res) {
            _this.handleRequest(req, _this.enhanceResponse(res));
        });
        server.listen(port, callback);
    };
    Wheel.prototype.use = function (middleware) {
        this.middlewares.push(middleware);
    };
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
    Wheel.prototype.handleRequest = function (req, res) {
        var parsedUrl = new url_1.URL(req.url || '/', "http://localhost:".concat(process.env.PORT || 3000)); // Use URL API for better path handling
        //parsedURL是URL对象，包含了请求的url信息
        console.log("parsedUrl: ", parsedUrl);
        // pathname就是实际访问时候的路径 :  /users/1/sxl
        var pathname = parsedUrl.pathname;
        var method = req.method || 'GET';
        //  pathname: '/static/xx/yy/1.html',
        // 1. 先检查静态资源
        for (var _i = 0, _a = this.staticPaths; _i < _a.length; _i++) {
            var _b = _a[_i], prefix = _b.prefix, directory = _b.directory;
            if (pathname.startsWith(prefix)) {
                var relativePath = decodeURIComponent(pathname.slice(prefix.length));
                var filePath = path.join(directory, relativePath);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    return res.file(200, filePath);
                }
                else {
                    return res.text(404, 'Not Found');
                }
            }
        }
        // 执行全局中间件
        for (var _c = 0, _d = this.middlewares; _c < _d.length; _c++) {
            var middleware = _d[_c];
            if (!middleware(req, res)) {
                return;
            }
        }
        // 遍历路由
        for (var _e = 0, _f = this.routes; _e < _f.length; _e++) {
            var route = _f[_e];
            // test方法用于测试正则表达式是否匹配
            if (route.method === method && route.regex.test(pathname)) {
                var match = pathname.match(route.regex);
                if (match) {
                    var params = {};
                    // 遍历参数名，将匹配到的参数值存入params对象
                    for (var i = 0; i < route.paramNames.length; i++) {
                        // route.paramNames里面包含的是路由里面的路径参数名词，如 /users/:id
                        params[route.paramNames[i]] = match[i + 1];
                    }
                    // 执行路由特定中间件
                    for (var _g = 0, _h = route.middleware; _g < _h.length; _g++) {
                        var middleware = _h[_g];
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
    };
    // '/users/:id'
    Wheel.prototype.addRoute = function (method, path, handler, middleware) {
        if (middleware === void 0) { middleware = []; }
        // 存储的参数
        var paramNames = [];
        var regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, function (_, paramName) {
            console.log("param: ", paramName);
            paramNames.push(paramName);
            return '([^/]+)';
        });
        // [^/] 表示"不是斜杠(/)的任意字符"
        console.log("regexPath: ", regexPath);
        var regex = new RegExp("^".concat(regexPath, "/?$")); // Match from the start and optionally allow a trailing slash
        this.routes.push({
            path: path,
            method: method,
            handler: handler,
            paramNames: paramNames,
            regex: regex,
            middleware: middleware
        });
    };
    Wheel.prototype.get = function (path, handler, middleware) {
        if (middleware === void 0) { middleware = []; }
        this.addRoute('GET', path, handler, middleware);
    };
    Wheel.prototype.post = function (path, handler, middleware) {
        if (middleware === void 0) { middleware = []; }
        this.addRoute('POST', path, handler, middleware);
    };
    return Wheel;
}());
exports.Wheel = Wheel;
