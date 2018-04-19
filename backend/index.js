"use strict";
const EventParser = require('./modules/eventParser.js');
const LiveParser = require('./modules/liveParser.js');
const axios = require('axios');
const express = require('express');
const https = require('https');
const helmet = require('helmet');

const app = express();
const fs = require('fs');
const Redis = require('ioredis');
const ContractLoader = require('./modules/contractLoader.js');
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var cors = require('cors')
app.use(cors())
var multer = require('multer');
app.use(multer({dest:'./uploads/'}).single('File'));
var SHA3 = require('sha3');
var twilio = require('twilio');
var twilioClient = new twilio(fs.readFileSync("twilio.sid").toString().trim(), fs.readFileSync("twilio.token").toString().trim());


const ARTIST_EXPIRE = 9999999999
const COMMIT_EXPIRE = 300 // commit expires quick if game isn't picked up
const TRANSFER_EXPIRE = 3000 // commit expires quick if game isn't picked up
const GENERATE_EXPIRE = 86400 // once a game is solid, let's cache it for longer
const PHONE_EXPIRE = 86400*7
const CHECKIN_EXPIRE = 30
const JOINING_EXPIRE = 15


let contracts;
let tokens = [];

var Web3 = require('web3');
var web3 = new Web3();

const NETWORK = parseInt(fs.readFileSync("../deploy.network").toString().trim())
if(!NETWORK){
  console.log("No deploy.network found exiting...")
  process.exit()
}
console.log("NETWORK:",NETWORK)

let redisHost = 'localhost'
let redisPort = 57290
if(NETWORK==3){
  redisHost = 'stagecryptogs.048tmy.0001.use2.cache.amazonaws.com'
  redisPort = 6379
}else if(NETWORK==1){
  redisHost = 'cryptogs.048tmy.0001.use2.cache.amazonaws.com'
  redisPort = 6379
}

web3.setProvider(new web3.providers.HttpProvider('http://0.0.0.0:8545'));

console.log("LOADING CONTRACTS")
contracts = ContractLoader(["Cryptogs","SlammerTime","PizzaParlor"],web3,NETWORK);

contracts["Cryptogs"].methods.author().call({}, function(error, result){
    console.log("AUTHOR",error,result)
});

var redis = new Redis({
  port: redisPort,
  host: redisHost,
})

let games = {}

web3.eth.getBlockNumber().then((blockNumber)=>{
  console.log("=== STARTING EVENT PARSERS AT CURRENT BLOCKNUMBER:",blockNumber,contracts["Cryptogs"].blockNumber)

  let updateGenerateGame= async (update)=>{
    if(!games[update._commit]){
      games[update._commit] = update
    }else{
      games[update._commit] = Object.assign(games[update._commit],update)
    }
  }
  EventParser(contracts["PizzaParlor"],"GenerateGame",contracts["Cryptogs"].blockNumber,blockNumber,updateGenerateGame);
  setInterval(()=>{
    LiveParser(contracts["PizzaParlor"],"GenerateGame",blockNumber,updateGenerateGame)
  },997)

  let updateTransferStack= async (update)=>{
    if(!games[update._commit]) games[update._commit] = {}
    if(!games[update._commit]['player1']||games[update._commit]['player1']._sender == update._sender){
      games[update._commit]['player1'] = update;
    }else if(!games[update._commit]['player2']){
      games[update._commit]['player2'] = update;
    }
  }
  EventParser(contracts["PizzaParlor"],"TransferStack",contracts["Cryptogs"].blockNumber,blockNumber,updateTransferStack);
  setInterval(()=>{
    LiveParser(contracts["PizzaParlor"],"TransferStack",blockNumber,updateTransferStack)
  },999)


  let updateFlip = async (update)=>{
    if(!games[update._commit]) games[update._commit] = {}
    if(!games[update._commit]['flips']) games[update._commit]['flips']=[]
    let found = false
    for(let f in games[update._commit]['flips']){
      if(games[update._commit]['flips'][f]._token==update._token){
        found=true;
        break;
      }
    }
    if(!found) games[update._commit]['flips'].push(update)
  }
  EventParser(contracts["PizzaParlor"],"Flip",contracts["Cryptogs"].blockNumber,blockNumber,updateFlip);
  setInterval(()=>{
    LiveParser(contracts["PizzaParlor"],"Flip",blockNumber,updateFlip)
  },797)
})

/*
var pub = new Redis({
  port: redisPort,
  host: redisHost,
})
var sub = new Redis({
  port: redisPort,
  host: redisHost,
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
*/

