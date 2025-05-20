"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_js_1 = require("./main.js"); // 注意：有时需要显式指定 .js 扩展名
var parseFieldFiles_1 = require("./parseFieldFiles");
var app = new main_js_1.Wheel();
// app.use(cor({credentials: true, origin: "*"})); // 允许跨域请求
app.post("/upload", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, _i, _a, file, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, parseFieldFiles_1.default)(req)];
            case 1:
                result = _b.sent();
                console.log("表单字段:", result.fields);
                console.log("临时文件路径:", result.files);
                // 示例：用户处理文件
                for (_i = 0, _a = result.files; _i < _a.length; _i++) {
                    file = _a[_i];
                    console.log("fileobj: ");
                    console.log(file);
                    console.log("\u6536\u5230\u6587\u4EF6 ".concat(file.filename, "\uFF0C\u4E34\u65F6\u8DEF\u5F84\u4E3A ").concat(file.filepath));
                }
                return [2 /*return*/, res.text(200, "Upload success")];
            case 2:
                err_1 = _b.sent();
                console.error("解析上传失败:", err_1);
                return [2 /*return*/, res.text(500, "Upload failed")];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ... 其他路由和中间件 ...
app.listen(3000, function () {
    console.log('Server listening on port 3000');
});
