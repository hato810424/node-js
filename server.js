// 初期化
var http = require('http');
var fs = require('fs');
var ejs = require("ejs");
let logs = Array();

// サーバー設定
var server = http.createServer(function (req, res) {
    // ページ振り分け
    switch (req.url) {
        case "/":
            filename = "assets/index.ejs";
            break;
        default:
            filename = "notfound"
            break;
    };

    if(filename == "notfound"){
        res.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'});
        res.end("404 NotFound");
    } else {
        // ページレンダー
        ejs.renderFile(filename, {
            json_data: logs,
        }, function (err, data) {
            if (err) {
                console.log({ err });
                res.writeHead(404, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end("エラーが発生しました");
            }
            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
            res.write(data);
            res.end();
        });
    };
});

// サーバー起動
server.listen(8081, '0.0.0.0', function(){
    console.log("起動");
});

//===========//
// Socket.IO //
//===========//
var io = require('socket.io')(server);

// 初期化
var connect = 0;

io.on('connection', (socket) => {
    // 接続
    connect++;
    io.emit('count', connect);
    io.emit('log', socket.id+"さんが接続しました。");
    logs.push({"id":socket.id,"message":"接続"});
    

    // 切断
	socket.on('disconnect', function () {
		connect--;
        io.emit('count', connect); 
        io.emit('log', socket.id+"さんが切断しました。");
        logs.push({"id":socket.id,"message":"切断"});
	});
});