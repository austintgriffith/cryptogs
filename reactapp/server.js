const express = require('express');
var proxy = require('express-http-proxy');
const https = require('https');
const path = require('path');
const helmet = require('helmet')
const fs = require('fs')
const app = express();
const port = 80;

var sslOptions = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem')
};



// Serve static files from the React app
//app.use(express.static(path.join(__dirname,'/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname+'/build/index.html'));
// });

//
//app.listen(port);
//console.log(`Cryptogs http webserver listening on 80`);

app.use(proxy('localhost:8000'));

https.createServer(sslOptions, app).listen(443)
console.log(`Cryptogs https webserver listening on 443`);
