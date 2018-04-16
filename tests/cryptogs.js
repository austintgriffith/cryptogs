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
function grabRandom(amount,arr){
  let newArr = []
  var tempArray = arr.slice();
  while(newArr.length<amount){
    let piece = tempArray.splice(Math.floor(Math.random()*tempArray.length), 1)
    newArr.push(piece[0]);
  }
  return newArr;
}
function getBatch(count,type){
  if(!type){
    type="default"
  }
  let batches = {}
  batches.animals = [
    "agantelope.jpg",
    "agbuffalo.jpg",
    "agbull.jpg",
    "agelephant.jpg",
    "agfish.jpg",
    "aghippo.jpg",
    "agkillerwhale.jpg",
    "aglobster.jpg",
    "agmountaingoat.jpg",
    "agoctopus.jpg",
    "agpenguin.jpg",
    "agrhino.jpg",
    "agwalrus.jpg",
    "agzebra.jpg"
  ]
  batches.aw90s = [
    "awripsaw.jpg",
    "awrainbowyinyang.jpg",
    "awpoison.jpg",
    "awpurepoison.jpg",
    "awyinandyang.jpg",
    "awskullsstars.jpg",
    "awstussy.jpg",
    "awblackwidow.jpg",
    "awsmile1.jpg",
    "awripsaw.jpg",
    "awrainbowyinyang.jpg",
    "awpoison.jpg",
    "awpurepoison.jpg",
    "awyinandyang.jpg",
    "awskullsstars.jpg",
    "awstussy.jpg",
    "awblackwidow.jpg",
    "awsmile1.jpg",
  ]
  batches.ad90s = [
    "ad8ball.png",
    "adbiohaz.png",
    "adsmile.png",
    "adyinyang.png",
    "adyinyanggroovy.png",
    "ad8ball.png",
    "adbiohaz.png",
    "adsmile.png",
    "adyinyang.png",
    "adyinyanggroovy.png",
    "ad8ball.png",
    "adbiohaz.png",
    "adsmile.png",
    "adyinyang.png",
    "adyinyanggroovy.png",
  ]
  batches.adgeo = [
    "adbluegeo.png",
    "adbluetree.png",
    "addarkmountain.png",
    "adgreengeo.png",
    "adgreentree.png",
    "adlightmountain.png",
    "adorangegeo.png",
    "adbluegeo.png",
    "adbluetree.png",
    "addarkmountain.png",
    "adgreengeo.png",
    "adgreentree.png",
    "adlightmountain.png",
    "adorangegeo.png",
  ]
  batches.cryptoLogos = [
    "metamask.png",
    "darkclogo.png",
    "lightclogo.png",
    "darkclogo.png",
    "lightclogo.png",
    "cipher.jpg",
    "trust.png",
    "toshi.jpg",
    "opensea.jpg",
    "darkclogo.png",
    "metamask.png",
    "darkclogo.png",
    "lightclogo.png",
    "darkclogo.png",
    "lightclogo.png",
    "cipher.jpg",
    "trust.png",
    "toshi.jpg",
    "opensea.jpg",
    "darkclogo.png",
  ]
  batches.ethDen = [
    "ethdenver.png",
    "ethden.png",
    "bufficorn.jpg",
    "ethden.png",
    "ethdenver.png",
    "ethdenver.png",
    "ethden.png",
    "bufficorn.jpg",
    "ethden.png",
    "ethdenver.png",
    "ethdenver.png",
    "ethden.png",
    "bufficorn.jpg",
    "ethden.png",
    "ethdenver.png",
  ]
  batches.awTwo = [
    "awtog.jpg",
    "awweb.jpg",
    "awbwskull.jpg",
    "awredblackskull.jpg",
    "awcryptogs.jpg",
    "awtog.jpg",
    "awweb.jpg",
    "awbwskull.jpg",
    "awredblackskull.jpg",
    "awcryptogs.jpg",
    "awtog.jpg",
    "awweb.jpg",
    "awbwskull.jpg",
    "awredblackskull.jpg",
    "awcryptogs.jpg",
  ]
  batches.awCrypto = [
    "awcrypto1.jpg",
    "awcrypto6.jpg",
    "awcrypto2.jpg",
    "awcrypto3.jpg",
    "awcrypto4.jpg",
    "awcrypto5.jpg",
    "awcrypto1.jpg",
    "awcrypto6.jpg",
    "awcrypto2.jpg",
    "awcrypto3.jpg",
    "awcrypto4.jpg",
    "awcrypto5.jpg",
    "awcrypto1.jpg",
    "awcrypto6.jpg",
    "awcrypto2.jpg",
    "awcrypto3.jpg",
    "awcrypto4.jpg",
    "awcrypto5.jpg",
  ]
  batches.awAnimals = [
    "awrhino.jpg",
    "awgiraffe.jpg",
    "awelephant.jpg",
    "awrhino.jpg",
    "awgiraffe.jpg",
    "awelephant.jpg",
    "awrhino.jpg",
    "awgiraffe.jpg",
    "awelephant.jpg",
    "awrhino.jpg",
    "awgiraffe.jpg",
    "awelephant.jpg",
  ]
  batches.default = [
    "ad8ball.png",
    "awsmile1.jpg",
    "adyinyang.png",
    "darkclogo.png",
    "lightclogo.png"
  ]

  let batch = grabRandom(count,batches[type]);
  if(!batch) batch=batches.default;
  return batch;
}
const contractsDir = "reactapp/src/contracts/"
const contractsDirBackend = "backend/contracts/"
function loadAbi(contract,deployNetwork){
  let abi = fs.readFileSync(contract+"/"+contract+".abi").toString().trim()
  console.log(tab,contract.cyan,"ABI:",(""+abi.length).yellow)
  assert(abi,"No ABI for "+contract+"!?")
  fs.writeFileSync(contractsDir+contract+"."+deployNetwork+".abi.js","module.exports = "+abi);
  fs.writeFileSync(contractsDirBackend+contract+"."+deployNetwork+".abi.js","module.exports = "+abi);
}
function loadAddress(contract,deployNetwork){
  let addr = fs.readFileSync(contract+"/"+contract+".address").toString().trim()
  console.log(tab,contract.cyan,"ADDRESS:",addr.blue)
  assert(addr,"No Address for "+contract+"!?")
  fs.writeFileSync(contractsDir+contract+"."+deployNetwork+".address.js","module.exports = \""+addr+"\"");
  fs.writeFileSync(contractsDirBackend+contract+"."+deployNetwork+".address.js","module.exports = \""+addr+"\"");
}
function loadBlockNumber(contract,deployNetwork){
  let blockNumber = fs.readFileSync(contract+"/"+contract+".blockNumber").toString().trim()
  console.log(tab,contract.cyan,"blockNumber:",blockNumber.blue)
  assert(blockNumber,"No blockNumber for "+contract+"!?")
  fs.writeFileSync(contractsDir+contract+"."+deployNetwork+".blockNumber.js","module.exports = \""+blockNumber+"\"");
  fs.writeFileSync(contractsDirBackend+contract+"."+deployNetwork+".blockNumber.js","module.exports = \""+blockNumber+"\"");
}
function migrationBlackList(){
  //list any account here that you don't want to spend the gas to get
  //tokens migrated from one deployment to the next
}

