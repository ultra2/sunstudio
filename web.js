var express = require("express");
var logfmt = require("logfmt");
var url = require('url');
var redis = require('redis');
var httpProxy = require('http-proxy');
//var proxy = require('express-http-proxy');

expressLogging = require('express-logging'),
logger = require('logops');

//var redisURL = url.parse(process.env.REDISCLOUD_URL);
//var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
//client.auth(redisURL.auth.split(":")[1]);

var port = Number(process.env.PORT || 5000);


var ProxyDebug = httpProxy.createProxyServer({
  target: {
    host: 'localhost',
    port: 9229
  },
  //target: 'ws://localhost:9229',
  ws: true
})

var app = express();
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
  switch (req.query.a) {
    case "set":
      res.send(client.set("welcome_msg", "Hello from Redis!"));
      break;
    case "get":
      client.get("welcome_msg", function (err, reply) {
        if (reply != null) {
          res.send(reply);
        } else {
          res.send("Error");
        }
      });
      break;
    case "info":
      client.info(function (err, reply) {
        if (reply != null) {
          res.send(reply);
       } else {
          res.send("Error");
        }
      });
      break;
    case "flush":
      client.flushdb(function (err, reply) {
        if (reply != null) {
           res.send(reply);
        } else {
          res.send("Error");
        }
      });
      break;
    default:
      res.send("");
  }
});

var server = require('http').createServer(app);
server.on('upgrade', function (req, socket, head) {
  ProxyDebug.ws(req, socket, head);
});
server.listen(port, function() {
  console.log("Listening on hello " + port);
});

// Using app.listen will also create a require('ws').Server 
//app.listen(port, function() {
//  console.log("Listening on hello " + port);
//});
