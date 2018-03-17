const express = require('express');
const https = require('https');
const helmet = require('helmet');
const app = express();
const Redis = require('ioredis');

var redis = new Redis({
  port: 57290,
  host: '10.0.0.107',
})
var pub = new Redis({
  port: 57290,
  host: '10.0.0.107',
})
var sub = new Redis({
  port: 57290,
  host: '10.0.0.107',
})

sub.subscribe('news', 'music', function (err, count) {
  pub.publish('news', 'Hello world!');
  pub.publish('music', 'Hello again!');
});
sub.on('message', function (channel, message) {
  console.log('Receive message %s from channel %s', message, channel);
});
redis.set('foo', 'bar');
redis.get('foo', function (err, result) {
  console.log(result);
});



var sslOptions = {
  //key: fs.readFileSync('privkey.pem'),
  //cert: fs.readFileSync('fullchain.pem')
};

app.use(helmet());

app.get('/', (req, res) => {
    res.end('cryptogs api');
});


app.listen(8000);
console.log(`Cryptogs http webserver listening on 8080`);

//https.createServer(sslOptions, app).listen(443)
//console.log(`Cryptogs api https webserver listening on 443`);
