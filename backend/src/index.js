"use strict";
const express = require('express');
const https = require('https');
const helmet = require('helmet');
const app = express();
const Redis = require('ioredis');
const Web3 = require('web3');
const ContractLoader = require('./modules/contractLoader.js');
var bodyParser = require('body-parser')
app.use(bodyParser());
var cors = require('cors')
app.use(cors())
var SHA3 = require('sha3');

const COMMIT_EXPIRE = 3600 // commit expires in an hour?

let NETWORK = 3
let contracts;
let tokens = [];
var Web3Utils = require('web3-utils');
var web3 = new Web3();
//web3.setProvider(new web3.providers.HttpProvider('http://172.31.41.168:8545'));
web3.setProvider(new Web3.providers.HttpProvider("https://ropsten.infura.io/c2tvCbsyloQRTKpcSWQx"));
if(!web3.isConnected())
  console.log("INFURA not connected");
else{
  console.log("INFURA connected");
  contracts = ContractLoader(["Cryptogs","SlammerTime","PizzaParlor"],web3,NETWORK);
  /*let totalSupply = contracts["Cryptogs"].totalSupply().c[0]
  console.log("Loading ",totalSupply,"tokens...")
  for(let token=1;token<totalSupply;token++){
    tokens[token] = contracts["Cryptogs"].getToken(token)
    console.log(token,tokens[token])
  }*/
}

var redis = new Redis({
  port: 57290,
  host: '172.17.0.1',
})
var pub = new Redis({
  port: 57290,
  host: '172.17.0.1',
})
var sub = new Redis({
  port: 57290,
  host: '172.17.0.1',
})

sub.subscribe('news', 'music', function (err, count) {
  pub.publish('news', 'Hello world!');
  pub.publish('music', 'Hello again!');
});
sub.on('message', function (channel, message) {
  console.log('Receive message %s from channel %s', message, channel);
});
redis.set('foo', 'baz');
redis.get('foo', function (err, result) {
  console.log(result);
});

var sslOptions = {
  //key: fs.readFileSync('privkey.pem'),
  //cert: fs.readFileSync('fullchain.pem')
}

app.use(helmet());

app.get('/', (req, res) => {
  let stamp=Date.now()
  console.log("/",stamp)
    res.end(JSON.stringify({version:1,timestamp:stamp}));
});

app.get('/hook', (req, res) => {
  console.log("HOOK",req.params,req.query)
    res.end(JSON.stringify({timestamp:Date.now()}));
});

app.get('/token/:token', (req, res) => {
    console.log("/Token/ ",req.params.token)
    res.end(JSON.stringify(getToken(req.params.token)))
});


function getToken(id){
  let tokenData = contracts["Cryptogs"].getToken(id)
  return {
    id:id,
    owner:tokenData[0],
    image:Web3Utils.toAscii(tokenData[1]).replace(/[^a-zA-Z\d\s.]+/g,""),
    copies:tokenData[2].c,
    prevalence:tokenData[2].c/contracts["Cryptogs"].totalSupply()
  }
}

app.get('/commits', (req, res) => {
  console.log("Getting All Commits")
  var stream = redis.scanStream({
    match: 'commit_*',
    count: 100
  });
  var commits = [];
  stream.on('data', function (result) {
    // `resultKeys` is an array of strings representing key names
    for (var i = 0; i < result.length; i++) {
      commits.push(result[i]);
    }
  });
  stream.on('end', function () {
    console.log('sending commits: ', commits);
    res.end(JSON.stringify(commits))
  });

});

app.get('/commit/:commit', (req, res) => {
  console.log("Getting Commit ",req.params.commit)
  let commit = req.params.commit
  if(commit.indexOf("0x")>=0) commit=commit.replace("0x","");
  redis.get("commit_"+commit, function (err, result) {
    //console.log(result);
    res.end(result)
  });
});

