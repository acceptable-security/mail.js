var net = require('net');

function createServer(domain, port) {
	var server = {
		events: {},
		on: function (event, func) {
			this.events[event] = func;
		},
		socket: undefined,
		welcome_message: "Welcome %ADDR%, this is my mail server"
	};
	var socket = net.createServer(function(c) {
		var mail = {
			to: [],
			from: "",
			data: "",
		};
		var client_domain = "";
		var activity = "";
		c.on('end', function() {
			if(server.events["end"] != undefined)
				server.events["end"](c);
		});
		c.on('data', function (data) {
			data = data.toString();
				if(activity != "R") {
					var cmd = data.toString().replace("\r","").trim().split(' ')[0].toUpperCase();
					console.log(cmd);
					switch(cmd) {
						case "HELO":
							client_domain = data.split(' ')[1].trim();
							c.write("250 " + server["welcome_message"].replace("%ADDR%", client_domain) + "\n");
							activity = "W";
						case "MAIL":
							activity = "G";
							var name = data.toString().replace("MAIL FROM:", "").trim();
							mail["from"] = name.substr(1).slice(0, -1);
							c.write("250 Ok " + data.toString().trim() +"\r\n");
							break;
						case "RCPT":
							var name = data.toString().replace("RCPT TO:", "").trim();
							mail["to"].push(name.substr(1).slice(0, -1));
							c.write("250 Ok " + data.toString().trim() +"\r\n");
							break;
						case "DATA":
							activity = "R";
							c.write("354 End data with <CR><LF>.<CR><LF>\n");
							break;
						case "QUIT":
							c.write("221 Bye\n");
							c.end();
							break;

						default:
							c.write("500 Command not found\n");
							break;
					}
				}
				else {
					mail["data"] += data;
					if(mail["data"].substr(mail["data"].length - 5) == "\r\n.\r\n" || mail["data"].substr(mail["data"].length - 5) == "\r\r.\r\r") {
						mail["data"] = mail["data"].substring(0, mail["data"].length - 5);
						activity = "W";
						c.write("250 Ok\n");
						if(server.events["message"] != undefined)
							server.events["message"](mail);
						mail = {};
					}
				}
				data = "";
		});

		if(server.events["connection"] != undefined)
			server.events["connection"](c);

		c.write('220 ' + domain + ' ESMTP mailjs\n');

	});
	socket.listen(port, function() {
		console.log('server bound');
	});
	server["socket"] = socket;
	return server;
}


var server = createServer("test.com", 25);

server.on('connection', function (client) {
	console.log("WOW CONN");
});

server.on('end', function (client) {
	console.log("MUCH DISCONN");
});

server.on('message', function (mail) {
	console.log(mail);
});