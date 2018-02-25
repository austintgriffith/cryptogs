import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import Cryptog from '../components/Cryptog.js'
import StackSelect from '../components/StackSelect.js'

let loadInterval
const GWEI = 10

class PlayStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stackMode:0,
      stack:props.match.params.stack,
      counterStacks:[],
      stackedUpCryptogs:[],
    }
    this.loadStackData()
    loadInterval = setInterval(this.loadStackData.bind(this),707)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  async loadStackData(){
    let stack
    let {contracts,web3} = this.props.context
    //console.log("contracts",contracts)
    let update = {}

    update.stackData = await contracts['Cryptogs'].methods.getStack(this.state.stack).call()
    for(let t=1;t<=5;t++){
      let token = await contracts['Cryptogs'].methods.getToken(update.stackData["token"+t]).call()//this.state.allStacks[id]
      update.stackData["token"+t+"Image"] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
    }
    update.stackMode = await contracts['Cryptogs'].methods.mode(this.state.stack).call()


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

      let possibleFlightPaths = [350,300,250,200,150,-150,-200,-250,-300,-350];
    if(update.stackMode!=this.state.stackMode){
      let mixedStackIds = await contracts['Cryptogs'].methods.getMixedStack(this.state.stack).call()

      update.mixedStack = []
      update.flippedThisRound = []

      for(let i in mixedStackIds){
        if(mixedStackIds[i]>0){
          let token = await contracts['Cryptogs'].methods.getToken(mixedStackIds[i]).call()//this.state.allStacks[id]
          let image = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
          update.mixedStack.push({id:mixedStackIds[i],image:image})
        }else{
          console.log("item",i,"is out")
          if(this.state.mixedStack &&this.state.mixedStack[i]&& this.state.mixedStack[i].id!=0){


            //let arrayofonerandompath = possibleFlightPaths.splice(Math.floor(Math.random()*possibleFlightPaths.length),1);
            //this.state.mixedStack[i].thisFlightPath = arrayofonerandompath[0]
            this.state.mixedStack[i].thisFlightPath=possibleFlightPaths[i]
            console.log("and it happened this round, flight path will be",this.state.mixedStack[i].thisFlightPath)
            update.flippedThisRound.push(this.state.mixedStack[i])
            update.flippingPogs=true;
            update.flippingPogsAngle=false;
          }
        }
      }
      console.log("TRANSITION TO",update.mixedStack,update.flippedThisRound)

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



    this.setState(update,()=>{
      if(update.flippingPogs){
        setTimeout(()=>{
          this.setState({flippingPogs:false,flippingPogsAngle:65})
        },2000)
      }
    })
  }
  acceptStack(counterStack){
    console.log("ACCEPT",this.state.stack,counterStack)
    let {contracts,account} = this.props.context
    //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
    contracts["Cryptogs"].methods.acceptCounterStack(contracts["SlammerTime"]._address,this.state.stack,counterStack).send({
      from: account,
      gas:1000000,
      gasPrice:GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
    }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
    this.setState({counterStack:counterStack})
  }
  startCoinFlip(){

    console.log("START COIN FLIP",this.state.stack,this.state.counterStack)
    let {contracts,account,web3} = this.props.context

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
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
      })
  }
  endCoinFlip(){
    console.log("END COIN FLIP",this.state.stack,this.state.counterStack,this.state.commit)
    let {contracts,account,web3} = this.props.context

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
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
      })
  }
  raiseSlammer(){
    console.log("raiseSlammer",this.state.stack,this.state.counterStack)
    let {contracts,account,web3} = this.props.context

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
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
      })
  }
  throwSlammer(){
    console.log("throwSlammer",this.state.stack,this.state.counterStack,this.state.commit)
    let {contracts,account,web3} = this.props.context

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
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
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
  render(){
    let {account,blockNumber} = this.props.context
    let {stackMode,stackData,counterStacks,lastBlock,lastActor,TIMEOUTBLOCKS,flipEvents,throwSlammerEvents} = this.state;
    if(!stackData){
      return (
        <div style={{opacity:0.3}}>Loading...</div>
      )
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
         <div key={"mixedStack"+m} style={{position:'absolute',left:0,top:(-10*m),zIndex:m}}>
          <Cryptog  angle={65} scale={0.9} id={this.state.mixedStack[m].id} image={this.state.mixedStack[m].image}/>
         </div>
       )
     }
   }



   let flightStack = []
   if(stackMode==3){
     for(let m in this.state.flippedThisRound){
       let thisFlightPath = this.state.flippedThisRound[m].thisFlightPath
       let possibleFlightPathsText = ""
       if(thisFlightPath<0) {
         possibleFlightPathsText = (thisFlightPath)*-1
       }else{
         possibleFlightPathsText = "N"+(thisFlightPath)
       }
       let animationName = "flightPath"+possibleFlightPathsText
       let top = (m*15)+(Math.abs(thisFlightPath)/2)
       let left = thisFlightPath
       console.log("-----flightStack",m,animationName,top,left)
       flightStack.push(
         <div key={"flightStack"+m} className={'spinner'} style={{animationName:animationName,position:"absolute",left:left,top:top}}>
          <Cryptog scale={0.9} angle={this.state.flippingPogsAngle} id={this.state.flippedThisRound[m].id} flying={this.state.flippingPogs} image={this.state.flippedThisRound[m].image}/>
         </div>
       )
     }
   }


    let display = ""
    if(stackMode==0){

      let stackDisplay = (
        <Stack key={"mainstack"} {...stackData}/>
      )


      let drawCounterStacks = counterStacks.map((counterstack)=>{
        let callToAction
        if(account.toLowerCase()==stackData.owner.toLowerCase()){
          callToAction=(
            <button key={"counterstackbutton"+counterstack._counterStack} onClick={this.acceptStack.bind(this,counterstack._counterStack)}>accept</button>
          )
        }
        return (
            <Stack key={"counterstack"+counterstack._counterStack} {...counterstack} callToAction={callToAction}/>
        )
      })

      let message
      let portInfo = ""
      if(window.location.port!="80"){
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
        message = "Waiting for the game creator to accept your stack..."
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
          <div onClick={this.startCoinFlip.bind(this)}>
            <Cryptog key={"coinflip"} id={0} flipping={this.state.coinFlipping} image={"unicorn.png"}/>
            <button>startCoinFlip</button>
            <div>(to determine who goes first)</div>
          </div>
        )
      }else{
        display = (
          <div>
            Waiting for game creator to start coin flip to determine who goes first...
            <Cryptog key={"coinflip"} id={0} flipping={this.state.coinFlipping} image={"unicorn.png"}/>
          </div>
        )
      }

    }else if(stackMode==2){
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        display = (
          <div>
            <Cryptog key={"coinflip"} id={0} flipping={this.state.coinFlipping} image={"unicorn.png"}/>
            <button onClick={this.endCoinFlip.bind(this)}>endCoinFlip</button>
          </div>
        )
      }else{
        display = (
          <div>
          Waiting for game creator to stop coin flip...
          <Cryptog key={"coinflip"} id={0} flipping={this.state.coinFlipping} image={"unicorn.png"}/>
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
            <button onClick={this.raiseSlammer.bind(this)}>raiseSlammer</button>
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
            <button onClick={this.throwSlammer.bind(this)}>throwSlammer</button>
          </div>
        )

      }
    }else if(stackMode==9){

        display = (
          <div>
            Game has finished
          </div>
        )

    }else{
      display = (
        <div>PLAY</div>
      )
    }

    let timerDisplay = ""
    if(lastBlock&&lastActor){

      let turn
      if(account.toLowerCase()==lastActor.toLowerCase()){
        turn = "Their Turn"
      }else{
        turn = "Your Turn"
      }

      let drainDisplay = ""
      drainDisplay = (
        <button onClick={this.drainStack.bind(this)}>drain</button>
      )

      timerDisplay = (
        <div style={{float:'right'}}>
          <div>{blockNumber-lastBlock}/{TIMEOUTBLOCKS}</div>
          <div>{drainDisplay}</div>
          <div>{turn}</div>
        </div>
      )
    }

    let modeDisplay = ""
    if(stackMode>0&&stackMode<9){
      modeDisplay = (
        <div style={{float:'right'}}>mode:{stackMode}</div>
      )
    }

    let m=1
    return (
      <div>
      {modeDisplay}
      {timerDisplay}
      <div style={{zIndex:-1,fontSize:12,position:'fixed',top:200,right:20,backgroundColor:"#eeeeee",padding:20}}>
        {flipDisplay}
      </div>
      {display}
      <div style={{position:'absolute',left:window.innerWidth/3,top:(window.innerHeight*2/3)}}>
        {mixedStack}
        {flightStack}

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
