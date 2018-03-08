import React, { Component } from 'react';
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';
import Stack from '../components/Stack.js'
import Cryptog from '../components/Cryptog.js'
import Slammer from '../components/Slammer.js'
import Spinner from '../components/Spinner.js'
import StackSelect from '../components/StackSelect.js'
import {Motion, spring, presets} from 'react-motion';
import MMButton from '../components/MMButton.js'
import PogAnimation from '../components/PogAnimation'
import StackGrid from 'react-stack-grid'
import Blockies from 'react-blockies'
import cookie from 'react-cookies'

let loadInterval
let waitInterval
let slammerTimeout
const DEBUG = false
const SHOWDEMOSCREEN=false
let txhash

class PlayStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stackMode:0,
      stack:props.match.params.stack,
      counterStacks:[],
      stackedUpCryptogs:[],
      coinFlipResult:false,
      slammerSpinning:false,
      slammerAngle:15,
      slammerTop:-200,
      slammerLeft:-200
    }

    this.waitForStuff()
    waitInterval = setInterval(this.waitForStuff.bind(this),171)
    this.loadStackData()
    loadInterval = setInterval(this.loadStackData.bind(this),707)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  waitForStuff(){
    if(DEBUG) console.log("waiting of stuf....")
    let {account,contracts,web3,showLoadingScreen,blockNumber} = this.props.context
    if(account&&contracts&&blockNumber&&contracts['Cryptogs']){
      this.startEventParsers()
      clearInterval(waitInterval)
    }
  }
  async startEventParsers(){
    if(DEBUG) console.log("STARTING PARSERS")
    let {account,contracts,web3,showLoadingScreen,blockNumber} = this.props.context
    let thisStack = await contracts['Cryptogs'].methods.getStack(this.state.stack).call()
    let updateThrowSlammer = async (update)=>{
      let id = web3.utils.sha3(update.stack+update.blockNumber+update.whoDoneIt);
      if(!this.state.throwSlammerEvents) this.state.throwSlammerEvents={};
      if(!this.state.throwSlammerEvents[id]) {
        this.state.throwSlammerEvents[id]=update;
        //console.log("UPDATE this.state.throwSlammerEvents",this.state.throwSlammerEvents)
        for(let t=1;t<=10;t++){
          let thisTokenId = update["token"+t+"Flipped"]
          //console.log("thisTokenId",thisTokenId)
          if(thisTokenId>0){
            let token = await contracts['Cryptogs'].methods.getToken(thisTokenId).call()//this.state.allStacks[id]
            //console.log("THIS TOKEN",token)
            this.state.throwSlammerEvents[id]["token"+t+"Flipped"] = {
              id:thisTokenId,
              image:web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
            }
          }
        }
        //console.log("UPDATEETETE",  this.state.throwSlammerEvents)
        this.setState({throwSlammerEvents:this.state.throwSlammerEvents});
      }
    }
    let filter = {stack: this.state.stack}
    EventParser(contracts["Cryptogs"],"ThrowSlammer",thisStack.block,blockNumber,updateThrowSlammer,filter);
    setInterval(()=>{
      LiveParser(contracts["Cryptogs"],"ThrowSlammer",blockNumber,updateThrowSlammer,filter)
    },737)
  }
  async loadStackData(){
    let stack
    let {account,contracts,web3,showLoadingScreen} = this.props.context
    //console.log("contracts",contracts)
    let update = {}

    update.stackData = await contracts['Cryptogs'].methods.getStack(this.state.stack).call()
    update.player1 = update.stackData.owner

    for(let t=1;t<=5;t++){
      let token = await contracts['Cryptogs'].methods.getToken(update.stackData["token"+t]).call()//this.state.allStacks[id]
      update.stackData["token"+t+"Image"] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
    }
    update.stackMode = await contracts['Cryptogs'].methods.mode(this.state.stack).call()

    if(update.stackMode==9&&this.state.stackMode!=9){
      update.stackMode=8;
      setTimeout(()=>{
        this.setState({stackMode:9})
      },4000)
    }

    if(update.stackMode>0 && !this.state.coinFlipResult){
      let coinFlipSuccessEvents = await contracts['Cryptogs'].getPastEvents("CoinFlipSuccess", {
        filter: {stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      if(DEBUG) console.log("COIN FLIP RESULT",coinFlipSuccessEvents)
      if(coinFlipSuccessEvents&&coinFlipSuccessEvents[0]&&coinFlipSuccessEvents[0].returnValues){
        this.state.coinFlipResult = coinFlipSuccessEvents[0].returnValues
        if(DEBUG) console.log("this.state.coinFlipResult",this.state.coinFlipResult)
      }
    }




    if(update.stackMode==0){
      let counterStackEvents = await contracts['Cryptogs'].getPastEvents("CounterStack", {
        filter: {_stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      let counterStacks = []
      for(let e in counterStackEvents){
        let thisStackData = await contracts['Cryptogs'].methods.getStack(counterStackEvents[e].returnValues._counterStack).call()
        for(let t=1;t<=5;t++){
          let token = await contracts['Cryptogs'].methods.getToken(thisStackData["token"+t]).call()//this.state.allStacks[id]
          thisStackData["token"+t+"Image"] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
        }
        thisStackData._counterStack = counterStackEvents[e].returnValues._counterStack
        counterStacks.push(thisStackData)
      }

      // event CancelCounterStack(address indexed _sender,uint256 indexed timestamp,bytes32 indexed _stack,bytes32 _counterstack);
      let cancelCounterStackEvents = await contracts['Cryptogs'].getPastEvents("CancelCounterStack", {
        filter: {_stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });

      for(let e in cancelCounterStackEvents){
        if(!update.stackData.canceledCounterStacks) update.stackData.canceledCounterStacks = []
        update.stackData.canceledCounterStacks.push(cancelCounterStackEvents[e].returnValues._counterstack)
      }

      update.counterStacks = counterStacks
    }else{

      update.lastBlock = await contracts['Cryptogs'].methods.lastBlock(this.state.stack).call()
      update.lastActor = await contracts['Cryptogs'].methods.lastActor(this.state.stack).call()
      update.TIMEOUTBLOCKS = await contracts['Cryptogs'].methods.TIMEOUTBLOCKS().call()
      let acceptCounterStackEvents = await contracts['Cryptogs'].getPastEvents("AcceptCounterStack", {
        filter: {_stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      for(let e in acceptCounterStackEvents){
        update.counterStack = acceptCounterStackEvents[e].returnValues._counterStack
        update.counterStackData = await contracts['Cryptogs'].methods.getStack(update.counterStack).call()
        update.player2 = update.counterStackData.owner
      }
    }

    update.spectator = (account && this.state.player1 && account.toLowerCase()!= this.state.player1.toLowerCase() && this.state.player2 && account.toLowerCase()!= this.state.player2.toLowerCase())

    if(update.stackMode==2&&!this.state.coinFlipping){
      update.coinFlipping=true
    }else if(update.stackMode==1&&this.state.coinFlipping){
      update.coinFlipping=false
    }

      let possibleFlightPaths = [-150,-200,-250,-300,-350,350,300,250,200,150];
    if(update.stackMode!=this.state.stackMode){
      let mixedStackIds = await contracts['Cryptogs'].methods.getMixedStack(this.state.stack).call()

      if(DEBUG) console.log("mixedStackIds:",JSON.stringify(mixedStackIds),"lastMixedStackIds",JSON.stringify(this.state.mixedStackIds))

      update.mixedStackIds = mixedStackIds;

      update.mixedStack = []
      update.flippedThisRound = []

      for(let i=0;i<10;i++){
        if(DEBUG) console.log("mixedStackDebug",i,mixedStackIds[i])
        if(mixedStackIds[i]>0){
          let token = await contracts['Cryptogs'].methods.getToken(mixedStackIds[i]).call()//this.state.allStacks[id]
          let image = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
          update.mixedStack.push({id:mixedStackIds[i],image:image})
        }else if(update.stackMode==3||update.stackMode==8){

          if(this.state.mixedStackIds){

            if(DEBUG) console.log("its a flip if ",this.state.mixedStackIds[i],"!=",update.mixedStackIds[i])
            if(this.state.mixedStackIds[i]!=update.mixedStackIds[i]){

              if(DEBUG) console.log("item",i,"is out")

              let tokenId = this.state.mixedStackIds[i]
              let token = await contracts['Cryptogs'].methods.getToken(tokenId).call()//this.state.allStacks[id]
              let image = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")


              let flippedTokenThisRound = {id:tokenId,image:image,thisFlightPath:possibleFlightPaths[i]}
              if(DEBUG) console.log("FLIPPED TOKEN THIS ROUND",flippedTokenThisRound)
              //let arrayofonerandompath = possibleFlightPaths.splice(Math.floor(Math.random()*possibleFlightPaths.length),1);
              //this.state.mixedStack[i].thisFlightPath = arrayofonerandompath[0]
              /*let alreadyFound = false
              for(let f in update.flippedThisRound){
                console.log("making sure ",update.flippedThisRound[f].id,"isnt alreaady == ",this.state.mixedStack[i].id)
                if(update.flippedThisRound[f].id == this.state.mixedStack[i].id){
                  alreadyFound=true
                }
              }
              if(alreadyFound){
                console.log("Skipping, already in...")
              }else{*/
                update.flippedThisRound.push(flippedTokenThisRound)
                update.flippingPogs=true;
                update.flippingPogsSlideOut=false;
                update.flippingPogsAngle=false;
              //}

            }

          }


        }
      }
      if(DEBUG) console.log("TRANSITION TO",update.mixedStack,JSON.stringify(update.flippedThisRound),JSON.stringify(this.state.flippedThisRound))

    }


    //if(update.stackMode>2){
      //  event ThrowSlammer(bytes32 indexed stack, bool success, address whoDoneIt, uint32 blockNumber, bool token1Flipped, bool token2Flipped, bool token3Flipped, bool token4Flipped, bool token5Flipped, bool token6Flipped, bool token7Flipped, bool token8Flipped, bool token9Flipped, bool token10Flipped);

      /*console.log("loading ALL slammer events (messy)")
      let start = Date.now()
      let throwSlammerEvents = await contracts['Cryptogs'].getPastEvents("ThrowSlammer", {
        filter: {stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      //console.log("throwSlammerEvents",throwSlammerEvents)
      update.throwSlammerEvents = []
      for(let e in throwSlammerEvents){
        throwSlammerEvents[e].returnValues.blockNumber = throwSlammerEvents[e].blockNumber
        update.throwSlammerEvents.push(throwSlammerEvents[e].returnValues)
      }
      let duration = Date.now()-start
      console.log("done loading ALL slammer events (YOU NEED TO PORT TO EVENT LOADER!)",duration)
      */
    //}

    if(update.stackMode==3){
      update.slammerTop = -160
      update.slammerLeft = 0
      update.slammerAngle = 65
      update.slammerSpinning = false
    }else if(update.stackMode==4){
      update.slammerTop = -350
      update.slammerLeft = 0
      update.slammerAngle = 100
      update.slammerSpinning = false
    }else if(update.stackMode<1){
      update.slammerTop = -2000
      update.slammerLeft = 0
      update.slammerAngle = 25
      update.slammerSpinning = false
    }else if(update.stackMode<3){
      update.slammerTop = -270
      update.slammerLeft = 0
      update.slammerAngle = 15
      if(update.stackMode==2){
        update.slammerSpinning = true
      }else {
        update.slammerSpinning = false
      }
    }else{
      update.slammerTop = 0
      update.slammerLeft = -1000
      update.slammerAngle = 90
      update.slammerSpinning = false
    }



    this.setState(update,()=>{
      if(update.flippingPogs){
        this.setState({slammerTop:-80,slammerAngle:45})
        setTimeout(()=>{
          this.setState({flippingPogs:false,flippingPogsAngle:65})
          setTimeout(()=>{
            this.setState({flippingPogsSlideOut:true})
          },5000)
          this.setState({slammerTop:-120,slammerAngle:60})
        },1000)

      }
    })
  }
  acceptStack(counterStack){
    console.log("ACCEPT",this.state.stack,counterStack)
    let {contracts,account,showLoadingScreen} = this.props.context
    //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
    contracts["Cryptogs"].methods.acceptCounterStack(this.state.stack,counterStack).send({
      from: account,
      gas:1000000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
      txhash=hash
    }).on('error',(a,b)=>{
      if(txhash){
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }
    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })
    this.setState({counterStack:counterStack})
  }
  cancelStack(stack){
    console.log("CANCEL STACK")
    let {contracts,account,showLoadingScreen} = this.props.context
    //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
    contracts["Cryptogs"].methods.cancelStack(stack).send({
      from: account,
      gas:250000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash,"/stacks")
      txhash=hash
    }).on('error',(a,b)=>{

      if(txhash){
        //howLoadingScreen(false)
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }

    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      window.location = "/stacks"
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })

  }
  cancelCounterStack(stack,counterstack){
    console.log("CANCEL STACK")
    let {contracts,account,showLoadingScreen} = this.props.context
    //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
    contracts["Cryptogs"].methods.cancelCounterStack(stack,counterstack).send({
      from: account,
      gas:350000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash,"/stacks")
      txhash=hash
    }).on('error',(a,b)=>{
      console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      window.location = "/stacks"
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })

  }
  startCoinFlip(){



    console.log("START COIN FLIP",this.state.stack,this.state.counterStack)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let commit = web3.utils.sha3(Math.random()+this.state.account+"COINFLIP!")
    console.log("commit:",commit)
    let commitHash = web3.utils.sha3(commit)
    console.log("commitHash:",commitHash)

    cookie.save('commit', commit, { path: '/', maxAge:600 })
    this.setState({commit:commit})

    //startCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
    contracts["Cryptogs"].methods.startCoinFlip(this.state.stack,this.state.counterStack,commitHash).send({
        from: account,
        gas:150000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
  }

  endCoinFlip(){
    console.log("END COIN FLIP",this.state.stack,this.state.counterStack,this.state.commit)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let reveal = this.state.commit
    //if reveal isn't saved in the state, send 0's to start over with the coin flip
    if(!reveal) reveal = cookie.load('commit')
    if(!reveal) reveal = "0x0000000000000000000000000000000000000000000000000000000000000000"

    //endCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _reveal)
    contracts["Cryptogs"].methods.endCoinFlip(this.state.stack,this.state.counterStack,reveal).send({
        from: account,
        gas:150000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
  }
  raiseSlammer(){
    console.log("raiseSlammer",this.state.stack,this.state.counterStack)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let commit = web3.utils.sha3(Math.random()+this.state.account+"SLAMMERTIMEJABRONIES!")
    console.log("commit:",commit)
    let commitHash = web3.utils.sha3(commit)
    console.log("commitHash:",commitHash)
    cookie.save('commit', commit, { path: '/', maxAge:600 })
    this.setState({commit:commit})

    //raiseSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
    contracts["Cryptogs"].methods.raiseSlammer(this.state.stack,this.state.counterStack,commitHash).send({
        from: account,
        gas:150000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
  }
  throwSlammer(){
    console.log("throwSlammer",this.state.stack,this.state.counterStack,this.state.commit)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let reveal = this.state.commit
    //if reveal isn't saved in the state, send 0's to start over with the coin flip
    if(!reveal) reveal = cookie.load('commit')
    if(!reveal) reveal = "0x0000000000000000000000000000000000000000000000000000000000000000"

/*
.on('error', function(error){ ... })
.on('transactionHash', function(transactionHash){ ... })
.on('receipt', function(receipt){
   console.log(receipt.contractAddress) // contains the new contract address
})
.on('confirmation', function(confirmationNumber, receipt){ ... })
.then(function(newContractInstance){
    console.log(newContractInstance.options.address) // instance with the new contract address
});

 */

    //raiseSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
    contracts["Cryptogs"].methods.throwSlammer(this.state.stack,this.state.counterStack,reveal).send({
        from: account,
        gas:500000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
        /*
          if(txhash){
            showLoadingScreen(false)
            console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
    				this.props.throwAlert(
    					<div>
    						<span>Warning: Your transation is not yet mined into the blockchain. Increase your gas price and try again or </span>
    						<a href={this.context.etherscan+"tx/"+txhash} target='_blank'>{"wait for it to finish"}</a>.
    						<div style={{position:"absolute",left:20,bottom:20}}>
    							<MMButton color={"#f7861c"} onClick={()=>{
    								this.props.throwAlert(false);
    							}}>close and try again</MMButton>
    						</div>
    					</div>
    				)
          }*/
      }).on('transactionHash', function(transactionHash){
         console.log("XEVENT transactionHash",transactionHash)
      })
      .on('receipt', function(receipt){
         console.log("TXEVENT receipt",receipt) // contains the new contract address
      }).on('confirmation', function(confirmationNumber, receipt){
        console.log("TXEVENT confirmation",confirmationNumber)
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
  }
  drainStack(){
    let {contracts,account,showLoadingScreen} = this.props.context
    console.log("drainStack",this.state.stack,this.state.counterStack)
    contracts["Cryptogs"].methods.drainStack(this.state.stack,this.state.counterStack).send({
      from: account,
      gas:1000000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
      txhash=hash
    }).on('error',(a,b)=>{
      console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })
  }
  slammerClick(){
    let {account} = this.props.context
    let {lastActor,spectator} = this.state;
    if(spectator) return 0;
    if(account.toLowerCase()!=lastActor.toLowerCase()){
      console.log("SLAMMER CLICK")
      if(this.state.stackMode==3){
        this.raiseSlammer()
      }else if(this.state.stackMode==4){
        this.throwSlammer()
      }else if(this.state.stackMode==1){
        this.startCoinFlip()
      }else if(this.state.stackMode==2){
        this.endCoinFlip()
      }
    }else{
      if(!slammerTimeout){
        let ogSlammerTop = this.state.slammerTop
        this.setState({slammerTop:this.state.slammerTop+25})
        slammerTimeout = setTimeout(()=>{
          this.setState({slammerTop:ogSlammerTop})
          clearTimeout(slammerTimeout)
          slammerTimeout=false;
        })
      }

    }
  }
  render(){
    let {account,blockNumber,contracts,etherscan} = this.props.context
    let {coinFlipResult,stackMode,stackData,counterStacks,lastBlock,lastActor,TIMEOUTBLOCKS,flipEvents,throwSlammerEvents,player1,player2,spectator} = this.state;
    if(!stackData){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
      )
    }

    if(SHOWDEMOSCREEN){
      let stackx = 0
      let stackspread = 9
      return (
        <div style={{position:'relative',width:1000,height:900,background:'url("/static/media/halftone.d3864fe4.png")'}}>
          <div style={{position:'absolute',left:400,top:400}}>
          <div style={{position:'absolute',left:-300,top:-200,zIndex:1}}>
           <Cryptog angle={-45} scale={0.9} id={1} image={"awpurepoison.jpg"}/>
          </div>
          <div style={{position:'absolute',left:320,top:-120,zIndex:1}}>
           <Cryptog angle={-65} scale={0.9} id={1} image={"awrainbowyinyang.jpg"}/>
          </div>
          <div style={{position:'absolute',left:0,top:stackx+stackspread*3,zIndex:1}}>
           <Cryptog angle={65} scale={0.9} id={1} image={"elephant.png"}/>
          </div>
            <div style={{position:'absolute',left:0,top:stackx+stackspread*2,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"hippo.png"}/>
            </div>
            <div style={{position:'absolute',left:0,top:stackx+stackspread*1,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"awrainbowyinyang.jpg"}/>
            </div>
            <div style={{position:'absolute',left:0,top:stackx,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"awripsaw.jpg"}/>
            </div>
            <div style={{position:'absolute',left:189,top:130,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"ethdenver.png"}/>
            </div>
            <div style={{position:'absolute',left:129,top:-250,zIndex:1}}>
             <Cryptog angle={120} scale={0.9} id={1} image={"ethdenver.png"}/>
            </div>
            <div style={{position:'absolute',left:-180,top:110,zIndex:1}}>
             <Cryptog angle={-119} scale={0.9} id={1} image={"ethdenver.png"}/>
            </div>
            <div style={{position:'absolute',left:-240,top:-20,zIndex:1}}>
             <Cryptog angle={95} scale={0.9} id={1} image={"awstussy.jpg"}/>
            </div>
            <div style={{position:'absolute',left:-340,top:20,zIndex:1}}>
             <Cryptog angle={80} scale={0.9} id={1} image={"hippo.png"}/>
            </div>
            <div style={{position:'absolute',left:-320,top:-90,zIndex:1,
                        fontWeight:'bold',fontSize:140,letterSpacing:-2}}>
              <img src="/logo.png" />
            </div>
            <div style={{position:'absolute',left:360,top:20,zIndex:1}}>
             <Cryptog angle={100} scale={0.9} id={1} image={"awblackwidow.jpg"}/>
            </div>
            <div style={{position:'absolute',left:-90,top:-300,zIndex:1}}>
             <Cryptog angle={130} scale={0.9} id={1} image={"awblackwidow.jpg"}/>
            </div>
            <div style={{position:'absolute',left:40,top:180,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"awblackwidow.jpg"}/>
            </div>

            <div style={{position:'absolute',left:0,top:-150,zIndex:10}}>
            <Slammer spinning={false} angle={35} image={"ethslammer.png"}/>
            </div>
            <div style={{position:'absolute',left:-150,top:122,zIndex:0,width:900,height:100,
                fontWeight:'bold',fontSize:28,letterSpacing:-0.5}}>
              Collect and play pogs on the Blockchain
            </div>
          </div>
        </div>
      )
    }


    let coinFlipResultDisplay = ""

    if(coinFlipResult&&player1!="0x0000000000000000000000000000000000000000"){

        if(coinFlipResult.whosTurn.toLowerCase()==player1.toLowerCase()){
          coinFlipResultDisplay=(
            <div key={"logdivcoinflip"} style={{position:"relative",width:"100%",height:70,zIndex:99}}>
              <div style={{position:'absolute',left:0,top:0,zIndex:1}}>
                  <a target="_blank" href={"/address/"+player1}>
                   <Blockies
                     seed={player1.toLowerCase()}
                     scale={6}
                   />
                  </a>
              </div>
              <div style={{position:'absolute',left:20,top:-55,zIndex:1,transform: "scale(0.4)"}}>
               <Slammer spinning={false} angle={25} image={"ethslammer.png"}/>
              </div>
            </div>
          )
        }else{
          coinFlipResultDisplay=(
             <div key={"logdivcoinflip"} style={{position:"relative",width:"100%",height:70,zIndex:99}}>
               <div style={{position:'absolute',left:0,top:0,zIndex:1}}>
                  <a target="_blank" href={"/address/"+player2}>
                  <Blockies
                    seed={player2.toLowerCase()}
                    scale={6}
                  />
                  </a>
               </div>
               <div style={{position:'absolute',left:20,top:-55,zIndex:1,transform: "scale(0.4)"}}>
                <Slammer spinning={false} angle={25} image={"ethslammer.png"}/>
               </div>
             </div>
          )
        }

    }





    let flipDisplay = ""
    let throwSlammerEventArray = []
    for(let id in throwSlammerEvents){
      throwSlammerEventArray.push(throwSlammerEvents[id])
    }

    if(throwSlammerEventArray && throwSlammerEventArray.length>0){
      flipDisplay = throwSlammerEventArray.map((throwSlammerEvent)=>{
        if(throwSlammerEvent.otherPlayer!="0x0000000000000000000000000000000000000000"){
          let flipped = []
          let count = 0
          for(let i=1;i<=10;i++){

              if(parseInt(throwSlammerEvent['token'+i+'Flipped'])!=0&&throwSlammerEvent['token'+i+'Flipped']){
                //console.log("throwSlammerEvent['token'+i+'Flipped']",throwSlammerEvent['token'+i+'Flipped'])
                flipped.push(
                  <div key={"flipped"+i} style={{position:'absolute',left:40+((count++)*20),top:-40,zIndex:1}}>
                    <Cryptog angle={25} scale={0.4} id={throwSlammerEvent['token'+i+'Flipped'].id} image={throwSlammerEvent['token'+i+'Flipped'].image}/>
                  </div>
                )
              }

          }


          let who = ""

          //console.log("throwSlammerEvent",throwSlammerEvent);

         return (
           <div key={"logdiv"+throwSlammerEvent.blockNumber} style={{position:"relative",width:"100%",height:70,zIndex:99}}>
              <div style={{position:"absolute",left:0,top:16}}>
              <a target="_blank" href={"/address/"+throwSlammerEvent.whoDoneIt}>
                <Blockies
                  seed={throwSlammerEvent.whoDoneIt.toLowerCase()}
                  scale={6}
                />
                </a>
              </div>
              {flipped}
           </div>
         )
       }
     })
   }

   let mixedStack = []
   if(stackMode>0&&stackMode<9){
     for(let m in this.state.mixedStack){
       mixedStack.push(
         <div key={"mixedStack"+m} style={{position:'absolute',left:0,top:(-10*m),zIndex:1}}>
          <Cryptog angle={65} scale={0.9} id={this.state.mixedStack[m].id} image={this.state.mixedStack[m].image}/>
         </div>
       )
     }
   }



   let flightStack = []
   if(stackMode==3||stackMode==8){
     for(let m in this.state.flippedThisRound){
       let thisFlightPath = this.state.flippedThisRound[m].thisFlightPath
       let possibleFlightPathsText = ""
       if(thisFlightPath<0) {
         possibleFlightPathsText = (thisFlightPath)*-1
       }else{
         possibleFlightPathsText = "N"+(thisFlightPath)
       }
       let animationName = "flightPath"+possibleFlightPathsText
       let top = (Math.abs(thisFlightPath)/2)//(m*15)+
       let left = thisFlightPath
       //console.log("-----flightStack",m,animationName,top,left)

       let className = "spinner"
       //console.log("this.state.flippingPogsSlideOut",this.state.flippingPogsSlideOut)
       if(this.state.flippingPogsSlideOut){
         className = "slideNorth"
       }

       flightStack.push(
         <div key={"flightStack"+m} className={className} style={{zIndex:50,animationName:animationName,position:"absolute",left:left,top:top,zIndex:50}}>
          <Cryptog scale={0.9} angle={this.state.flippingPogsAngle} id={this.state.flippedThisRound[m].id} flying={this.state.flippingPogs} image={this.state.flippedThisRound[m].image}/>
         </div>
       )
     }
   }


    let display = ""
    if(stackMode==0){
      let callToAction
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        callToAction=(
          <div key={"cancelstackbutton"+this.state.stack} style={{marginTop:20,marginLeft:20}}>
            <MMButton color={"#f7861c"} onClick={this.cancelStack.bind(this,this.state.stack)}>cancel</MMButton>
          </div>

        )
      }

      let stackDisplay = (
        <Stack key={"mainstack"} {...stackData} callToAction={callToAction}/>
      )


      let drawCounterStacks = counterStacks.map((counterstack)=>{
        if(!stackData.canceledCounterStacks || stackData.canceledCounterStacks.indexOf(counterstack._counterStack)<0){
          let callToAction
          if(account.toLowerCase()==stackData.owner.toLowerCase()){
            callToAction=(
              <div key={"counterstackbutton"+counterstack._counterStack} style={{marginTop:16,marginLeft:16}}>
                <MMButton color={"#6ac360"} onClick={this.acceptStack.bind(this,counterstack._counterStack)}>accept</MMButton>
              </div>
            )
          }else if(counterstack.owner.toLowerCase()==account.toLowerCase()){
            callToAction=(
              <div key={"counterstackcancelbutton"+counterstack._counterStack} style={{marginTop:20,marginLeft:20}}>
                <MMButton color={"#f7861c"} onClick={this.cancelCounterStack.bind(this,this.state.stack,counterstack._counterStack)}>cancel</MMButton>
              </div>
            )
          }
          return (
              <Stack key={"counterstack"+counterstack._counterStack} {...counterstack} callToAction={callToAction}/>
          )
        }
      })

      let message
      let portInfo = ""
      if(window.location.port && window.location.port!="80"){
        portInfo=":"+window.location.port
      }
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        if(drawCounterStacks.length>0){
          message = ""
          message = (
            <div>
              <div style={{padding:10,paddingTop:20}}>Share game url:</div>
              <pre id="url" style={{fontSize:14}} onClick={selectText}>{window.location.protocol+"//"+window.location.hostname+portInfo+"/join/"+this.state.stack}</pre>
              <div style={{padding:10,paddingTop:20}} className={"actionable"}>{"Accept an opponent's stack:"}</div>
            </div>
          )
        }else{
          message = (
            <div>
              <div style={{padding:10,paddingTop:20}}>Waiting for other players to join, share game url to challenge your friends:</div>
              <pre id="url" style={{fontSize:14}} onClick={selectText}>{window.location.protocol+"//"+window.location.hostname+portInfo+"/join/"+this.state.stack}</pre>

              <div className={"centercontainer"}>
                <div style={{padding:40,marginTop:60}}>
                  <MMButton color={"#6081c3"} onClick={()=>{
                    window.open(etherscan+"address/"+contracts['Cryptogs']._address);
                  }}>Watch Contract Transactions</MMButton>
                </div>
              </div>


            </div>
          )
        }
      }else{

          message = (
            <div style={{padding:20}} className={"actionable"}>
              {"Waiting for the player 1 to accept a stack..."}
            </div>
          )

      }

      display = (
        <div>
          {stackDisplay}
          <div>{message}</div>
          {drawCounterStacks}
        </div>
      )
    }else if(stackMode==1){
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        display = (
          <div className={"actionable"}>
            Click the slammer to determine who goes first...
          </div>
        )
      }else{
        display = (
          <div>
            Waiting for player 1 to start slammer flip to determine who goes first...
          </div>
        )
      }

    }else if(stackMode==2){
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        display = (
          <div className={"actionable"}>
            Click the slammer to stop it to determine who goes first...
          </div>
        )
      }else{
        display = (
          <div style={{marginTop:20}}>
            Waiting for player 1 to stop slammer flip...
          </div>
        )
      }
    }else if(stackMode==3){
      if(!spectator){
        if(account.toLowerCase()==lastActor.toLowerCase()){
          display = (
            <div>
              Waiting for other player to raise slammer...
            </div>
          )
        }else{
          display = (
            <div className={"actionable"}>
              Click the slammer to prepare to throw...
            </div>
          )
        }
      }
    }else if(stackMode==4){
      if(!spectator){
        if(account.toLowerCase()==lastActor.toLowerCase()){
          display = (
            <div>
              Waiting for other player to throw slammer...
            </div>
          )
        }else{
          display = (
            <div className={"actionable"}>
              Click the slammer to throw...
            </div>
          )

        }
      }
    }else if(stackMode==9){
      coinFlipResultDisplay=""
      //flipDisplay=""
        display = (
          <div>
            <div style={{opacity:0.3,marginTop:100,fontWeight:'bold',padding:50,fontSize:99,letterSpacing:-2}}>
              Game Over
            </div>
            <div className={"centercontainer"}>
              <div style={{padding:40,marginTop:80}}>
                <MMButton color={"#6ac360"} onClick={()=>{window.location="/stacks"}}>{"Play 'Togs!"}</MMButton>
              </div>
            </div>
          </div>
        )

    }else{
      display = (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
      )
    }

    let slammerOpacity = 0.7




    let timerDisplay = ""
    if(lastBlock&&lastActor){

      let turn
      if(spectator){
        if(player1.toLowerCase()==lastActor.toLowerCase()){
          turn = "Player 2's Turn"
        }else{
          turn = "Player 1's Turn"
          slammerOpacity=1
        }
      }else{
        if(account.toLowerCase()==lastActor.toLowerCase()){
          turn = "Their Turn"
        }else{
          turn = "Your Turn"
          slammerOpacity=1
        }
      }



      let drainDisplay = ""
      if(blockNumber-lastBlock >= TIMEOUTBLOCKS && !spectator){
        drainDisplay = (
          <MMButton color={"#fe2311"} onClick={this.drainStack.bind(this)}>drain</MMButton>
        )
      }


      if(stackMode<9){
        timerDisplay = (
          <div style={{float:'right'}}>
            <div style={{fontSize:30}}>{turn}</div>
            <div style={{fontSize:12,opacity:0.2}}>{blockNumber-lastBlock}/{TIMEOUTBLOCKS} blocks to timeout</div>
            <div>{drainDisplay}</div>

          </div>
        )
      }

    }

    let m=1

    let flipDisplyContent = ""
    if(coinFlipResultDisplay || flipDisplay){
      flipDisplyContent = (
        <div className={"messageGray"} style={{clear:'both',marginTop:50,width:250,float:'right',padding:20}}>
          {coinFlipResultDisplay}
          {flipDisplay}
        </div>
      )
    }

    let slammerCursor = 'not-allowed'
    if(account&&lastActor&&account.toLowerCase()!=lastActor.toLowerCase()){
      slammerCursor = 'pointer'
    }


    return (
      <div  style={{backgroundColor:"#FFFFFF",width:"100%",height:800}}>
      {timerDisplay}
      {flipDisplyContent}
      {display}
      <div style={{position:'absolute',left:window.innerWidth/3,top:550}}>

        {mixedStack}
        {flightStack}

        <Motion
        defaultStyle={{
          left:0,
          top:0,
        }}
        style={{
          top:spring(this.state.slammerTop,{ stiffness: 100, damping: 6 }),
          left:spring(this.state.slammerLeft,{ stiffness: 100, damping: 6 })
        }}
        >
          {currentStyles => {
            return (
              <div onClick={this.slammerClick.bind(this)} style={{opacity:slammerOpacity,cursor:slammerCursor,position:"absolute",left:currentStyles.left,top:currentStyles.top,zIndex:90}}>
                <Slammer spinning={this.state.slammerSpinning} angle={this.state.slammerAngle} image={"ethslammer.png"}/>
              </div>
            )
          }}
        </Motion>
      </div>
      </div>
    )

  }
}
export default PlayStack;

/*
<div className={"spinner"} style={{
  animationName:"flightPathN350",
  position:"absolute",left:350,top:175
}} >
 <Cryptog angle={30} id={0} flying={this.state.flippingPogs} image={"unicorn.png"}/>
</div>
 */

function selectText() {
    let containerid = "url"
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}
