// 初期化
var http = require('http');
var url = require('url');
var ejs = require("ejs");
var fs = require("fs");
// Content-Type
const type = [
    {exe:"application/octet-stream"},
    {zip:"application/zip"},
    {pdf:"application/pdf"},
    {mp3:"audio/mpeg"},
    {mp4:"video/mp4"},
    {jpg:"image/jpeg"},
    {jpeg:"image/jpeg"},
    {png:"image/png"},
    {gif:"image/gif"},
    {bmp:"image/bmp"},
    {svg:"image/svg+xml"}
];

// socketで使う変数の初期化
let players = Array();
let ttt_playtime = 0;
let ttt_url = "ANp0qch3XVM"

// サーバー設定
var server = http.createServer(function (req, res) {
    // 初期化
    let webdata = {};
    //
    const url_parts = url.parse(req.url, true);
    //
    url_parts.pathname = url_parts.pathname.replace(/^\/\//,'/');
    url_parts.pathname = url_parts.pathname.replace(/\?(.)+/,'');
    url_parts.pathname = decodeURI(url_parts.pathname);
    //
    extension = url_parts.pathname.replace(/^\/(assets)(.)+\./u,'');
    //
    if (url_parts.pathname.match(/^\/(assets)(.)+\.[\.\-\_a-z0-9]+$/i)) {
        // assets読み込み
        c_type = "";
        filename = url_parts.pathname.replace(/^\//,'');
        //
        for (var i in type) {
            if(type[i][extension]) {
                c_type = type[i][extension];
            }
        };
        fs.readFile(filename, url_parts.query, function (error, content) {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end("404 NotFound");
            } else {
                res.writeHead(200, { 'Content-Type': c_type+';charset=utf-8' });
                res.end(content);
            }
        });
    } else {
        filename = "";
        // ページ振り分け
        switch (url_parts.pathname) {
            case "/":
                filename = "pages/index.ejs";
                break;
            case "/mouth":
                filename = "pages/mouth.ejs";
                webdata = { data: players, }
                break;
            default:
                res.writeHead(404, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end("404 NotFound");
        };
        //
        if (filename != "") {
            // ページレンダー
            ejs.renderFile(filename, webdata, function (err, data) {
                console.log("request: "+filename)
                if (err) {
                    console.log({ err });
                    res.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
                    res.end("内部エラーが発生しました");
                }
                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                res.write(data);
                res.end();
            });
        };
    };
});

// サーバー起動
server.listen(8081, '0.0.0.0', function(){
    console.log(
        "|============|"+"\n"+
        "|起動しました|"+"\n"+
        "|============|"
    );
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
            "id": socket.id,
            "x": 0,
            "y": 0
        }
    );
    mouth.emit('join', socket.id);
    socket.on('move', function (value) {
        for (var i in players) {
            if (players[i].id == socket.id) {
                players[i] = {
                    "id": socket.id,
                    "x": value.x,
                    "y": value.y
                }
            }
        }
        socket.broadcast.emit('move', socket.id, value);
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