app.post('/create', function(request, response){
    console.log(request.body);      // your JSON
    var d = new SHA3.SHA3Hash(224);
    d.update(Math.random()+Date.now()+""+JSON.stringify(request.body));
    let secret = d.digest('hex');
    console.log("secret",secret)
    d.update(secret);
    let reveal = d.digest('hex');
    console.log("reveal",reveal)
    redis.set(reveal,secret,"ex",COMMIT_EXPIRE);
    d.update(reveal);
    let commit = d.digest('hex');
    console.log("commit",commit)
    redis.set(commit,reveal,"ex",COMMIT_EXPIRE);

    let key = "commit_"+commit

    let token1 = getToken(request.body.finalArray[0])
    let token2 = getToken(request.body.finalArray[1])
    let token3 = getToken(request.body.finalArray[2])
    let token4 = getToken(request.body.finalArray[3])
    let token5 = getToken(request.body.finalArray[4])


    let update = {
      commit:commit,
      counterStacks:[],
      player1: request.body.account,
      stackMode: 0,
      stackData: {
        block:-1,
        owner: request.body.account,
        token1: token1.id,
        token2: token2.id,
        token3: token3.id,
        token4: token4.id,
        token5: token5.id,
        token1Image: token1.image,
        token2Image: token2.image,
        token3Image: token3.image,
        token4Image: token4.image,
        token5Image: token5.image,
      }
    }

    let value = JSON.stringify(update)
    console.log("SETTING REDIS "+key+" TO "+value)
    redis.set(key,value,"ex",COMMIT_EXPIRE);
    response.end(value)
});

app.post('/counter', function(request, response){
  let commit = request.body.commit
  if(commit.indexOf("0x")>=0) commit=commit.replace("0x","");
  console.log("Getting Commit ",commit)
  redis.get("commit_"+commit, function (err, commitData) {
    commitData=JSON.parse(commitData)
    console.log(commitData);

    let token1 = getToken(request.body.finalArray[0])
    let token2 = getToken(request.body.finalArray[1])
    let token3 = getToken(request.body.finalArray[2])
    let token4 = getToken(request.body.finalArray[3])
    let token5 = getToken(request.body.finalArray[4])

    var d = new SHA3.SHA3Hash(224);
    d.update(Math.random()+Date.now()+""+JSON.stringify(request.body));
    let id = d.digest('hex');

    let counterStack = {
      _counterStack:id,
      block:-1,
      commit: commit,
      owner: request.body.account,
      token1: token1.id,
      token2: token2.id,
      token3: token3.id,
      token4: token4.id,
      token5: token5.id,
      token1Image: token1.image,
      token2Image: token2.image,
      token3Image: token3.image,
      token4Image: token4.image,
      token5Image: token5.image,
    }

    commitData.counterStacks.push(counterStack)
    let key = "commit_"+commit
    let value = JSON.stringify(commitData)
    console.log("SETTING REDIS "+key+" TO "+value)
    redis.set(key,value,"ex",COMMIT_EXPIRE);
    response.end(value)

  });

});

app.post('/accept', function(request, response){
    console.log(request.body);      // your JSON
    let commit = request.body.commit
    if(commit.indexOf("0x")>=0) commit=commit.replace("0x","");
    console.log("Getting Commit ",commit)
    redis.get("commit_"+commit, function (err, commitData) {
      commitData=JSON.parse(commitData)
      commitData._counterStack = request.body.counterStack
      let key = "commit_"+commit
      let value = JSON.stringify(commitData)
      console.log("SETTING REDIS "+key+" TO "+value)
      redis.set(key,value,"ex",COMMIT_EXPIRE);
      response.end(value)
    })

})


app.listen(8001);
console.log(`Cryptogs http webserver listening on 8001`);

//https.createServer(sslOptions, app).listen(443)
//console.log(`Cryptogs api https webserver listening on 443`);


async function syncTokens() {
  console.log("Syncing Tokens....",contracts["Cryptogs"].methods)
  let totalSupply = await contracts["Cryptogs"].methods.totalSupply().call()
  console.log("Total Supply:",totalSupply)
}