app.get('/games', (req, res) => {
  console.log("GAMES")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify(games));
});
app.get('/games/:commit', (req, res) => {
  console.log("GAMES",req.params.commit)
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify(games[req.params.commit]));
});

app.get('/stats/:account', (req, res) => {
  console.log("STATS")
  let account = req.params.account
  let gamesPlayed = []
  let togsWon = []
  let togsLost = []
  for(let c in games){
    if(games[c]){
      let playedInGame = false
      if(games[c].player1&&games[c].player1._sender==account){
        gamesPlayed.push(c)
        playedInGame=true
      }else if(games[c].player2&&games[c].player2._sender==account){
        gamesPlayed.push(c)
        playedInGame=true
      }
      if(playedInGame&&games[c].flips){
        for(let f in games[c].flips){
          if(games[c].flips[f]._flipper==account){
            togsWon.push(games[c].flips[f]._token)
          }else{
            togsLost.push(games[c].flips[f]._token)
          }
        }
      }
    }
  }

  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({gamesPlayed:gamesPlayed,togsWon:togsWon.length,togsLost:togsLost.length}));
});


app.use(helmet());

app.get('/', (req, res) => {
  let stamp=Date.now()
  console.log("/",stamp)
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({version:1,timestamp:stamp}));
});

app.get('/author', (req, res) => {
  contracts["Cryptogs"].methods.author().call({}, function(error, result){
      console.log("AUTHOR",error,result)
      let stamp=Date.now()
      console.log("/",stamp)
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify({version:1,timestamp:stamp,author:result}));
  });

});


app.get('/hook', (req, res) => {
  console.log("HOOK",req.params,req.query)
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({timestamp:Date.now()}));
});

app.get('/token/:token', async (req, res) => {
    console.log("/Token/ ",req.params.token)
    let token = await getToken(req.params.token);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify(token))
});

app.get('/reveal/:commit/:receipt1/:user1/:receipt2/:user2', async (req, res) => {
    console.log("/reveal/ ",req.params)
    let receipt1 = await contracts["PizzaParlor"].methods.commitReceipt(req.params.commit,req.params.user1).call()
    let receipt2 = await contracts["PizzaParlor"].methods.commitReceipt(req.params.commit,req.params.user2).call()
    console.log(receipt1,receipt2)
    if(receipt1 != "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      receipt2 != "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      receipt1==req.params.receipt1 && receipt2==req.params.receipt2 )
    {
      redis.get("getReveal"+req.params.commit, function (err, result) {
        console.log("REVEAL:",result);
        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify({"commit":req.params.commit,"reveal":result}))
      });
    }else{
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify({"error":"invalid receipts"}))
    }

});

app.get('/secret/:commit/:receipt1/:user1/:receipt2/:user2', async (req, res) => {
    console.log("/reveal/ ",req.params)
    let receipt1 = await contracts["PizzaParlor"].methods.commitReceipt(req.params.commit,req.params.user1).call()
    let receipt2 = await contracts["PizzaParlor"].methods.commitReceipt(req.params.commit,req.params.user2).call()
    console.log(receipt1,receipt2)
    if(receipt1 != "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      receipt2 != "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      receipt1==req.params.receipt1 && receipt2==req.params.receipt2 )
    {
      redis.get("getReveal"+req.params.commit, function (err, result) {
        console.log("REVEAL:",result);
        redis.get("getSecret"+result, function (err, result) {
          console.log("SECRET:",result);
          res.set('Content-Type', 'application/json');
          res.end(JSON.stringify({"commit":req.params.commit,"secret":result}))
        });
      });
    }else{
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify({"error":"invalid receipts"}))
    }
});

async function getToken(id){
  let tokenData = await contracts["Cryptogs"].methods.getToken(id).call()
  let totalSupply = await contracts["Cryptogs"].methods.totalSupply().call()
  return {
    id:id,
    owner:tokenData.owner,
    image:web3.utils.toAscii(tokenData.image).replace(/[^a-zA-Z\d\s.]+/g,""),
    copies:tokenData.copies,
    prevalence:tokenData.copies/totalSupply
  }
}

app.get('/commits', (req, res) => {
  console.log("Getting All Commits")
  var stream = redis.scanStream({
    match: 'commit_*'
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
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify(commits))
  });
});

app.get('/commit/:commit', (req, res) => {
  console.log("--Getting Commit ",req.params.commit)
  let commit = req.params.commit
  redis.get("commit_"+commit, function (err, result) {
    console.log(result);
    res.set('Content-Type', 'application/json');
    res.end(result)
  });
});

