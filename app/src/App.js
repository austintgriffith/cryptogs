import React, { Component } from 'react';
import cryptogsBlockNumber from './cryptogs.blockNumber.js'
import cryptogsAddress from './cryptogs.address.js'
import cryptogsAbi from './Cryptogs.abi.js'
import slammertimeAddress from './slammertime.address.js'
import slammertimeAbi from './SlammerTime.abi.js'
import './App.css';
import Metamask from './Metamask.js'
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
      etherscan:"http://etherscan.io/"
    }
    try{
      web3 = new Web3(window.web3.currentProvider)
      contracts["Cryptogs"] = new web3.eth.Contract(cryptogsAbi,cryptogsAddress)
      contracts["SlammerTime"] = new web3.eth.Contract(slammertimeAbi,slammertimeAddress)
      console.log(contracts["Cryptogs"]._address+" loaded")
      console.log(contracts["SlammerTime"]._address+" loaded")
    } catch(e) {
      console.log(e)
    }
    setInterval(this.syncCryptogs.bind(this),887)
  }

  async syncCryptogs(){
    if( !web3 || !web3.eth || typeof web3.eth.getBlockNumber !="function"){
      console.log("Offline")
    }else{
      try{
        let blockNumber = await web3.eth.getBlockNumber();
        let myCryptogs = await contracts["Cryptogs"].methods.tokensOfOwner(this.state.account).call()
        if(this.state.blockNumber!=blockNumber || this.state.myCryptogs!=myCryptogs){
          this.setState({myCryptogs:myCryptogs,blockNumber:blockNumber})
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
      </div>
    );
  }
}




export default App;
