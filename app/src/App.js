import React, { Component } from 'react';
import cryptogsBlockNumber from './cryptogs.blockNumber.js'
import cryptogsAddress from './cryptogs.address.js'
import cryptogsAbi from './Cryptogs.abi.js'
import slammertimeAddress from './slammertime.address.js'
import slammertimeAbi from './SlammerTime.abi.js'
import './App.css';
import Metamask from './Metamask.js'
import MyCryptogs from './MyCryptogs.js'
import Blockies from 'react-blockies'

var Web3 = require('web3')
let web3

let contracts = []

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hintMode:0,
      blockNumber:-1,
      etherscan:"http://etherscan.io/",
      myCryptogObjs:[],
    }
    try{
      web3 = new Web3(window.web3.currentProvider)
      contracts["Cryptogs"] = new web3.eth.Contract(cryptogsAbi,cryptogsAddress)
      contracts["SlammerTime"] = new web3.eth.Contract(slammertimeAbi,slammertimeAddress)
      console.log(contracts["Cryptogs"]._address+" loaded")
      console.log(contracts["SlammerTime"]._address+" loaded")
      //this.slowSyncEvents()
    } catch(e) {
      console.log(e)
    }
    setInterval(this.syncCryptogs.bind(this),3000)
    //setInterval(this.slowSyncEvents.bind(this),1501)
  }

  async slowSyncEvents() {
    let SubmitStackEvents = await contracts["Cryptogs"].getPastEvents('SubmitStack', {
      fromBlock: cryptogsBlockNumber,
      toBlock: 'latest'
    })
    let SubmitStacks = {}

    for(let f in SubmitStackEvents){
      //console.log(SubmitStackEvents[f].returnValues)
      SubmitStacks[SubmitStackEvents[f].returnValues._stackid]={
        stackid:SubmitStackEvents[f].returnValues._stackid,
        sender:SubmitStackEvents[f].returnValues._sender,
        token1:SubmitStackEvents[f].returnValues._token1,
        token2:SubmitStackEvents[f].returnValues._token2,
        token3:SubmitStackEvents[f].returnValues._token3,
        token4:SubmitStackEvents[f].returnValues._token4,
        token5:SubmitStackEvents[f].returnValues._token5,
      }
    }

    if(SubmitStacks!=this.state.SubmitStacks){//<<--this isn't working right
      //console.log("Updating SubmitStacks",SubmitStacks)
      this.setState({SubmitStacks:SubmitStacks})
    }

    let CounterStackEvents = await contracts["Cryptogs"].getPastEvents('CounterStack', {
      fromBlock: cryptogsBlockNumber,
      toBlock: 'latest'
    })
    let CounterStack = {}

    for(let f in CounterStackEvents){
      //console.log("counter:",CounterStackEvents[f])
      CounterStack[CounterStackEvents[f].returnValues._counterStack]={
        stackid:CounterStackEvents[f].returnValues._stackid,
        counterStack:CounterStackEvents[f].returnValues._counterStack,
        sender:CounterStackEvents[f].returnValues._sender,
        token1:CounterStackEvents[f].returnValues._token1,
        token2:CounterStackEvents[f].returnValues._token2,
        token3:CounterStackEvents[f].returnValues._token3,
        token4:CounterStackEvents[f].returnValues._token4,
        token5:CounterStackEvents[f].returnValues._token5,
      }
    }

    if(CounterStack!=this.state.CounterStack){//<<--this isn't working right
      //console.log("Updating CounterStack",CounterStack)
      this.setState({CounterStack:CounterStack})
    }

    let AcceptCounterStackEvents = await contracts["Cryptogs"].getPastEvents('AcceptCounterStack', {
      fromBlock: cryptogsBlockNumber,
      toBlock: 'latest'
    })
    let AcceptCounterStack = {}

    for(let f in AcceptCounterStackEvents){
      AcceptCounterStack[CounterStackEvents[f].returnValues._stack]={
        stackid:CounterStackEvents[f].returnValues._stack,
        counterStack:CounterStackEvents[f].returnValues._counterStack,
        sender:CounterStackEvents[f].returnValues._sender,
      }
    }

    if(AcceptCounterStack!=this.state.AcceptCounterStack){ //<<--this isn't working right
      //console.log("Updating AcceptCounterStack",AcceptCounterStack)
      this.setState({AcceptCounterStack:AcceptCounterStack})
    }
  }

  async syncCryptogs(){
    if( !web3 || !web3.eth || typeof web3.eth.getBlockNumber !="function"){
      console.log("Offline")
    }else{
      try{
        let blockNumber = await web3.eth.getBlockNumber();
        console.log("LOADING MYCRPTOGS FOR ",this.state.account)
        let myCryptogs = await contracts["Cryptogs"].methods.tokensOfOwner(this.state.account).call()
        console.log("myCryptogs:",myCryptogs)
        if(this.state.blockNumber!=blockNumber){
          this.setState({blockNumber:blockNumber})
        }
        if(myCryptogs && myCryptogs.length>0 && this.state.myCryptogs!=myCryptogs){
          console.log("UPDATE myCryptogs:",myCryptogs)
          this.setState({myCryptogs:myCryptogs})
          let myCryptogObjs = []
          for(let i in myCryptogs ){
            console.log("look up ",myCryptogs[i])
            myCryptogObjs.push( await contracts["Cryptogs"].methods.getToken(myCryptogs[i]).call() )
          }
          this.setState({myCryptogObjs:myCryptogObjs})
        }
      }catch(e){
        console.log(e)
      }
    }
  }
  setEtherscan(url){
    this.setState({etherscan:url})
  }
  init(account) {
    console.log("INIT")
    this.setState({account:account})
  }
  render() {
    return (
      <div className="App">

        <Metamask
          syncBlockNumber={this.syncBlockNumber}
          account={this.state.account}
          init={this.init.bind(this)}
          Blockies={Blockies}
          blockNumber={this.state.blockNumber}
          etherscan={this.state.etherscan}
          setEtherscan={this.setEtherscan.bind(this)}
        />

        <div style={{paddingTop:100,paddingRight:40,paddingLeft:40}}>
          <MyCryptogs myCryptogObjs={this.state.myCryptogObjs} web3={web3} />
        </div>

      </div>
    );
  }
}
//  <Container />
/*
<OpenStacks
  SubmitStacks={this.state.SubmitStacks}
  CounterStack={this.state.CounterStack}
  AcceptCounterStack={this.state.AcceptCounterStack}
/>
 */


export default App;