app.get('/test', (req, res) => {
  console.log("--TEST",req.params)

  res.end(JSON.stringify({test:true}))
});

app.post('/phone', async function(request, response){
    console.log("PHONE",request.body);
    redis.set("phone_"+request.body.account,request.body.phone,"ex",PHONE_EXPIRE);
})

app.post('/upload',function (req, res, next) {
  console.log("UPLOAD",req.body,req.file);
  res.set('Content-Type', 'application/json');

  if(req.file.size > 80000){
    console.log("File was too large... returning error...")
    res.end(JSON.stringify({upload:false,message:"Failed to upload, the image is too big."}))
  }else{
    var dir = './artwork/';
    if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
    dir = './artwork/'+req.body.account.replace(/[^a-zA-Z0-9]+/g,"");
    if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
    fs.renameSync("./"+req.file.path.replace(/[^a-zA-Z0-9/]+/g,""),dir+"/"+Date.now()+req.file.filename.substring(0,8)+req.file.originalname.substring(req.file.originalname.lastIndexOf('.')));
    res.end(JSON.stringify({upload:true}))
  }



})
app.use(express.static('artwork'))
app.get('/artwork/:account', (req, res) => {
  console.log("ARTWORK",req.params)

  var dir = './artwork/';
  if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
  dir = './artwork/'+req.params.account.replace(/[^a-zA-Z0-9]+/g,"");
  if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

  var files = fs.readdirSync(dir);
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({files:files}))
});
app.get('/artwork', (req, res) => {
  console.log("LIST ARTWORK",req.params)

  var dir = './artwork/';
  if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
  var files = fs.readdirSync(dir);
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({files:files}))
});

app.post('/artist',function (req, res, next) {
  console.log("SET ARTIST",req.body,req.file);
  if(req.body.name) redis.set("artist_"+req.body.account,req.body.name.replace(/[^a-zA-Z0-9 ]+/g,""),"ex",ARTIST_EXPIRE);
  if(req.body.email) redis.set("artistEmail_"+req.body.account,req.body.email.replace(/[^a-zA-Z0-9@_ .-]+/g,""),"ex",ARTIST_EXPIRE);
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({artist:req.body.name,email:req.body.email}))
})
app.get('/artist/:account', (req, res) => {
  console.log("GET ARTIST",req.params.account)
  redis.get("artist_"+req.params.account, function (err, name) {
    console.log(name);
    redis.get("artistEmail_"+req.params.account, function (err, email) {
      console.log(email);
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify({artist:name,email:email}))
    });
  });
});

app.post('/mint', function(request, response){
    console.log("MINT!",request.body);      // your JSON
    let account = request.body.account.replace(/[^a-zA-Z0-9]+/g,"");
    let file = request.body.file.replace(/[^a-zA-Z0-9.]+/g,"");
    let stack = request.body.stack
    let hash = request.body.hash.replace(/[^a-zA-Z0-9.]+/g,"");
    let type = "MINT"
    if(stack){
      type = "MINTSTACK"
    }
    twilioClient.messages.create({
        to:'+13038345151',
        from:'+17206059912',
        body:'Cryptogs '+type+' ('+NETWORK+'): '+account+' '+file+" "+hash
    }, function(error, message) {
        if (!error) {
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);
            console.log('Message sent on:');
            console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    });
    response.set('Content-Type', 'application/json');
    response.end(JSON.stringify({mint:true}))
})



app.post('/delete', function(request, response){
    console.log("DELETE!",request.body);      // your JSON

    let account = request.body.account.replace(/[^a-zA-Z0-9]+/g,"");
    let file = request.body.file.replace(/[^a-zA-Z0-9.]+/g,"");
    let result = false
    try{
      result = fs.unlinkSync("./artwork/"+account+"/"+file)
    }catch(e){console.log(e)}
    response.set('Content-Type', 'application/json');
    response.end(JSON.stringify({delete:result}))

})

app.post('/touch', async function(request, response){
    console.log("TOUCH",request.body);
    let commit = request.body.commit
    updateTTL(commit,COMMIT_EXPIRE)
    response.set('Content-Type', 'application/json');
    response.end(JSON.stringify({touched:true}))
})

app.post('/joining', async function(request, response){
  let time = Date.now()
  let commit = request.body.commit
  let account = request.body.account
  console.log("JOINING POST",time,request.body);
  redis.set("joining_"+commit,account,"ex",JOINING_EXPIRE);
  response.set('Content-Type', 'application/json');
  response.end(JSON.stringify({joining:true}))
})

