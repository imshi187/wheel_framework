import {Wheel} from './main.js'; // 注意：有时需要显式指定 .js 扩展名
import parseFieldsFiles from "./parseFieldFiles";
import cor from "./cor";

const app = new Wheel();

app.use(cor()); // 允许跨域请求

app.post("/upload", async (req, res) => {
    try {
        const result = await parseFieldsFiles(req);
        console.log("表单字段:", result.fields);
        console.log("临时文件路径:", result.files);

        // 示例：用户处理文件
        for (const file of result.files) {
            console.log("fileobj: ")
            console.log(file)
            console.log(`收到文件 ${file.filename}，临时路径为 ${file.filepath}`);
        }
        return res.text(200, "Upload success");

    } catch (err) {
        console.error("解析上传失败:", err);
        return res.text(500, "Upload failed");
    }
});


// ... 其他路由和中间件 ...
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});