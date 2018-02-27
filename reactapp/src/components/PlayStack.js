import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import Cryptog from '../components/Cryptog.js'
import Slammer from '../components/Slammer.js'
import Spinner from '../components/Spinner.js'
import StackSelect from '../components/StackSelect.js'
import {Motion, spring, presets} from 'react-motion';
import MMButton from '../components/MMButton.js'

let loadInterval
const GWEI = 10
let slammerTimeout
const DEBUG = false

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
    this.loadStackData()
    loadInterval = setInterval(this.loadStackData.bind(this),707)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  async loadStackData(){
    let stack
    let {contracts,web3,showLoadingScreen} = this.props.context
    //console.log("contracts",contracts)
    let update = {}

    update.stackData = await contracts['Cryptogs'].methods.getStack(this.state.stack).call()
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
      }
    }

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


    if(update.stackMode>2){
      //  event ThrowSlammer(bytes32 indexed stack, bool success, address whoDoneIt, uint32 blockNumber, bool token1Flipped, bool token2Flipped, bool token3Flipped, bool token4Flipped, bool token5Flipped, bool token6Flipped, bool token7Flipped, bool token8Flipped, bool token9Flipped, bool token10Flipped);

      let throwSlammerEvents = await contracts['Cryptogs'].getPastEvents("ThrowSlammer", {
        filter: {stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      update.throwSlammerEvents = []
      for(let e in throwSlammerEvents){
        update.throwSlammerEvents.push(throwSlammerEvents[e].returnValues)
      }
    }

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
    contracts["Cryptogs"].methods.acceptCounterStack(contracts["SlammerTime"]._address,this.state.stack,counterStack).send({
      from: account,
      gas:1000000,
      gasPrice:GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
    }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
      console.log("RESULT:",receipt)
      showLoadingScreen(false)
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
      gasPrice:GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
    }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
      console.log("RESULT:",receipt)
      window.location = "/stacks/"
      showLoadingScreen(false)
    })

  }
  cancelCounterStack(stack,counterstack){
    console.log("CANCEL STACK")
    let {contracts,account,showLoadingScreen} = this.props.context
    //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
    contracts["Cryptogs"].methods.cancelCounterStack(stack,counterstack).send({
      from: account,
      gas:350000,
      gasPrice:GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
    }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
      console.log("RESULT:",receipt)
      window.location = "/stacks/"
      showLoadingScreen(false)
    })

  }
  startCoinFlip(){

    console.log("START COIN FLIP",this.state.stack,this.state.counterStack)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let commit = web3.utils.sha3(Math.random()+this.state.account+"COINFLIP!")
    console.log("commit:",commit)
    let commitHash = web3.utils.sha3(commit)
    console.log("commitHash:",commitHash)

    this.setState({commit:commit})

    //startCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
    contracts["Cryptogs"].methods.startCoinFlip(this.state.stack,this.state.counterStack,commitHash).send({
        from: account,
        gas:150000,
        gasPrice:GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      })
  }

  endCoinFlip(){
    console.log("END COIN FLIP",this.state.stack,this.state.counterStack,this.state.commit)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let reveal = this.state.commit
    //if reveal isn't saved in the state, send 0's to start over with the coin flip
    if(!reveal) reveal = "0x0000000000000000000000000000000000000000000000000000000000000000"

    //endCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _reveal)
    contracts["Cryptogs"].methods.endCoinFlip(this.state.stack,this.state.counterStack,reveal).send({
        from: account,
        gas:150000,
        gasPrice:GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      })
  }
  raiseSlammer(){
    console.log("raiseSlammer",this.state.stack,this.state.counterStack)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let commit = web3.utils.sha3(Math.random()+this.state.account+"SLAMMERTIMEJABRONIES!")
    console.log("commit:",commit)
    let commitHash = web3.utils.sha3(commit)
    console.log("commitHash:",commitHash)

    this.setState({commit:commit})

    //raiseSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
    contracts["Cryptogs"].methods.raiseSlammer(this.state.stack,this.state.counterStack,commitHash).send({
        from: account,
        gas:150000,
        gasPrice:GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      })
  }
  throwSlammer(){
    console.log("throwSlammer",this.state.stack,this.state.counterStack,this.state.commit)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let reveal = this.state.commit
    //if reveal isn't saved in the state, send 0's to start over with the coin flip
    if(!reveal) reveal = "0x0000000000000000000000000000000000000000000000000000000000000000"

    //raiseSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
    contracts["Cryptogs"].methods.throwSlammer(this.state.stack,this.state.counterStack,reveal).send({
        from: account,
        gas:500000,
        gasPrice:GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      })
  }
  drainStack(){
    let {contracts,account} = this.props.context
    console.log("drainStack",this.state.stack,this.state.counterStack)
    contracts["Cryptogs"].methods.drainStack(this.state.stack,this.state.counterStack).send({
      from: account,
      gas:500000,
      gasPrice:GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
    }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  slammerClick(){
    let {account} = this.props.context
    let {lastActor} = this.state;
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
    let {account,blockNumber} = this.props.context
    let {coinFlipResult,stackMode,stackData,counterStacks,lastBlock,lastActor,TIMEOUTBLOCKS,flipEvents,throwSlammerEvents} = this.state;
    if(!stackData){
      return (
        <div style={{opacity:0.3}}>Loading...</div>
      )
    }



    let coinFlipResultText = ""

    if(coinFlipResult){
      if(coinFlipResult.whosTurn.toLowerCase()==account.toLowerCase()){
        coinFlipResultText= "You won the slammer toss, you go first. "
      }else{
        coinFlipResultText= "They won the slammer toss, they go first. "
      }
    }

    let flipDisplay = ""

    if(throwSlammerEvents && throwSlammerEvents.length>0){
      flipDisplay = throwSlammerEvents.map((throwSlammerEvent)=>{
        let flipped = []
        for(let i=1;i<=10;i++){
          if(throwSlammerEvent['token'+i+'Flipped']){
            flipped.push(
              <span key={"log"+i}>
                #{i}
              </span>
            )
          }
        }
        let who = ""
        if(throwSlammerEvent.whoDoneIt.toLowerCase()==account.toLowerCase()){
          if(flipped.length>0){
            who = "You Flipped:"
          }else{
            if(throwSlammerEvent.success){
              who = "You Wiffed"
            }else{
              who = "Your throw failed, try again."
            }

          }

        }else{
          if(flipped.length>0){
            who = "They Flipped"
          }else{
            if(throwSlammerEvent.success){
              who = "They Wiffed"
            }else{
              who = "Their throw failed, trying again."
            }
          }
        }
       return (
         <div key={"logdiv"+throwSlammerEvent.blockNumber}>
         <span>#{throwSlammerEvent.blockNumber}</span>
         <span style={{margin:5}}>{who}</span>
         {flipped}

         </div>
       )
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
              <div style={{padding:10,paddingTop:20}}>{"Accept an opponent's stack:"}</div>
            </div>
          )
        }else{
          message = (
            <div>
              <div style={{padding:10,paddingTop:20}}>Waiting for other players to join, share game url to challenge your friends:</div>
              <pre id="url" style={{fontSize:14}} onClick={selectText}>{window.location.protocol+"//"+window.location.hostname+portInfo+"/join/"+this.state.stack}</pre>
            </div>
          )
        }
      }else{

          message = (
            <div style={{padding:20}}>
              {"Waiting for the game creator to accept a stack..."}
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
          <div>
            Click the slammer to determine who goes first...
          </div>
        )
      }else{
        display = (
          <div>
            Waiting for game creator to start slammer flip to determine who goes first...
          </div>
        )
      }

    }else if(stackMode==2){
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        display = (
          <div>
            Click the slammer to stop it to determine who goes first...
          </div>
        )
      }else{
        display = (
          <div style={{marginTop:20}}>
            Waiting for game creator to stop slammer flip...
          </div>
        )
      }
    }else if(stackMode==3){
      if(account.toLowerCase()==lastActor.toLowerCase()){
        display = (
          <div>
            Waiting for other player to raise slammer...
          </div>
        )
      }else{
        display = (
          <div>
            Click the slammer to prepare to throw...
          </div>
        )
      }
    }else if(stackMode==4){
      if(account.toLowerCase()==lastActor.toLowerCase()){
        display = (
          <div>
            Waiting for other player to throw slammer...
          </div>
        )
      }else{
        display = (
          <div>
            Click the slammer to throw...
          </div>
        )

      }
    }else if(stackMode==9){

        display = (
          <div style={{opacity:0.3,marginTop:100,fontWeight:'bold',padding:50,fontSize:99,letterSpacing:-2}}>
            Game Over
          </div>
        )

    }else{
      display = (
        <div style={{opacity:0.3}}>Loading...</div>
      )
    }

    let slammerOpacity = 0.7

    let timerDisplay = ""
    if(lastBlock&&lastActor){

      let turn

      if(account.toLowerCase()==lastActor.toLowerCase()){
        turn = "Their Turn"
      }else{
        turn = "Your Turn"
        slammerOpacity=1
      }

      let drainDisplay = ""
      if(blockNumber-lastBlock >= TIMEOUTBLOCKS){
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
    return (
      <div>
      {timerDisplay}
      <div style={{zIndex:-1,fontSize:12,position:'fixed',top:200,right:20,backgroundColor:"#eeeeee",padding:20}}>
        {coinFlipResultText}
        {flipDisplay}
      </div>
      {display}
      <div style={{position:'absolute',left:window.innerWidth/3,top:(window.innerHeight*5/9)}}>

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
              <div onClick={this.slammerClick.bind(this)} style={{opacity:slammerOpacity,cursor:'pointer',position:"absolute",left:currentStyles.left,top:currentStyles.top,zIndex:90}}>
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
