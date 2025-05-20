"use strict";
// /users?name=sxl&age=25;
Object.defineProperty(exports, "__esModule", { value: true });
var parseQuery = function (queryObj) {
    var query = queryObj.url;
    // 如果query中没有'?'，则返回空对象
    if (!query.includes('?')) {
        return {};
    }
    var queries = {};
    var queryArr = query.split('?')[1].split('&');
    for (var i = 0; i < queryArr.length; i++) {
        var queryPair = queryArr[i].split('=');
        // queryPair[0]是key，queryPair[1]是value
        queries[queryPair[0]] = queryPair[1];
    }
    return queries;
};
exports.default = parseQuery;
