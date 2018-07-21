var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var WebSocketClient = require('websocket').client;
var WebSocketServer = require('websocket').server;
var W3CWebSocket = require('websocket').w3cwebsocket;
var logfmt = require("logfmt");
var url = require('url');
var redis = require('redis');
//var httpProxy = require('http-proxy');
//var proxy = require('express-http-proxy');

var request = require('request');
request('http://localhost:9229/json/list', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.

    var client = new WebSocketClient();
    
    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });
    
    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log("Received: '" + message.utf8Data + "'");
            }
        });
        
        function sendNumber() {
            if (connection.connected) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                connection.sendUTF(number.toString());
                setTimeout(sendNumber, 1000);
            }
        }
        sendNumber();
    });
    
    var url = "ws://localhost:9229/" + JSON.parse(body)[0].id
    console.log("url: " + url)
    client.connect(url);
  }
})




expressLogging = require('express-logging'),
logger = require('logops');

//var redisURL = url.parse(process.env.REDISCLOUD_URL);
//var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
//client.auth(redisURL.auth.split(":")[1]);

var port = Number(process.env.PORT || 5000);


//var ProxyDebug = httpProxy.createProxyServer({
//  target: {
//    host: 'localhost',
//    port: 9229
//  },
//  ws: true
//})

//var app = express();
//var app = require('express-ws-routes')(); // Create an express app with websocket support 


app.use(expressLogging(logger));

//app.websocket('/:id', function(info, cb, next) {
    // `info` is the same as ws's verifyClient 
//    console.log(
//        'ws req from %s using origin %s',
//        info.req.originalUrl || info.req.url,
//        info.origin
//    );
 
    // Accept connections by passing a function to cb that will handle the connected websocket 
 //   cb(function(socket) {
 //       ProxyDebug.ws(info.req, socket);
 //   });
//});

//app.use('/:id', ProxyDebug.web.bind(ProxyDebug));

//app.get('/:param', function(req, res) {
//  console.log("ProxyDebug.web")
//  ProxyDebug.web(req, res);
//});

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/command', function(req, res) {
    res.send("hello http " + req.query.a);
});



io.on('connection', function(socket){
  console.log('io: connection');
  socket.on("message", function(data){
    socket.emit("message", "hello ws " + data)
  })
});

//server.on('upgrade', function (req, socket, head) {
//  console.log("server: upgrade")
//  ProxyDebug.ws(req, socket, head);
//});

server.listen(port, function() {
  console.log("Listening on hello " + port);
});

// Using app.listen will also create a require('ws').Server 
//app.listen(port, function() {
//  console.log("Listening on hello " + port);
//});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}

wsServer.on('request', function(request) {
    console.log("wsServer on request")
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
