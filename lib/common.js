function commonRoute (type, folderName, fileName) {
    const path = require('path');
    switch (type) {
        case 'model':
            return path.join(rootUrl, '/models/' + folderName, fileName);
        case 'business':
            return path.join(rootUrl, '/business/' + folderName, fileName);
        default:
            return path.join(rootUrl, '/routes/' + folderName, fileName);
    }
}

function commonResponse (res, statusCode, data) {
    if (statusCode === 400) {
        const message = {message : data};
        return res.status(statusCode).send(message);
    }
    return res.status(statusCode).send(data);
}

function commonPaging (dataList, pageIndex) {
    const limit = 20,
        startIndex = pageIndex * limit,
        endIndex = Math.min(startIndex + limit - 1, dataList.length - 1);
    return dataList.slice(startIndex, endIndex + 1);
}

function newDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }
    hour = today.getHours();
    today = {};
    today.date = mm + '/' + dd + '/' + yyyy;
    today.hour = '' + hour;
    return today;
}

module.exports.commonRoute = commonRoute;
module.exports.commonResponse = commonResponse;
module.exports.commonPaging = commonPaging;
module.exports.newDate = newDate;