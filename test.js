var net = require('net');
var client = new net.Socket();

var index = 0;
var msgs = [
	'HELO relay.testserver.com\r\n',
	'MAIL FROM:<bob@testserver.com>\r\n',
	'RCPT TO:<alice@you.com>\r\n',
	'RCPT TO:<whatever@you.com>\r\n',
	'DATA\r\n',
	'test message\r\n',
	'goes here\r\n',
	'\r\n.\r\n',
];

function sendNextMessage() {
	if(index < msgs.length) {
		client.write(msgs[index]);
		index += 1;
	}
	else {
		client.destroy();
	}
}

client.connect(8123, '127.0.0.1', function() {
	console.log('Connected');
	sendNextMessage();
	setInterval(sendNextMessage, 1200);
});
 
client.on('data', function(data) {
	console.log(data.toString());
});
 
client.on('close', function() {
	console.log('Connection closed');
});