import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import StackSelect from '../components/StackSelect.js'

let loadInterval
const GWEI = 1

class PlayStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stack:props.match.params.stack,
      counterStacks:[]
    }
    this.loadStackData()
    loadInterval = setInterval(this.loadStackData.bind(this),707)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  async loadStackData(){
    let stack
    let {contracts} = this.props.context
    //console.log("contracts",contracts)
    let update = {}

    console.log("this.state.stack:",this.state.stack)

    update.stackData = await contracts['Cryptogs'].methods.getStack(this.state.stack).call()
    update.stackMode = await contracts['Cryptogs'].methods.mode(this.state.stack).call()

    console.log("MODE:",update.stackMode)

    if(update.stackMode==0){
      let counterStackEvents = await contracts['Cryptogs'].getPastEvents("CounterStack", {
        filter: {_stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      let counterStacks = []
      for(let e in counterStackEvents){
        counterStacks.push(counterStackEvents[e].returnValues)
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



    this.setState(update)
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
        for(let i=0;i<10;i++){
          if(throwSlammerEvent['token'+i+'Flipped']){
            flipped.push(
              <span>
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
            who = "You Wiffed"
          }

        }else{
          if(flipped.length>0){
            who = "They Flipped"
          }else{
            who = "They Wiffed"
          }
        }
       return (
         <div>
         <span>#{throwSlammerEvent.blockNumber}</span>
         <span style={{margin:5}}>{who}</span>
         {flipped}

         </div>
       )
     })
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
            <button onClick={this.acceptStack.bind(this,counterstack._counterStack)}>accept</button>
          )
        }
        return (
            <Stack key={"counterstack"+counterstack._counterStack} {...counterstack} callToAction={callToAction}/>
        )
      })

      let message
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        if(drawCounterStacks.length>0){
          message = "Accept an opponent's stack:"
        }else{
          message = "Waiting for other stacks to join..."
        }
      }else{
        message = "Waiting for game creator to accept your stack..."
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
            <button onClick={this.startCoinFlip.bind(this)}>startCoinFlip</button>
          </div>
        )
      }else{
        display = (
          <div>
            Waiting for coin flip...
          </div>
        )
      }

    }else if(stackMode==2){
      if(account.toLowerCase()==stackData.owner.toLowerCase()){
        display = (
          <div>
            <button onClick={this.endCoinFlip.bind(this)}>endCoinFlip</button>
          </div>
        )
      }else{
        display = (
          <div>
            Waiting for coin flip to land...
          </div>
        )
      }
    }else if(stackMode==3){
      if(account.toLowerCase()==lastActor.toLowerCase()){
        display = (
          <div>
            Waiting for other player to raise slammer...
            {flipDisplay}
          </div>
        )
      }else{
        display = (
          <div>
            <button onClick={this.raiseSlammer.bind(this)}>raiseSlammer</button>
            {flipDisplay}
          </div>
        )

      }
    }else if(stackMode==4){
      if(account.toLowerCase()==lastActor.toLowerCase()){
        display = (
          <div>
            Waiting for other player to throw slammer...
            {flipDisplay}
          </div>
        )
      }else{
        display = (
          <div>
            <button onClick={this.throwSlammer.bind(this)}>throwSlammer</button>
            {flipDisplay}
          </div>
        )

      }
    }else if(stackMode==9){

        display = (
          <div>
            Game has finished:
            {flipDisplay}
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

      timerDisplay = (
        <div style={{float:'right'}}>
          <div>{blockNumber-lastBlock}/{TIMEOUTBLOCKS}</div>
          <div>{turn}</div>
        </div>
      )
    }

    return (
      <div>
      <div style={{float:'right'}}>mode:{stackMode}</div>
      {timerDisplay}
      {display}
      </div>
    )

  }
}
export default PlayStack;

/*

const JoinStack = ({ match: { params } }) => (
<div>
{params.stack}
</div>
)*/
