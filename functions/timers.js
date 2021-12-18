const timers = [];

exports.add = function (id, timeout) {
    timers[timers.length] = new Timer(id, timeout);
}
exports.stop = function (id) {
    var index = timers.findIndex(function(x) {
        if(x == null)
            return false;
        return x.id == id;
    });
    try {
        clearTimeout(timers[index].timeout);
    }
    catch {}
    timers[index] = null;
}

class Timer {
    constructor(id, timeout) {
        this.id = id;
        this.timeout = timeout;
    }
    stop = function() {
        clearTimeout(this.timeout);
    }
}