app.get('/joining/:commit', (req, res) => {
  console.log("--Getting Joining ",req.params.commit)
  let commit = req.params.commit
  redis.get("joining_"+commit, function (err, result) {
    console.log(result);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({joining:result}))
  });
});


app.post('/checkin', async function(request, response){
  let time = Date.now()
    console.log("checkin",time,request.body);
    let account = request.body.account
    redis.set("activeUser_"+account,time,"ex",CHECKIN_EXPIRE);


    var stream = redis.scanStream({
      match: 'activeUser_*'
    });
    var activeUsers = [];
    stream.on('data', function (result) {
      for (var i = 0; i < result.length; i++) {
        activeUsers.push(result[i].replace("activeUser_",""));
      }
    });
    stream.on('end', function () {
      console.log('sending active users: ', activeUsers);
      response.set('Content-Type', 'application/json');
      response.end(JSON.stringify(activeUsers))
    });

})

function updateTTL(commit,ttl){
  let key = "commit_"+commit
  redis.expire(key,ttl);
  let revealKey = "getReveal"+commit
  redis.expire(revealKey,ttl);
  redis.get(revealKey, function (err, result) {
    let secretKey = "getSecret"+result
    redis.expire(secretKey,ttl);
  });
}

app.post('/create', async function(request, response){
    console.log("CREATE",request.body);      // your JSON
    let secret = web3.utils.keccak256(Math.random()+Date.now()+""+JSON.stringify(request.body));
    console.log("secret",secret)
    let reveal = web3.utils.keccak256(secret);
    console.log("reveal",reveal)
    redis.set("getSecret"+reveal,secret,"ex",COMMIT_EXPIRE);
    let commit = web3.utils.keccak256(reveal);
    console.log("commit",commit)
    redis.set("getReveal"+commit,reveal,"ex",COMMIT_EXPIRE);
    let key = "commit_"+commit
    let token1 = await getToken(request.body.finalArray[0])
    let token2 = await getToken(request.body.finalArray[1])
    let token3 = await getToken(request.body.finalArray[2])
    let token4 = await getToken(request.body.finalArray[3])
    let token5 = await getToken(request.body.finalArray[4])
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
    response.set('Content-Type', 'application/json');
    response.end(value)

    twilioClient.messages.create({
        to:'+13038345151',
        from:'+17206059912',
        body:'Cryptogs ('+NETWORK+'): https://cryptogs.io/join/'+commit
    }, function(error, message) {
        if (!error) {
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);
            console.log('Message sent on:');
            console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    });

    if(NETWORK==1){
      var postData = {
        "content": 'A new game is looking for challengers: https://cryptogs.io/join/'+commit,
        "username": "Cryptog"
      };
      let axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
        }
      };
      axios.post(fs.readFileSync("discord.webhook").toString().trim(), postData, axiosConfig)
      .then((res) => {
        console.log("RESPONSE RECEIVED: ", res);
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      })

      postData = {
        "text": 'A new game is looking for challengers: https://cryptogs.io/join/'+commit,
      };
      axios.post(fs.readFileSync("slack.webhook").toString().trim(), postData, axiosConfig)
      .then((res) => {
        console.log("RESPONSE RECEIVED: ", res);
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      })
    }


});

app.post('/counter',  function(request, response){
  let commit = request.body.commit
  console.log("Getting Commit ",commit)
  redis.get("commit_"+commit,async function (err, commitData) {
    commitData=JSON.parse(commitData)
    console.log(commitData);
    let token1 = await getToken(request.body.finalArray[0])
    let token2 = await getToken(request.body.finalArray[1])
    let token3 = await getToken(request.body.finalArray[2])
    let token4 = await getToken(request.body.finalArray[3])
    let token5 = await getToken(request.body.finalArray[4])
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
      canceled: false
    }
    commitData.counterStacks.push(counterStack)
    let key = "commit_"+commit
    let value = JSON.stringify(commitData)
    console.log("SETTING REDIS "+key+" TO "+value)
    redis.set(key,value,"ex",COMMIT_EXPIRE);
    response.set('Content-Type', 'application/json');
    response.end(value)
    redis.get("phone_"+commitData.stackData.owner, function (err, phone) {
      if(phone&&phone!=null&&phone!="null"){
        console.log("SEND A TEXT TO "+phone)
        twilioClient.messages.create({
            to:phone,
            from:'+17206059912',
            body:'A challenger has arrived: https://cryptogs.io/play/'+commit
        }, function(error, message) {
            if (!error) {
                console.log('Success! The SID for this SMS message is:');
                console.log(message.sid);
                console.log('Message sent on:');
                console.log(message.dateCreated);
            } else {
                console.log('Oops! There was an error.');
            }
        });
      }
    })
  });
});

