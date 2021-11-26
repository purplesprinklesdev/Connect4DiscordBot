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
exports.add = function(date, sec) {
    var carry = sec;
    addSecToDate = function() {
        for(let i = 5; i > 2; i--) {
            if((carry / scale[i]) + date[i] > max[i]) {
                date[i + 1]++; //from the overflow
    
                carry -= (max[i] - date[i]) * scale[i]; //subtract from carry what it used to get to the max, multiplied by scale
                var remainder = carry % scale[i];
                date[i] = remainder;
                carry -= remainder;
            }
            else{
                date[i] += carry / scale[i]; 
                return;
            }
        }
        for(let i = 0; i < 3; i++) {
            let max = max[i]
            if(scale[i] === 0) { //if on days, because some months have more days than others
                switch(date[1]) {
                    case 2:
                        if(date[2] % 4 && !date[2] % 100) //leap year, Gregorian
                            max = 29;
                        else
                            max = 28;
                    break;
                    
                    case 3 || 6 || 9 || 11: max = 30; break;
                    default: max = 31; break;
                }
            }
            if((carry / scale[i]) + date[i] > max[i]) {
                date[i + 1]++; //from the overflow
    
                carry -= (max[i] - date[i]) * scale[i]; //subtract from carry what it used to get to the max, multiplied by scale
                var remainder = carry % scale[i];
                date[i] = remainder + 1;
                carry -= remainder;
            }
            else{
                date[i] += carry / scale[i]; 
                return;
            }
        }
    }
    return date;
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
exports.toArray = function (string){
    var position = string.search('-');
    var dateStr = string.slice(0, position);
    var timeStr = string.slice(position + 1);

    const sDateArr = dateStr.split('/');
    var timeArr = timeStr.split(':');

    for (let i = 0; i < timeArr.length; i++) {
        sDateArr[sDateArr.length] = timeArr[i];
    }

    return sDateArr;
}
exports.toString = function (array){
    return `${array[0]}/${array[1]}/${array[2]}-${array[3]}:${array[4]}:${array[5]}`;
}