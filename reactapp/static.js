const express = require('express');
const path = require('path');
const https = require('https');

const fs = require('fs')
const app = express();
/*
const port = 9000;
app.use(helmet())
app.use(express.static(path.join(__dirname,'/build')));
app.get('*', (req, res) => {
  console.log("/",req.params)
  res.sendFile(path.join(__dirname+'/build/index.html'));
});
app.listen(port);
console.log('Cryptogs http webserver listening on '+port);
*/

var sslOptions = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem')
};

app.use(express.static(path.join(__dirname,'/build')));
app.get('*', (req, res) => {
  console.log("/",req.params)
  res.sendFile(path.join(__dirname+'/build/index.html'));
});
https.createServer(sslOptions, app).listen(443)
console.log(`Cryptogs https webserver listening on 443`);