app.post('/accept', function(request, response){
    console.log(request.body);      // your JSON
    let commit = request.body.commit
    console.log("Getting Commit ",commit)
    redis.get("commit_"+commit, function (err, commitData) {
      commitData=JSON.parse(commitData)
      commitData._counterStack = request.body.counterStack
      let key = "commit_"+commit
      let value = JSON.stringify(commitData)
      console.log("SETTING REDIS "+key+" TO "+value)
      redis.set(key,value,"ex",TRANSFER_EXPIRE);

      updateTTL(commit,TRANSFER_EXPIRE)

      response.set('Content-Type', 'application/json');
      response.end(value)
    })
})

app.post('/cancel', function(request, response){
    console.log("CANCEL",request.body);      // your JSON
    let commit = request.body.commit
    console.log("Deleting Commit ",commit)
    redis.del("commit_"+commit, function (err, commitData) {
      response.set('Content-Type', 'application/json');
      response.end(JSON.stringify({delete:"true",commit:request.body.commit}))
    })
})

app.post('/cancelcounter', function(request, response){
    console.log("CANCELCOUNTER",request.body);      // your JSON
    let commit = request.body.commit
    let counter = request.body.counter
    redis.get("commit_"+commit, function (err, result) {
      let commitData=JSON.parse(result)
      console.log("CURRENT DATA TO CANCEL",commitData)
      let canceledSender=false;
      for(let c in commitData.counterStacks){
        if(commitData.counterStacks[c]._counterStack==counter){
          canceledSender = commitData.counterStacks[c].owner.toLowerCase()
          commitData.counterStacks[c].canceled = true;
        }
      }
      if(canceledSender){
        if(!commitData.canceledSenders) commitData.canceledSenders=[]
        commitData.canceledSenders.push(canceledSender)
      }
      let key = "commit_"+commit
      let value = JSON.stringify(commitData)
      console.log("SETTING REDIS "+key+" TO "+value)
      redis.set(key,value,"ex",COMMIT_EXPIRE);
      response.set('Content-Type', 'application/json');
      response.end(value)
    });
})


app.post('/transfer', async function(request, response){
    console.log("TRANSFER",request.body);
    redis.set("transfer_"+request.body.stack.commit+"_"+request.body.stack.owner,request.body.txhash,"ex",TRANSFER_EXPIRE);

    //if you wanted to you could mark tokens as used here too
    console.log("usedtoken_"+request.body.stack.token1)

    updateTTL(request.body.stack.commit,TRANSFER_EXPIRE)

    response.set('Content-Type', 'application/json');
    response.end(JSON.stringify({thanks:true}))
});
app.get('/transfer/:commit/:user', (req, res) => {
  console.log("--Getting Transfer Tx ",req.params.commit)
  redis.get("transfer_"+req.params.commit+"_"+req.params.user, function (err, result) {
    console.log(result);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({txhash:result}))
  });
});

app.post('/revoke', async function(request, response){
    redis.set("transfer_"+request.body.stack.commit+"_"+request.body.stack.owner,"0","ex",1);
    response.set('Content-Type', 'application/json');
    response.end(value)
});


app.post('/generate', async function(request, response){
    console.log("GENERATE",request.body);
    redis.set("generate_"+request.body.stack.commit,request.body.txhash,"ex",GENERATE_EXPIRE);

    updateTTL(request.body.stack.commit,GENERATE_EXPIRE)

    response.set('Content-Type', 'application/json');
    response.end(JSON.stringify({thanks:true}))
});
app.get('/generate/:commit', (req, res) => {
  console.log("--Getting Generate Tx ",req.params.commit)
  redis.get("generate_"+req.params.commit, function (err, result) {
    console.log(result);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({txhash:result}))
  });
});

try{
  var sslOptions = {
    key: fs.readFileSync('../reactapp/privkey.pem'),
    cert: fs.readFileSync('../reactapp/fullchain.pem')
  }

  https.createServer(sslOptions, app).listen(8001)
  console.log(`Cryptogs api https webserver listening on 8001`);
}catch(e){
  console.log(e)


}

  app.listen(8002);
  console.log(`Cryptogs backend listening on 8002`);

async function syncTokens() {
  console.log("Syncing Tokens....",contracts["Cryptogs"].methods)
  let totalSupply = await contracts["Cryptogs"].methods.totalSupply().call()
  console.log("Total Supply:",totalSupply)
}
