import * as http from "http";
import * as Busboy from "busboy";
import * as fs from "fs";
import * as path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

type UploadField = { name: string; value: string };
type UploadFile = {
    fieldname: string;
    filename: string;
    mimeType: string;
    filepath: string;
};
type ParseResult = {
    fields: UploadField[];
    files: UploadFile[];
};

function parseFieldsFiles(req: http.IncomingMessage): Promise<ParseResult> {
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.startsWith('multipart/form-data')) {
        return Promise.reject(new Error('Invalid content type'));
    }

    const fields: UploadField[] = [];
    const files: UploadFile[] = [];

    const busboy = Busboy({ headers: req.headers });

    const pendingWrites: Promise<void>[] = []; // 用于跟踪所有写入操作

    busboy.on('field', (fieldname, val) => {
        fields.push({ name: fieldname, value: val });
    });

    busboy.on('file', (fieldname, fileStream, info) => {
        const { filename, mimeType } = info;

        if (!filename) return;

        const tempFileName = `upload-${randomUUID()}-${filename}`;
        const filepath = path.join(tmpdir(), tempFileName);

        const writeStream = fs.createWriteStream(filepath);
        fileStream.pipe(writeStream);

        // 将每个文件的写入操作封装为 Promise
        const fileWritePromise = new Promise<void>((resolveFile, rejectFile) => {
            writeStream.on('finish', resolveFile);
            writeStream.on('error', rejectFile);
        });

        pendingWrites.push(fileWritePromise);

        fileWritePromise.then(() => {
            files.push({
                fieldname,
                filename,
                mimeType,
                filepath
            });
        }).catch(err => {
            console.error("临时文件",filename,"写入失败:", err);
        });
    });

    return new Promise((resolve, reject) => {
        busboy.on('finish', async () => {
            try {
                await Promise.all(pendingWrites); // 等待所有文件写入完成
                resolve({ fields, files }); // 此时 files 已填充完整
            } catch (err) {
                reject(err);
            }
        });

        busboy.on('error', (err) => {
            reject(err);
        });

        req.pipe(busboy);
    });
}

export default parseFieldsFiles;