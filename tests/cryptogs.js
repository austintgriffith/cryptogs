const clevis = require("clevis")
const colors = require('colors')
const chai = require("chai")
const assert = chai.assert
const expect = chai.expect;
const should = chai.should();
const fs = require('fs')
const Web3 = require('web3')
const clevisConfig = JSON.parse(fs.readFileSync("clevis.json").toString().trim())
web3 = new Web3(new Web3.providers.HttpProvider(clevisConfig.provider))
const tab = "\t\t";
function localContractAddress(contract){
  return fs.readFileSync(contract+"/"+contract+".address").toString().trim()
}
function printTxResult(result){
  console.log(tab,result.transactionHash.gray,(""+result.gasUsed).yellow)
}
function bigHeader(str){
  return "########### "+str+" "+Array(128-str.length).join("#")
}
function rand(min, max) {
  return Math.floor( Math.random() * (max - min) + min );
}
const contractsDir = "reactapp/src/contracts/"
function loadAbi(contract,deployNetwork){
  let abi = fs.readFileSync(contract+"/"+contract+".abi").toString().trim()
  console.log(tab,contract.cyan,"ABI:",(""+abi.length).yellow)
  assert(abi,"No ABI for "+contract+"!?")
  fs.writeFileSync(contractsDir+contract+"."+deployNetwork+".abi.js","module.exports = "+abi);
}
function loadAddress(contract,deployNetwork){
  let addr = fs.readFileSync(contract+"/"+contract+".address").toString().trim()
  console.log(tab,contract.cyan,"ADDRESS:",addr.blue)
  assert(addr,"No Address for "+contract+"!?")
  fs.writeFileSync(contractsDir+contract+"."+deployNetwork+".address.js","module.exports = \""+addr+"\"");
}
function loadBlockNumber(contract,deployNetwork){
  let blockNumber = fs.readFileSync(contract+"/"+contract+".blockNumber").toString().trim()
  console.log(tab,contract.cyan,"blockNumber:",blockNumber.blue)
  assert(blockNumber,"No blockNumber for "+contract+"!?")
  fs.writeFileSync(contractsDir+contract+"."+deployNetwork+".blockNumber.js","module.exports = \""+blockNumber+"\"");
}

let COMMIT

