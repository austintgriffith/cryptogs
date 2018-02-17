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
function loadAbi(contract){
  let abi = fs.readFileSync(contract+"/"+contract+".abi").toString().trim()
  fs.writeFileSync("app/src/"+contract+".abi.js","module.exports = "+abi);
}
const tab = "\t\t";


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
        const cleanImage = web3.utils.toAscii(token.image).replace(/[\W_]+/g,"")
        assert(cleanImage==image,"Image of minted token doesn't equal image we meant to mint.. hah.")
        console.log(tab,accounts[accountindex].blue+" minted Cryptog "+lastToken.magenta+" to account "+accounts[toIndex].cyan+" with image "+cleanImage.white)
      });
    });
  },
  submitStack:(accountindex)=>{
    describe('#submitStack() ', function() {
      it('should submit stack', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[accountindex])
        const lastToken = tokensOfOwner[tokensOfOwner.length-1]
        const SlammerTimeAddress = localContractAddress("SlammerTime")
        const result = await clevis("contract","submitStack","Cryptogs",accountindex,SlammerTimeAddress,lastToken)
        printTxResult(result)
        const approveContract = await clevis("contract","tokenIndexToApproved","Cryptogs",lastToken)
        assert(approveContract == SlammerTimeAddress,"SlammerTime is NOT approved to move the token "+lastToken)
      });
    });
  },
  submitCounterStack:(accountindex)=>{
    describe('#submitCounterStack() ', function() {
      it('should submit counter stack', async function() {
        this.timeout(120000)
        const accounts = await clevis("accounts")
        const tokensOfOwner = await clevis("contract","tokensOfOwner","Cryptogs",accounts[accountindex])
        const lastToken = tokensOfOwner[tokensOfOwner.length-1]
        const SlammerTimeAddress = localContractAddress("SlammerTime")

        //we need to get the stack id for the last submit event
        ///÷clevis contract eventSubmitStack Cryptogs
        const SubmitStackEvents  = await clevis("contract","eventSubmitStack","Cryptogs")
        //console.log("SubmitStackEvents",SubmitStackEvents)
        const lastSubmitStackEvent = SubmitStackEvents[SubmitStackEvents.length-1]
        //console.log("lastSubmitStackEvent",lastSubmitStackEvent)
        const lastStackId = lastSubmitStackEvent.returnValues._stackid
        console.log(tab,"Last stack id:",lastStackId.cyan)

        let web3 = new Web3()
        COMMIT = web3.utils.sha3(Math.random()+Date.now()+"CRYPTOGS4LIFE");
        console.log(tab,"Using Commit:",COMMIT.blue)
        let commitHash = web3.utils.sha3(COMMIT);
        console.log(tab,"Commit hash:",commitHash.magenta)

        const result = await clevis("contract","submitCounterStack","Cryptogs",accountindex,SlammerTimeAddress,lastStackId,lastToken,commitHash)
        printTxResult(result)
        const approveContract = await clevis("contract","tokenIndexToApproved","Cryptogs",lastToken)
        assert(approveContract == SlammerTimeAddress,"SlammerTime is NOT approved to move the token "+lastToken)
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
    describe(bigHeader('TEST SUBMITTING STACKS'), function() {
      it('should submit stacks', async function() {
        this.timeout(6000000)
        const result = await clevis("test","submitStacks")
        assert(result==0,"submitStacks ERRORS")
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
