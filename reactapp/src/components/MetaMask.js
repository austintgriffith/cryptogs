import React, { Component } from 'react';
import Blockies from 'react-blockies'
var web3
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
    this.forceUpdate()
    setInterval(()=>{ this.forceUpdate() },647)
    setInterval( this.checkMetamask.bind(this) ,1001)
    this.checkMetamask()
  }
  checkMetamask() {
    if (typeof window.web3 == 'undefined' && typeof web3 == 'undefined' ) {
      if(this.state.metamask!=0) this.setState({metamask:0})
    } else {
      let thisWeb3
      if(typeof web3 != 'undefined'){
        thisWeb3 = web3
      }else{
        thisWeb3 = window.web3
      }
      thisWeb3.version.getNetwork((err,network)=>{
        network = translateNetwork(network);
        if( network=="Morden" || network=="Rinkeby" || network=="Kovan"){
          if(this.state.metamask!=2) this.setState({metamask:2,network:network})
        }else{
          let accounts
          try{
            thisWeb3.eth.getAccounts((err,_accounts)=>{
              if(err){
                console.log("metamask error",err)
                if(this.state.metamask!=-1) this.setState({metamask:-1,network:network})
              }else{
                accounts = _accounts;
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
                    window.location.reload(true);
                  }else{
                    if(this.state.metamask!=3) {
                      this.setState({metamask:3,accounts:accounts,network:network},()=>{
                        this.props.init(accounts[0])
                      })
                    }
                  }
                }
              }
            })
          }catch(e){
            console.log(e)
            if(this.state.metamask!=-1) this.setState({metamask:-1,network:network})
          }
        }

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
        <a target="_blank"  href="https://metamask.io/">
        {metamaskImage}
        <span style={this.state.textStyle}>
          Unable to connect to network
        </span>
        </a>
      )
    }else if(!this.state.metamask){
      //not installed
      let mmClick = ()=>{
        window.open('https://metamask.io', '_blank');
      }
      metamask = (
        <div style={{zIndex:999999}} onClick={mmClick}>
          <a target="_blank" href="https://metamask.io/">
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
          networkDisplay = <span onClick={()=>{window.location = "/debug"}}>Mainnet</span>
        }

        metamask = (
          <div style={{padding:4}}>

            <div style={{marginRight:50}}>
              <span style={{
                float:'left',
                marginTop:3,
                paddingLeft:60,
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
                seed={this.state.accounts[0]}
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
