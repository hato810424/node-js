// 初期化
var http = require('http');
var ejs = require("ejs");
//
let players = Array();

// サーバー設定
var server = http.createServer(function (req, res) {
    // ページ振り分け
    let webdata = {};
    req.url = req.url.replace(/^\/\//,'/')
    switch (req.url) {
        case "/":
            filename = "assets/index.ejs";
            break;
        case "/mouth":
            filename = "assets/mouth.ejs";
            webdata = {json_data: players,}
            break;
        default:
            filename = "notfound"
            break;
    };

    if(filename == "notfound"){
        res.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'});
        res.end("404 NotFound\n"+req.url);
    } else {
        // ページレンダー
        ejs.renderFile(filename, webdata, function (err, data) {
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

// グローバル
io.on('connection', (socket) => {
    // 接続
    connect++;
    io.emit('count', connect);
    // 切断
	socket.on('disconnect', function () {
		connect--;
        io.emit('count', connect); 
	});
});

//
const mouth = io.of("/mouth");
mouth.on('connection', (socket) => {
    players.push(
        {
            "id":socket.id,
            "x":0,
            "y":0
        }
    );
    mouth.emit('join', socket.id);
    socket.on('move', function(value) {
        for (var i in players) {
            if (players[i].id == socket.id) {
                players[i] = {
                    "id":socket.id,
                    "x":value.x,
                    "y":value.y
                }
            }
        }
        socket.broadcast.emit('move',socket.id,value);
    });
    socket.on('disconnect', function () {
        for (var i in players) {
            if (players[i].id == socket.id) {
                players.splice(i, 1);
            }
        }
        mouth.emit('leave', socket.id);
	});
});