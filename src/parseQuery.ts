// /users?name=sxl&age=25;

// 外界传入的query应该是： req.url
import * as http from "http";

const parseQuery = (queryObj: http.IncomingMessage):Record<string, string> => {

    let query = queryObj.url;

    // 如果query中没有'?'，则返回空对象
    if(!query.includes('?')){
        return {};
    }

    const queries : Record<string, string> = {};
    const queryArr:string[] = query.split('?')[1].split('&');

    for(let i = 0; i < queryArr.length; i++){
        const queryPair = queryArr[i].split('=');
        // queryPair[0]是key，queryPair[1]是value
        queries[queryPair[0]] = queryPair[1];
    }
    return queries;
}
export default parseQuery;