//global object for saving tokens that get transferred for game generation
let savedTokens = {}


function isOurAddress(address){

  if(address=="0x27400bB8b39EE1ac8392B0a2755af3f3a9e94FE7"){
    //old slammer time address
    return true;
  }else if(address=="0x34aA3F359A9D614239015126635CE7732c18fDF3"){
    //austins METAMASK
    return true;
  }else if(address=="0x55fFbCD5F80a7e22660A3B564447a0c1D5396A5C"){
    //hunter
    return true;
  }else if(address=="0x5B0Ad3bE5B7485D2D89175B2dA05eC4E3ac0f959"){
    //austins phone
    return true;
  }else if(address=="0x0FA23C532B040f8E93aF72D91fb03aD78Eb367eD"){
    //patrick
    return true;
  }
  return false;
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
  generateCommit:()=>{
    let web3 = new Web3()
    let secret = web3.utils.sha3(Math.random()+Date.now()+"CRYPTOGS4LIFE");
    console.log(tab,"Using secret:",secret.blue)
    let reveal = web3.utils.sha3(secret);
    console.log(tab,"reveal:",reveal.magenta)
    let commit = web3.utils.sha3(reveal);
    console.log(tab,"commit:",commit.cyan)
    return [secret,reveal,commit]
  },
  setSlammerTime:(accountindex)=>{
    describe('#setSlammerTime() ', function() {
      it('should set SlammerTime (once and only once)', async function() {
        this.timeout(120000)
        const SlammerTimeAddress = localContractAddress("SlammerTime")
        const result = await clevis("contract","setSlammerTime","Cryptogs",accountindex,SlammerTimeAddress)
        printTxResult(result)
        const getSlammerTime = await clevis("contract","slammerTime","Cryptogs")
        assert(getSlammerTime == SlammerTimeAddress,"SlammerTime address did not get set?!")
      });
    });
  },
  mint:(accountindex,image,toIndex)=>{
    describe('#testMint() ', function() {
      it('should mint a cryptog', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        assert(image,"No Image!?")
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
  mintBatch:(accountindex,image,toIndex)=>{
    describe('#testMint() ', function() {
      it('should mint a batch of cryptogs', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        assert(image,"No Image!?")
        let bytes32Image = web3.utils.fromAscii(image);
        const result = await clevis("contract","mintBatch","Cryptogs",accountindex,bytes32Image,bytes32Image,bytes32Image,bytes32Image,bytes32Image,accounts[toIndex])
        printTxResult(result)
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[toIndex])
        const lastToken = tokensOfOwner[tokensOfOwner.length-1]
        const token = await clevis("contract","getToken","Cryptogs",lastToken)
        assert(token.owner==accounts[toIndex],"This should never be wrong!?!")
        const cleanImage = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
        assert(cleanImage==image,"Image of minted token doesn't equal image we meant to mint.. hah.")
        console.log(tab,accounts[accountindex].blue+" minted 5 Cryptogs "+lastToken.magenta+" to account "+accounts[toIndex].cyan+" with image "+cleanImage.white)
      });
    });
  },
  mintBatchTo:(accountindex,image,toAddress)=>{
    describe('#testMint() ', function() {
      it('should mint a batch of cryptogs', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        assert(image,"No Image!?")
        let bytes32Image = web3.utils.fromAscii(image);
        const result = await clevis("contract","mintBatch","Cryptogs",accountindex,bytes32Image,bytes32Image,bytes32Image,bytes32Image,bytes32Image,toAddress)
        printTxResult(result)
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",toAddress)
        const lastToken = tokensOfOwner[tokensOfOwner.length-1]
        const token = await clevis("contract","getToken","Cryptogs",lastToken)
        assert(token.owner==toAddress,"This should never be wrong!?!")
        const cleanImage = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
        assert(cleanImage==image,"Image of minted token doesn't equal image we meant to mint.. hah.")
        console.log(tab,accounts[accountindex].blue+" minted 5 Cryptogs "+lastToken.magenta+" to account "+toAddress.cyan+" with image "+cleanImage.white)
      });
    });
  },
  dropBatch:(accountindex,type,toAddress)=>{
    describe('#dropBatch() ', function() {
      it('should drop a batch of cryptogs', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        let imageArray

        if(typeof type != "string" ){
          imageArray = type
        }else{
          imageArray = getBatch(5,type)
        }

        console.log(tab,"Dropping Batch".green,imageArray[0].blue,imageArray[1].blue,imageArray[2].blue,imageArray[3].blue,imageArray[4].blue,"on".green,toAddress.cyan)

        let bytes32Image1 = web3.utils.fromAscii(imageArray[0]);
        let bytes32Image2 = web3.utils.fromAscii(imageArray[1]);
        let bytes32Image3 = web3.utils.fromAscii(imageArray[2]);
        let bytes32Image4 = web3.utils.fromAscii(imageArray[3]);
        let bytes32Image5 = web3.utils.fromAscii(imageArray[4]);

        assert(bytes32Image1)
        assert(bytes32Image2)
        assert(bytes32Image3)
        assert(bytes32Image4)
        assert(bytes32Image5)

        const result = await clevis("contract","mintBatch","Cryptogs",accountindex,bytes32Image1,bytes32Image2,bytes32Image3,bytes32Image4,bytes32Image5,toAddress)
        printTxResult(result)


      });
    });
  },
  airdrop:(accountindex,image,toAddress)=>{
    describe('#testMint() ', function() {
      it('should mint a cryptog', async function() {
        this.timeout(120000)
        assert(image,"No Image!?")
        const result = await clevis("contract","mint","Cryptogs",accountindex,web3.utils.fromAscii(image),toAddress)
        printTxResult(result)
      });
    });
  },
  mintPack:(accountindex,type,price)=>{
    describe('#testMint() ', function() {
      it('should mint cryptog pack of type '+type, async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        let imageBytes = []

        images = getBatch(10,type)
        console.log(images)

        for(let i in images){
          assert(images[i],"No Image at index "+i+" of:",images)
          imageBytes[i] = web3.utils.fromAscii(images[i])
        }

        const result = await clevis("contract","mintPack","Cryptogs",accountindex,web3.utils.toWei(""+price, "ether"),imageBytes[0],imageBytes[1],imageBytes[2],imageBytes[3],imageBytes[4],imageBytes[5],imageBytes[6],imageBytes[7],imageBytes[8],imageBytes[9])
        printTxResult(result)
        console.log(tab,accounts[accountindex].blue+" minted pack ")
      });
    });
  },
  transferStack:(accountindex,commit)=>{
    describe('#transferStack() ', function() {
      it('should send stack to PizzaParlor', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[accountindex])
        console.log("tokensOfOwner",tokensOfOwner)
        const token5 = tokensOfOwner[tokensOfOwner.length-1]
        const token4 = tokensOfOwner[tokensOfOwner.length-2]
        const token3 = tokensOfOwner[tokensOfOwner.length-3]
        const token2 = tokensOfOwner[tokensOfOwner.length-4]
        const token1 = tokensOfOwner[tokensOfOwner.length-5]

        //cache tokens for next call
        if(!savedTokens[commit]) savedTokens[commit] = {}
        savedTokens[commit][accounts[accountindex]] = [token1,token2,token3,token4,token5]

        const PizzaParlorAddress = localContractAddress("PizzaParlor")
        //function transferStackAndCall(address _to, uint _token1, uint _token2, uint _token3, uint _token4, uint _token5, bytes32 _commit)
        const result = await clevis("contract","transferStackAndCall","Cryptogs",accountindex,PizzaParlorAddress,token1,token2,token3,token4,token5,commit)
        printTxResult(result)
        const newOwnerAddress = await clevis("contract","ownerOf","Cryptogs",token5)
        assert(newOwnerAddress == PizzaParlorAddress,"PizzaParlorAddress "+PizzaParlorAddress+" is not the owner of token "+token5)
      });
    });
  },
  revokeStack:(accountindex,commit)=>{
    describe('#revokeStack() ', function() {
      it('should revoke a stack from PizzaParlor', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")

        let token1 = savedTokens[commit][accounts[accountindex]][0]
        let token2 = savedTokens[commit][accounts[accountindex]][1]
        let token3 = savedTokens[commit][accounts[accountindex]][2]
        let token4 = savedTokens[commit][accounts[accountindex]][3]
        let token5 = savedTokens[commit][accounts[accountindex]][4]

        delete savedTokens[commit];

        const PizzaParlorAddress = localContractAddress("PizzaParlor")
        //function revokeStack(bytes32 _commit,uint _token1, uint _token2, uint _token3, uint _token4, uint _token5){
        const result = await clevis("contract","revokeStack","PizzaParlor",accountindex,commit,token1,token2,token3,token4,token5,commit)
        printTxResult(result)
        const newOwnerAddress = await clevis("contract","ownerOf","Cryptogs",token5)
        assert(newOwnerAddress == accounts[accountindex],"Account index "+accountindex+" is not the owner of token "+token5)
      });
    });
  },
  generateGame:(accountindex,reveal,commit,opponent)=>{
    describe('#generateGame() ', function() {
      it('should generateGame on PizzaParlor', async function() {
          this.timeout(120000)
          const accounts = await clevis("accounts")

          console.log("my saved tokens",savedTokens[commit][accounts[accountindex]])
          console.log("opponent saved tokens",savedTokens[commit][accounts[opponent]])

          let token1 = savedTokens[commit][accounts[accountindex]][0]
          let token2 = savedTokens[commit][accounts[accountindex]][1]
          let token3 = savedTokens[commit][accounts[accountindex]][2]
          let token4 = savedTokens[commit][accounts[accountindex]][3]
          let token5 = savedTokens[commit][accounts[accountindex]][4]

          let token6 = savedTokens[commit][accounts[opponent]][0]
          let token7 = savedTokens[commit][accounts[opponent]][1]
          let token8 = savedTokens[commit][accounts[opponent]][2]
          let token9 = savedTokens[commit][accounts[opponent]][3]
          let token10 = savedTokens[commit][accounts[opponent]][4]

          console.log("commit",commit,"reveal",reveal,"accounts[opponent]",accounts[opponent])
          console.log("tokens",token1,token2,token3,token4,token5,token6,token7,token8,token9,token10)

          //generateGame(bytes32 _commit,bytes32 _reveal,address _opponent,uint _token1, uint _token2, uint _token3, uint _token4, uint _token5,uint _token6, uint _token7, uint _token8, uint _token9, uint _token10)
          const result = await clevis("contract","generateGame","PizzaParlor",accountindex,commit,reveal,accounts[opponent],token1,token2,token3,token4,token5,token6,token7,token8,token9,token10)
          printTxResult(result)


          const tokensOfOwner1 = await clevis("contract","tokensOfOwner","Cryptogs",accounts[accountindex])
          console.log("Player 1 finished with ",tokensOfOwner1)
          const tokensOfOwner2 = await clevis("contract","tokensOfOwner","Cryptogs",accounts[opponent])
          console.log("Player 2 finished with ",tokensOfOwner2)

          delete savedTokens[commit];


      });
    });
  },
  submitStack:(accountindex)=>{
    describe('#submitStack() ', function() {
      it('should submit stack', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[accountindex])
        console.log("tokensOfOwner",tokensOfOwner)
        const token5 = tokensOfOwner[tokensOfOwner.length-1]
        const token4 = tokensOfOwner[tokensOfOwner.length-2]
        const token3 = tokensOfOwner[tokensOfOwner.length-3]
        const token2 = tokensOfOwner[tokensOfOwner.length-4]
        const token1 = tokensOfOwner[tokensOfOwner.length-5]
        const SlammerTimeAddress = localContractAddress("SlammerTime")
        const result = await clevis("contract","submitStack","Cryptogs",accountindex,token1,token2,token3,token4,token5)
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

        const result = await clevis("contract","submitCounterStack","Cryptogs",accountindex,lastStackId,token1,token2,token3,token4,token5)
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

        const result = await clevis("contract","acceptCounterStack","Cryptogs",accountindex,lastStackId,lastCounterStackId)
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
        await clevis("sendTo","0.1","0","0x34aA3F359A9D614239015126635CE7732c18fDF3")


      });
    });
  },
  tokenReport:()=>{
    describe('#tokenReport() ', function() {
      it('should give metamask account some ether', async function() {
        this.timeout(600000)
        const total = await clevis("contract","totalSupply","Cryptogs")
        console.log(tab,"Total Supply:",total)

        let reportOutput = ""
        for(let t=0;t<total;t++){
          const token = await clevis("contract","getToken","Cryptogs",t)
          console.log(tab,t,token.owner,token.image)
          reportOutput+=t+","+token.owner+","+token.image+"\n"
        }
        fs.writeFileSync("token.report",reportOutput);

      });
    });
  },
  tokenReportMint:(accountindex)=>{
    describe('#tokenReportMint() ', function() {
      it('should work through token report minting (migration)', async function() {
        this.timeout(600000000)
        let tokenReport = fs.readFileSync("token.report").toString().split("\n");
        while(tokenReport.length>0){
          console.log("============ "+tokenReport.length+" left to mint...")
          let tokensToMint = {}
          for(let t=0;t<tokenReport.length;t++){
            let parts = tokenReport[t].split(",")
            if(parts && parts[1] && parts[1]!="0x0000000000000000000000000000000000000000" && !isOurAddress(parts[1])){
              if(!tokensToMint[parts[1]]) tokensToMint[parts[1]]=[]
              tokensToMint[parts[1]].push(parts[2])
            }
          }
          //console.log("tokensToMint",tokensToMint)
          for(let user in tokensToMint)
          {
              const tokensOfOwner1 = await clevis("contract","tokensOfOwner","Cryptogs",user)
              console.log(tab,"USER",user.cyan,"has tokens:",tokensOfOwner1)
              if(tokensToMint[user].length>=5){
                console.log("minting tokens to ",user,"From",tokensToMint[user][0],"to",tokensToMint[user][4])
                const result = await clevis("contract","mintBatch","Cryptogs",accountindex,tokensToMint[user][0],tokensToMint[user][1],tokensToMint[user][2],tokensToMint[user][3],tokensToMint[user][4],user)
                let tokensOfOwner2 = await clevis("contract","tokensOfOwner","Cryptogs",user)
                if(tokensOfOwner2.length<=0){
                  console.log("didn't get list back, trying again")
                  tokensOfOwner2 = await clevis("contract","tokensOfOwner","Cryptogs",user)
                  if(tokensOfOwner2.length<=0){
                    console.log("didn't get list back, trying again")
                    tokensOfOwner2 = await clevis("contract","tokensOfOwner","Cryptogs",user)
                    if(tokensOfOwner2.length<=0){
                      console.log("didn't get list back, trying again")
                      tokensOfOwner2 = await clevis("contract","tokensOfOwner","Cryptogs",user)
                    }
                  }
                }
                console.log(tab,"USER",user.cyan,"now has tokens:".green,tokensOfOwner2)
                assert(tokensOfOwner1.length<=tokensOfOwner2.length-5,"MAYBE THE TOKEN DIDNT MINT?!?")
                tokensToMint[user][0]=false
                tokensToMint[user][1]=false
                tokensToMint[user][2]=false
                tokensToMint[user][3]=false
                tokensToMint[user][4]=false
              }else{
                console.log("minting simgle token to ",user,tokensToMint[user][0])
                try{
                  const result = await clevis("contract","mint","Cryptogs",accountindex,tokensToMint[user][0],user)
                }catch(e){console.log(tab,"Caught".yellow,e)}
                const tokensOfOwner2 = await clevis("contract","tokensOfOwner","Cryptogs",user)
                console.log(tab,"USER",user.cyan,"now has tokens:".green,tokensOfOwner2)
                assert(tokensOfOwner1.length<tokensOfOwner2.length,"MAYBE THE TOKEN DIDNT MINT?!?")
                tokensToMint[user][0]=false;
              }
              break
          }
          //WRITE tokensToMint BACK out
          let reportOutput = ""
          for(let user in tokensToMint)
          {
            for(let t in tokensToMint[user]){
              if(tokensToMint[user][t]) reportOutput += "0,"+user+","+tokensToMint[user][t]+"\n";
            }
          }
          console.log(tab,reportOutput)
          fs.writeFileSync("token.report",reportOutput);
          tokenReport = fs.readFileSync("token.report").toString().split("\n");
          console.log(tab,"DONE WITH PART")
        }

      });
    });
  },
  withdraw:(accountindex,amount,contract)=>{
    describe('#withdraw() ', function() {
      it('should withdraw ether', async function() {
        if(!contract) contract="Cryptogs"
        this.timeout(600000)
        const inWei = await clevis("wei",amount,'ether')
        const result = await clevis("contract","withdraw",contract,accountindex,inWei)
        printTxResult(result)
      });
    });
  },
  setArtistsPrice:(accountindex,priceToMint,priceToMintStack)=>{
    describe('#setArtistsPrice() ', function() {
      it('should setArtistsPrice', async function() {
        this.timeout(120000)
        //setPrice(uint _priceToMint,uint _priceToMintStack)
        const result = await clevis("contract","setPrice","Artists",accountindex,web3.utils.toWei(priceToMint,"ether"),web3.utils.toWei(priceToMintStack,"ether"))
        printTxResult(result)
      });
    });
  },
  artistReport:()=>{
    describe('#artistReport() ', function() {
      it('should create artist report', async function() {
        this.timeout(600000)

        let realList = []
        const mintEvents = await clevis("contract","eventMint","Artists")
        for(let e in mintEvents){
          let image = web3.utils.toAscii(mintEvents[e].returnValues.image).replace(/[^a-zA-Z\d\s.]+/g,"")
          realList.push({
            type:"mint",
            time:mintEvents[e].returnValues.time,
            image:image,
            value:mintEvents[e].returnValues.value,
            address:mintEvents[e].returnValues.sender
          })
        }
        const mintStackEvents = await clevis("contract","eventMintStack","Artists")
        for(let e in mintStackEvents){
          let image = web3.utils.toAscii(mintStackEvents[e].returnValues.image).replace(/[^a-zA-Z\d\s.]+/g,"")
          realList.push({
            type:"mintStack",
            time:mintStackEvents[e].returnValues.time,
            image:image,
            value:mintStackEvents[e].returnValues.value,
            address:mintStackEvents[e].returnValues.sender
          })
        }

        console.log(realList)
        fs.writeFileSync("artist.report",JSON.stringify(realList));

      });
    });
  },
  artistMint:(accountindex)=>{
    describe('#artistMint() ', function() {
      it('should artistMint', async function() {
        this.timeout(600000)

        let report = JSON.parse(fs.readFileSync("artist.report").toString().trim())
        let minted = []
        try{
          minted = JSON.parse(fs.readFileSync("artist.minted").toString().trim())
        }catch(e){}

        let needToMint = false
        for(let r in report){
          let found = false
          for(let m in minted){
            if( minted[m].time == report[r].time && minted[m].address == report[r].address && minted[m].image == report[r].image ){
              found=true
            }
          }
          if(!found){
            needToMint = report[r]
            break
          }
        }

        if(needToMint){
          console.log(tab,tab,"Approval to mint (y or n)".green,needToMint,
            ("\nhttps://stage.cryptogs.io:8001/"+needToMint.address+"/"+needToMint.image).blue,
            ("\nhttps://stage.cryptogs.io:8001/artist/"+needToMint.address).yellow,
          )
          var stdin = process.openStdin();
          stdin.addListener("data", function(d) {
           let answer = d.toString().trim()
           if(answer=="n" || answer.toLowerCase()=="no"){
             console.log("NO")
             needToMint.minted = "no"
             minted.push(needToMint)
             fs.writeFileSync("artist.minted",JSON.stringify(minted))
             process.stdin.pause()
           }else if(answer.length==2){
             let newImageName = answer+needToMint.image
             console.log("MINT FOR ARTIST "+newImageName)

             //DO MINT!
             //first we need to move the image so it is ready to deploy
             fs.createReadStream('./backend/artwork/'+needToMint.address+"/"+needToMint.image).pipe(fs.createWriteStream('./reactapp/public/cryptogs/'+newImageName));


            //next we need to make the actual mint calls to get the thing created
            //const result = await clevis("contract","mint","Cryptogs",accountindex,web3.utils.fromAscii(newImageName),needToMint.address)

            /* needToMint.minted = "yes"
             minted.push(needToMint)
             fs.writeFileSync("artist.minted",JSON.stringify(minted))*/
             process.stdin.pause()
           }else{
             console.log("please enter artists initials or 'no'")
           }
          });
        }


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
       loadAddress("PizzaParlor",deployNetwork)
        loadAddress("Artists",deployNetwork)

        loadAbi("Cryptogs",deployNetwork)
        loadAbi("SlammerTime",deployNetwork)
        loadAbi("PizzaParlor",deployNetwork)
        loadAbi("Artists",deployNetwork)

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
    describe(bigHeader('TEST MINTING'), function() {
      it('should mint, please work first try!', async function() {
        this.timeout(6000000)
        const result = await clevis("test","mint")
        assert(result==0,"mint ERRORS")
      });
    });
    describe(bigHeader('CENTRALIZED GAME'), function() {
      it('should mint packs', async function() {
        this.timeout(6000000)
        const result = await clevis("test","transferStacksAndGenerateGame")
        assert(result==0,"transferStacksAndGenerateGame ERRORS")
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
