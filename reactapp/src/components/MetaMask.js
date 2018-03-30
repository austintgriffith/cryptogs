import React, { Component } from 'react';
import Blockies from 'react-blockies'
var Web3 = require('web3')
var web3

const DEBUG = false

// const mmLink = "https://metamask.io/"
const mmLink = "/web3"

class MetaMask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metamask:0,
      network:0,
      textStyle:{
        fontSize:18,
        verticalAlign:"middle"
      }
    }
  }
  componentDidMount(){
    window.addEventListener('load',this.checkMetamask.bind(this))
    setInterval(this.checkMetamask.bind(this),3003)
  }
  checkMetamask(){
    if(DEBUG) console.log("Detecting web3...")
    let web3js
    if (typeof web3 !== 'undefined') {
      web3js = new Web3(web3.currentProvider);
    } else if (typeof window.web3 !== 'undefined') {
      web3js = new Web3(window.web3.currentProvider);
    } else {
      if(DEBUG) console.log("no web3")
    }
    if(web3js){
      if(DEBUG) console.log("Found web3...")
      web3js.eth.net.getId().then((network)=>{
        if(DEBUG) console.log("Network:",network)
        let networkNumber = network
        web3js.eth.getAccounts().then((accounts)=>{
          if(DEBUG) console.log("Accounts:",accounts)
          network = translateNetwork(network);
          if( network=="Morden" || network=="Rinkeby" || network=="Kovan"){
            if(DEBUG) console.log("Wrong network:",network)
            if(this.state.metamask!=2) this.setState({metamask:2,network:network})
          }else{
            if(!accounts||accounts.length<=0){
              if(DEBUG) console.log("metamask didn't find accounts...")
              if(this.state.metamask!=-1) this.setState({metamask:-1,network:network})
            }else{
              if(DEBUG) console.log("web3!")
              if(network){
                let etherscan = "https://etherscan.io/"
                if(network=="Unknown"||network=="private"){
                  etherscan = "http://localhost:8000/#/"
                }else if(network!="Mainnet"){
                  etherscan = "https://"+network.toLowerCase()+".etherscan.io/"
                }
                this.props.setEtherscan(etherscan)
              }
              if(!accounts){
                if(this.state.metamask!=-1) this.setState({metamask:-1,network:network})
              } else if(accounts.length<=0){
                if(this.state.metamask!=2) this.setState({metamask:2,network:network})
              } else{
                if(this.props.account&&this.props.account!=accounts[0]){
                  //force a reload on account change
                  window.location.reload(true);
                }else{
                  if(this.state.metamask!=3) {
                    this.setState({metamask:3,accounts:accounts,network:network},()=>{
                      this.props.init(accounts[0],networkNumber,web3js)
                    })
                  }
                }
              }
            }
          }
        })
      })
    }
  }
  render(){
    let metamask

    let blockDisplay = (
      <span style={{padding:5,opacity:0.3}}>
        connecting...
      </span>
    )

    let metamaskImage = (
      <img style={{maxHeight:40,marginTop:10,paddingRight:5,verticalAlign:"middle"}}
      src="/metamask.png"
      />
    )

    if(this.props.blockNumber&&this.props.blockNumber>0){
      blockDisplay = (
        <a style={{marginLeft:10}} target="_blank" href={this.props.etherscan+"block/"+this.props.blockNumber}>
          {this.props.blockNumber}
        </a>
      )
    }
    //console.log("this.state.metamask",this.state.metamask,"this.state.network",this.state.network)
    if(-1==this.state.metamask){
      //not installed
      metamask = (
        <div>
          {metamaskImage}
          <span style={this.state.textStyle}>
            Unlock metamask to play
          </span>
        </div>
      )
    }else if(!this.state.metamask){
      //not installed
      let mmClick = ()=>{
        window.open(mmLink, '_blank');
      }
      metamask = (
        <div style={{zIndex:999999}} onClick={mmClick}>
          <a target="_blank" href={mmLink}>
          {metamaskImage}
          <span style={this.state.textStyle}>
            Install MetaMask to play
          </span>
          </a>
        </div>
      )
    }else if(this.state.metamask==1){
      //not installed
      metamask = (
        <div>
        {metamaskImage}
        <span style={this.state.textStyle}>
          MetaMask is on the wrong network
        </span>
        </div>
      )
    }else if(this.state.metamask==2){
      if(this.state.network=="Morden" || this.state.network=="Rinkeby" || this.state.network=="Kovan"){
        //console.log("goodblock",this.state.accounts[0])
        metamask = (
          <div style={{padding:4}}>

          {metamaskImage}

              <span style={{
                marginTop:3,
                zIndex:210,
                fontWeight:'bold',
                fontSize:21,
                color:"#222",
              }}>
                Please switch your network to Ropsten or Mainnet
              </span>


          </div>
        )
      }else{
        metamask = (
          <div>
            {metamaskImage}
            Unlock MetaMask to play
          </div>
        )
      }
    }else if(!this.state.accounts){

      metamask = (
        <div>
        {metamaskImage}
        <span style={this.state.textStyle}>
          Error Connecting
        </span>

        </div>
      )

    }else{


        let networkDisplay = this.state.network
        if(this.state.network=="Mainnet"){
          networkDisplay = <span>Mainnet</span>
        }

        metamask = (
          <div style={{padding:4}}>

            <div style={{marginRight:50}}>
              <span style={{
                float:'left',
                marginTop:3,
                paddingLeft:40,
                zIndex:210,
                fontWeight:'bold',
                fontSize:18,
                color:"#222",
                textAlign:"left",

              }}>
              <a target="_blank" href={this.props.etherscan+"address/"+this.state.accounts[0]}>
                <div>
                  {this.state.accounts.length > 0 ? this.state.accounts[0].substring(0,16) : "Loading..."}
                </div>
              </a>
                <div>
                  {networkDisplay}
                  {blockDisplay}
                </div>
              </span>
            </div>

            <div style={{position:"absolute",left:10,top:10}}>
              <a target="_Blank" href="https://wallet.ethereum.org/">
              <Blockies
                seed={this.state.accounts[0].toLowerCase()}
                scale={6}
              />
              </a>
            </div>
          </div>
        )

    }
    return (
      <div style={{float:'left',padding:2,paddingRight:10,marginLeft:this.props.currentStyles.marginLeft}}>
      {metamask}
      </div>
    )
  }
}

export default MetaMask;

function translateNetwork(network){
  if(network==5777){
    return "Private";
  }else if(network==1){
    return "Mainnet";
  }else if(network==2){
    return "Morden";
  }else if(network==3){
    return "Ropsten";
  }else if(network==4){
    return "Rinkeby";
  }else if(network==42){
    return "Kovan";
  }else{
    return "Unknown";
  }
}
