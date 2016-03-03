var Time = function () {

	this.currentTime = 0.0;
    this.startTime = 0.0;
	this.endTime = 0.0;
};

Time.prototype.start = function (endtime) {

	this.startTime = new Date().getTime();
    this.endTime = endtime;
}

Time.prototype.timeIsUp = function () {

	if(new Date().getTime() - this.startTime >= this.endTime)
        return true;
    
    return false;
}

var TIME = new Time();