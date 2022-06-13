// WebServerを起動
var http = require('http');
var html = require('fs').readFileSync('assets/index.html');

http = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    res.end(html);
}).listen(8081, '0.0.0.0');

// Socket.IO
var io = require('socket.io')(http);
var connect = 0;

io.on('connection', (socket) => {
    //接続
    connect++;
    io.emit('count', connect);

    //切断
	socket.on('disconnect', function () {
		connect--;
        io.emit('count', connect); 
	});
});