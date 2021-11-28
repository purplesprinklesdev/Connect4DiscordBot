const scale = [ //how many seconds in
    86400, //day
    2629800, //month, special case needed
    31557600, //year
    3600, //hour
    60, //minute
    1, //second
];
const max = [ //max amount
    31, //day, special case needed
    12, //month
    Number.POSITIVE_INFINITY, //year
    24, //hour
    60, //minute
    60, //second
];
exports.difference = function (current, schedule){
    let d1 = exports.toDateObj(current);
    let d2 = exports.toDateObj(schedule);

    var diff = d2 - d1; //in millis
    diff /= 1000; //in sec

    if(diff < 0)
        diff = 0;

    return diff;
}
exports.toDateObj = function (date){
    return new Date(date[2], date[1] - 1, date[0], date[3], date[4], date[5]);
}
exports.add = function(sec) {
    let d = new Date();
    d = new Date(d.getTime() + sec * 1000);
    return exports.toArray(d);
}
exports.current = function (){
    let cDate = new Date();
    let dateArr = [
        cDate.getUTCDate(),
        cDate.getUTCMonth() + 1,
        cDate.getUTCFullYear(),
        cDate.getUTCHours(),
        cDate.getUTCMinutes(),
        cDate.getUTCSeconds()
    ];
    return dateArr;
}
exports.toArray = function (input){
    if(typeof input == 'string') {
        var position = input.search('-');
        var dateStr = input.slice(0, position);
        var timeStr = input.slice(position + 1);

        const sDateArr = dateStr.split('/');
        var timeArr = timeStr.split(':');

        for (let i = 0; i < timeArr.length; i++) {
            sDateArr[sDateArr.length] = timeArr[i];
        }

        return sDateArr;
    }
    else {
        let dateArr = [
            input.getUTCDate(),
            input.getUTCMonth() + 1,
            input.getUTCFullYear(),
            input.getUTCHours(),
            input.getUTCMinutes(),
            input.getUTCSeconds()
        ];
        return dateArr;
    }
    
}
exports.toString = function (array){
    return `${array[0]}/${array[1]}/${array[2]}-${array[3]}:${array[4]}:${array[5]}`;
}