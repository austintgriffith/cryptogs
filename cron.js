const clevis = require("clevis")
const fs = require("fs")
var twilio = require('twilio');
var twilioClient = new twilio(fs.readFileSync("backend/twilio.sid").toString().trim(), fs.readFileSync("backend/twilio.token").toString().trim());

async function run(){
  console.log("Updating...")
  let clevisConfig = JSON.parse(await clevis("update"))

  let blockNumber = parseInt(JSON.parse(await clevis("blockNumber")))
  console.log("Block",blockNumber)
  if(!blockNumber||blockNumber<1){
    console.log("ERROR getting block.. SENDING TEXT IF NOT SENT (clear by deleting sent.text once you fix geth)")
    let sentText = 0
    try{
      sentText = fs.readFileSync("sent.text").toString().trim()
    }catch(e){}
    if(!sentText){
      fs.writeFileSync("sent.text",1)
      twilioClient.messages.create({
          to:'+13038345151',
          from:'+17206059912',
          body:'Cryptogs PRODUCTION GETH ERROR'
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

  }else{
    console.log("clevisConfig",clevisConfig)
    let balance = await clevis("balance",fs.readFileSync("Cryptogs/Cryptogs.address").toString().trim())
    let lastBalace = 0
    try{
      lastBalace = fs.readFileSync("last.balance").toString().trim()
    }catch(e){}
    console.log("balance",balance)
    console.log("lastBalace",lastBalace)
    if(lastBalace!=balance.ether){
      console.log("Send update...")
      twilioClient.messages.create({
          to:'+13038345151',
          from:'+17206059912',
          body:'Balance: '+lastBalace+' --> '+balance.ether+' (+'+(balance.ether-lastBalace)+') total at current price($'+clevisConfig.ethprice+'): $'+balance.usd+''
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
    fs.writeFileSync("last.balance",balance.ether)
    fs.appendFileSync("cron.csv",Date.now()+","+clevisConfig.ethprice+","+clevisConfig.gasprice+","+balance.ether+"\n")
  }
}

run()
