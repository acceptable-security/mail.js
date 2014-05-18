var fs = require('fs')
, mail = require('./mail');


var server = mail.createServer("test.com", 25);

function getDateTime() {
    var date = new Date();

    var hour = date.getHours() % 12;
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return month + "/" + day + "/" + year + " " + hour + ":" + min + ":" + sec;
}

function logEvent(message) {
	fs.appendFile("log", "[" +  getDateTime() + "] " + message, function (error) {
		if(error) {
			throw error;
		}
	});
}

server.on('connection', function (client) {
	logEvent("Connection from " + client.remoteAddress.toString() + ".");
});

server.on('end', function (client) {
	logEvent("Disconnected from " + client.remoteAddress.toString() + ".");
});

server.on('message', function (mail) {
	console.log(mail);
});