module.exports = {
  compile:(contract)=>{
    describe('#compile() '+contract.magenta, function() {
      it('should compile '+contract.magenta+' contract to bytecode', async function() {
        this.timeout(90000)
        const result = await clevis("compile",contract)
        assert(Object.keys(result.contracts).length>0, "No compiled contacts found.")
        let count = 0
        for(let c in result.contracts){
          console.log("\t\t"+"contract "+c.blue+": ",result.contracts[c].bytecode.length)
          if(count++==0){
              assert(result.contracts[c].bytecode.length > 1, "No bytecode for contract "+c)
          }
        }
      });
    });
  },
  deploy:(contract,accountindex)=>{
    describe('#deploy() '+contract.magenta, function() {
      it('should deploy '+contract.magenta+' as account '+accountindex, async function() {
        this.timeout(360000)
        const result = await clevis("deploy",contract,accountindex)
        printTxResult(result)
        console.log(tab+"Address: "+result.contractAddress.blue)
        assert(result.contractAddress)
      });
    });
  },
  mint:(accountindex,image,toIndex)=>{
    describe('#testMint() ', function() {
      it('should mint a cryptog', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const result = await clevis("contract","mint","Cryptogs",accountindex,web3.utils.fromAscii(image),accounts[toIndex])
        printTxResult(result)
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[toIndex])
        const lastToken = tokensOfOwner[tokensOfOwner.length-1]
        const token = await clevis("contract","getToken","Cryptogs",lastToken)
        assert(token.owner==accounts[toIndex],"This should never be wrong!?!")
        const cleanImage = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
        assert(cleanImage==image,"Image of minted token doesn't equal image we meant to mint.. hah.")
        console.log(tab,accounts[accountindex].blue+" minted Cryptog "+lastToken.magenta+" to account "+accounts[toIndex].cyan+" with image "+cleanImage.white)
      });
    });
  },
  airdrop:(accountindex,image,toAddress)=>{
    describe('#testMint() ', function() {
      it('should mint a cryptog', async function() {
        this.timeout(120000)
        const result = await clevis("contract","mint","Cryptogs",accountindex,web3.utils.fromAscii(image),toAddress)
        printTxResult(result)
      });
    });
  },
  mintPack:(accountindex,images,price)=>{
    describe('#testMint() ', function() {
      it('should mint a cryptog', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        let imageBytes = []

        console.log(images)

        for(let i in images){
          imageBytes[i] = web3.utils.fromAscii(images[i])
        }

        const result = await clevis("contract","mintPack","Cryptogs",accountindex,web3.utils.toWei(""+price, "ether"),imageBytes[0],imageBytes[1],imageBytes[2],imageBytes[3],imageBytes[4],imageBytes[5],imageBytes[6],imageBytes[7],imageBytes[8],imageBytes[9])
        printTxResult(result)
        console.log(tab,accounts[accountindex].blue+" minted pack ")
      });
    });
  },
  submitStack:(accountindex)=>{
    describe('#submitStack() ', function() {
      it('should submit stack', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[accountindex])
        const token5 = tokensOfOwner[tokensOfOwner.length-1]
        const token4 = tokensOfOwner[tokensOfOwner.length-2]
        const token3 = tokensOfOwner[tokensOfOwner.length-3]
        const token2 = tokensOfOwner[tokensOfOwner.length-4]
        const token1 = tokensOfOwner[tokensOfOwner.length-5]
        const SlammerTimeAddress = localContractAddress("SlammerTime")
        const result = await clevis("contract","submitStack","Cryptogs",accountindex,SlammerTimeAddress,token1,token2,token3,token4,token5)
        printTxResult(result)
        const approveContract = await clevis("contract","tokenIndexToApproved","Cryptogs",token5)
        assert(approveContract == SlammerTimeAddress,"SlammerTime is NOT approved to move the token "+token5)
      });
    });
  },
  submitCounterStack:(accountindex)=>{
    describe('#submitCounterStack() ', function() {
      it('should submit counter stack', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[accountindex])
        const token5 = tokensOfOwner[tokensOfOwner.length-1]
        const token4 = tokensOfOwner[tokensOfOwner.length-2]
        const token3 = tokensOfOwner[tokensOfOwner.length-3]
        const token2 = tokensOfOwner[tokensOfOwner.length-4]
        const token1 = tokensOfOwner[tokensOfOwner.length-5]
        const SlammerTimeAddress = localContractAddress("SlammerTime")

        //we need to get the stack id for the last submit event
        ///÷clevis contract eventSubmitStack Cryptogs
        const SubmitStackEvents  = await clevis("contract","eventSubmitStack","Cryptogs")
        //console.log("SubmitStackEvents",SubmitStackEvents)
        const lastSubmitStackEvent = SubmitStackEvents[SubmitStackEvents.length-1]
        //console.log("lastSubmitStackEvent",lastSubmitStackEvent)
        const lastStackId = lastSubmitStackEvent.returnValues._stack
        console.log(tab,"Last stack id:",lastStackId.cyan)

        const result = await clevis("contract","submitCounterStack","Cryptogs",accountindex,SlammerTimeAddress,lastStackId,token1,token2,token3,token4,token5)
        printTxResult(result)
        const approveContract = await clevis("contract","tokenIndexToApproved","Cryptogs",token5)
        assert(approveContract == SlammerTimeAddress,"SlammerTime is NOT approved to move the token "+token5)
      });
    });
  },
  acceptCounterStack:(accountindex)=>{
    describe('#acceptCounterStack() ', function() {
      it('should accept counter stack', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const SlammerTimeAddress = localContractAddress("SlammerTime")

        const CounterStackEvents  = await clevis("contract","eventCounterStack","Cryptogs")
        //console.log(CounterStackEvents)
        const lastCounterStackEvent = CounterStackEvents[CounterStackEvents.length-1]
        //console.log(lastCounterStackEvent)
        const lastStackId = lastCounterStackEvent.returnValues._stack
        console.log(tab,"Last stack id:",lastStackId.cyan)
        const lastCounterStackId = lastCounterStackEvent.returnValues._counterStack
        console.log(tab,"Last counter stack id:",lastCounterStackId.cyan)

        const result = await clevis("contract","acceptCounterStack","Cryptogs",accountindex,SlammerTimeAddress,lastStackId,lastCounterStackId)
        printTxResult(result)
      });
    });
  },
  startCoinFlip:(accountindex)=>{
    describe('#startCoinFlip() ', function() {
      it('should start coin flip with commit', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")

        const AcceptCounterStackEvents  = await clevis("contract","eventAcceptCounterStack","Cryptogs")
        //console.log(CounterStackEvents)
        const lastAcceptCounterStackEvent = AcceptCounterStackEvents[AcceptCounterStackEvents.length-1]
        //console.log(lastCounterStackEvent)
        const lastStackId = lastAcceptCounterStackEvent.returnValues._stack
        const lastCounterStackId = lastAcceptCounterStackEvent.returnValues._counterStack
        console.log(tab,"Last stack id:",lastStackId.cyan)

        let web3 = new Web3()
        COMMIT = web3.utils.sha3(Math.random()+Date.now()+"CRYPTOGS4LIFE");
        console.log(tab,"Using Commit:",COMMIT.blue)
        let commitHash = web3.utils.sha3(COMMIT);
        console.log(tab,"Commit hash:",commitHash.magenta)

        const result = await clevis("contract","startCoinFlip","Cryptogs",accountindex,lastStackId,lastCounterStackId,commitHash)
        printTxResult(result)
      });
    });
  },
  endCoinFlip:(accountindex)=>{
    describe('#endCoinFlip() ', function() {
      it('should end coin flip with commit', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")

        const AcceptCounterStackEvents  = await clevis("contract","eventAcceptCounterStack","Cryptogs")
        //console.log(CounterStackEvents)
        const lastAcceptCounterStackEvent = AcceptCounterStackEvents[AcceptCounterStackEvents.length-1]
        //console.log(lastCounterStackEvent)
        const lastStackId = lastAcceptCounterStackEvent.returnValues._stack
        const lastCounterStackId = lastAcceptCounterStackEvent.returnValues._counterStack
        console.log(tab,"Last stack id:",lastStackId.cyan)


        const result = await clevis("contract","endCoinFlip","Cryptogs",accountindex,lastStackId,lastCounterStackId,COMMIT)
        printTxResult(result)

        const player1 = await clevis("contract","stackOwner","Cryptogs",lastStackId)
        console.log(tab,"player1",player1)
        const player2 = await clevis("contract","stackOwner","Cryptogs",lastCounterStackId)
        console.log(tab,"player2",player2)
        const lastActor = await clevis("contract","lastActor","Cryptogs",lastStackId)
        console.log(tab,"lastActor",lastActor)


      });
    });
  },
  raiseSlammer:(player1Index,player2Index)=>{
    describe('#raiseSlammer() ', function() {
      it('should raise slammer for next player', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")

        const AcceptCounterStackEvents  = await clevis("contract","eventAcceptCounterStack","Cryptogs")
        //console.log(CounterStackEvents)
        const lastAcceptCounterStackEvent = AcceptCounterStackEvents[AcceptCounterStackEvents.length-1]
        //console.log(lastAcceptCounterStackEvent)
        const lastStackId = lastAcceptCounterStackEvent.returnValues._stack
        const lastCounterStackId = lastAcceptCounterStackEvent.returnValues._counterStack
        console.log(tab,"Last stack id:",lastStackId.cyan)

        const mode = await clevis("contract","mode","Cryptogs",lastStackId)
        console.log(tab,"CURRENT MODE:",mode.green)
        if(mode==9){
          console.log("GAME OVER, SKIP")
        }else{
          const player1 = await clevis("contract","stackOwner","Cryptogs",lastStackId)
          console.log(tab,"player1",player1)
          const player2 = await clevis("contract","stackOwner","Cryptogs",lastCounterStackId)
          console.log(tab,"player2",player2)
          const lastActor = await clevis("contract","lastActor","Cryptogs",lastStackId)
          console.log(tab,"lastActor",lastActor)
          let web3 = new Web3()
          COMMIT = web3.utils.sha3(Math.random()+Date.now()+"CRYPTOGS4LIFE");
          console.log(tab,"Using Commit:",COMMIT.blue)
          let commitHash = web3.utils.sha3(COMMIT);
          console.log(tab,"Commit hash:",commitHash.magenta)


          let accountindex
          if(player1==lastActor){
            console.log(tab,"it's player 2's turn...".white)
            //it's player 2's turn
            accountindex = player2Index
          }else{
            console.log(tab,"it's player 1's turn...".white)
            //it's player 1's turn
            accountindex = player1Index
          }
          console.log(tab,accountindex,lastStackId,lastCounterStackId,commitHash)
          const result = await clevis("contract","raiseSlammer","Cryptogs",accountindex,lastStackId,lastCounterStackId,commitHash)
          printTxResult(result)
        }


      });
    });
  },
  throwSlammer:(player1Index,player2Index)=>{
    describe('#throwSlammer() ', function() {
      it('should throw slammer for current player', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")

        const AcceptCounterStackEvents  = await clevis("contract","eventAcceptCounterStack","Cryptogs")
        //console.log(CounterStackEvents)
        const lastAcceptCounterStackEvent = AcceptCounterStackEvents[AcceptCounterStackEvents.length-1]
        //console.log(lastAcceptCounterStackEvent)
        const lastStackId = lastAcceptCounterStackEvent.returnValues._stack
        const lastCounterStackId = lastAcceptCounterStackEvent.returnValues._counterStack
        console.log(tab,"Last stack id:",lastStackId.cyan)

        const mode = await clevis("contract","mode","Cryptogs",lastStackId)
        console.log(tab,"CURRENT MODE:",mode.green)
        if(mode==9){
          console.log("GAME OVER, SKIP")
        }else{
          const player1 = await clevis("contract","stackOwner","Cryptogs",lastStackId)
          console.log(tab,"player1",player1)
          const player2 = await clevis("contract","stackOwner","Cryptogs",lastCounterStackId)
          console.log(tab,"player2",player2)
          const lastActor = await clevis("contract","lastActor","Cryptogs",lastStackId)
          console.log(tab,"lastActor",lastActor)

          let accountindex
          if(player1==lastActor){
            console.log(tab,"it's player 2's turn...".white)
            //it's player 2's turn
            accountindex = player2Index
          }else{
            console.log(tab,"it's player 1's turn...".white)
            //it's player 1's turn
            accountindex = player1Index
          }
          console.log(tab,"THROW SLAMMER",accountindex,lastStackId,lastCounterStackId,COMMIT)

          //throwSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _reveal)
          const result = await clevis("contract","throwSlammer","Cryptogs",accountindex,lastStackId,lastCounterStackId,COMMIT)
          printTxResult(result)
        }
      });
    });
  },
  report:()=>{
    describe('#report() ', function() {
      it('should report the Flips from the last game', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")

        const AcceptCounterStackEvents  = await clevis("contract","eventAcceptCounterStack","Cryptogs")
        //console.log(CounterStackEvents)
        const lastAcceptCounterStackEvent = AcceptCounterStackEvents[AcceptCounterStackEvents.length-1]
        //console.log(lastAcceptCounterStackEvent)
        const lastStackId = lastAcceptCounterStackEvent.returnValues._stack
        const lastCounterStackId = lastAcceptCounterStackEvent.returnValues._counterStack
        console.log(tab,"Last stack id:",lastStackId.cyan)

        const throwSlammerEvents  = await clevis("contract","eventThrowSlammer","Cryptogs")
        for(let e in throwSlammerEvents){
          if(throwSlammerEvents[e].returnValues.stack==lastStackId){
            console.log(tab,"Cryptog ",JSON.stringify(throwSlammerEvents));
          }
        }

      });
    });
  },
  metamask:()=>{
    describe('#transfer() ', function() {
      it('should give metamask account some ether', async function() {
        this.timeout(600000)
        //firefox
        await clevis("sendTo","0.1","0","0x5f19cEfc9C9D1BC63f9e4d4780493ff5577D238B")
        await clevis("sendTo","0.1","0","0xF11b9dCa0972e95b292891b027F5d8102e2cB8a5")
        await clevis("sendTo","0.1","0","0x2a906694d15df38f59e76ed3a5735f8aabcce9cb")
        await clevis("sendTo","0.1","0","0x55fFbCD5F80a7e22660A3B564447a0c1D5396A5C")


      });
    });
  },

  thisIsRad:(accountindex)=>{
    describe('#thisIsRad() ', function() {
      it('should call thisIsRad', async function() {
        this.timeout(120000)
        const result = await clevis("contract","thisIsRad","Cryptogs",accountindex,"http://cryptogs.io")
        printTxResult(result)

      });
    });
  },


  publish:()=>{
    describe('#publish() ', function() {
      it('should inject contract address and abi into web app', async function() {
        this.timeout(120000)
        const fs = require("fs")

        const deployNetwork = parseInt(fs.readFileSync("deploy.network").toString().trim());
        assert(deployNetwork>0,"NO DEPLOY NETWORK FILE DETECTED")

        console.log(tab,"Deploy Network:",(""+deployNetwork).green)

        loadAddress("Cryptogs",deployNetwork)
        loadAddress("SlammerTime",deployNetwork)

        loadAbi("Cryptogs",deployNetwork)
        loadAbi("SlammerTime",deployNetwork)

        loadBlockNumber("Cryptogs",deployNetwork)

      });
    });
  },
  redeploy:()=>{
    describe(bigHeader('DEPLOY'), function() {
      it('should deploy', async function() {
        this.timeout(6000000)
        const result = await clevis("test","deploy")
        assert(result==0,"deploy ERRORS")
      });
    });
    describe(bigHeader('TEST THIS IS RAD'), function() {
      it('should this is rad!', async function() {
        this.timeout(6000000)
        const result = await clevis("test","thisisrad")
        assert(result==0,"thisisrad ERRORS")
      });
    });
    describe(bigHeader('TEST MINTING'), function() {
      it('should mint, please work first try!', async function() {
        this.timeout(6000000)
        const result = await clevis("test","mint")
        assert(result==0,"mint ERRORS")
      });
    });
    describe(bigHeader('METAMASK'), function() {
      it('should metamask', async function() {
        this.timeout(6000000)
        const result = await clevis("test","metamask")
        assert(result==0,"metamask ERRORS")
      });
    });
    describe(bigHeader('MINTPACKS'), function() {
      it('should mint packs', async function() {
        this.timeout(6000000)
        const result = await clevis("test","mintPack")
        assert(result==0,"mintpack ERRORS")
      });
    });
    describe(bigHeader('PUBLISH'), function() {
      it('should publish conract address to app', async function() {
        this.timeout(6000000)
        const result = await clevis("test","publish")
        assert(result==0,"publish ERRORS")
      });
    });
    describe(bigHeader('TEST SUBMITTING STACKS'), function() {
      it('should submit stacks', async function() {
        this.timeout(6000000)
        const result = await clevis("test","submitStacks")
        assert(result==0,"submitStacks ERRORS")
      });
    });
    describe(bigHeader('TEST COIN FLIP'), function() {
      it('should flip the coin', async function() {
        this.timeout(6000000)
        const result = await clevis("test","flipCoin")
        assert(result==0,"flipCoin ERRORS")
      });
    });
    describe(bigHeader('TEST SLAMMER THROW'), function() {
      it('should SLAMMA JIM JAM', async function() {
        this.timeout(6000000)
        const result = await clevis("test","throwSlammer")
        assert(result==0,"throwSlammer ERRORS")
      });
    });

  },
  full:()=>{
    describe(bigHeader('COMPILE'), function() {
      it('should compile', async function() {
        this.timeout(6000000)
        const result = await clevis("test","compile")
        assert(result==0,"compile ERRORS")
      });
    });
    describe('#redeploy()', function() {
      it('should redeploy', async function() {
        this.timeout(240000)
        module.exports.redeploy()
      });
    });
  },
}
