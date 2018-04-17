import React, { Component } from 'react';
import Blockies from 'react-blockies'
var Web3 = require('web3')
var web3

const DEBUG = false

 const mmLink = "https://metamask.io/"
//const mmLink = "/web3"

class MetaMask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metamask:0,
      network:0,
      textStyle:{
        fontSize:18,
        verticalAlign:"middle",
        color:"#999999"
      }
    }
  }
  componentDidMount(){
    window.addEventListener('load',this.checkMetamask.bind(this))
    setInterval(this.checkMetamask.bind(this),3003)
  }
  checkMetamask(){
    if(DEBUG) console.log("Detecting web3...")
    if (typeof web3 !== 'undefined' && typeof web3.currentProvider !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      web3 = new Web3(window.web3.currentProvider);
    } else {
      if(DEBUG) console.log("no web3")
    }
    if(web3){
      if(DEBUG) console.log("Found web3...")
      web3.eth.net.getId().then((network)=>{
        if(DEBUG) console.log("Network:",network)
        if(network>9999) network=9999
        let networkNumber = network

        if(!this.props.network || this.props.network!=network) this.props.networkReady(networkNumber,web3)

        web3.eth.getAccounts().then((accounts)=>{
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
                //}else if(this.props.network&&this.props.network!=network){
                    //force a reload on account change
                //    window.location.reload(true);
                }else{
                  if(this.state.metamask!=3) {
                    this.setState({metamask:3,accounts:accounts,network:network},()=>{
                      this.props.init(accounts[0],networkNumber,web3)
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
      <img style={{maxHeight:40,marginTop:0,paddingRight:5,verticalAlign:"middle"}}
      src="/metamask.png"
      />
    )
    let mobileImage = (
      <img style={{filter:'blur(10px)',filter:"grayscale(70%)",borderRadius:"45%",opacity:0.3,maxHeight:40,marginTop:10,paddingRight:5,verticalAlign:"middle"}}
      src="/cryptogs/toshi.jpg"
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
      if(window.mobileAndTabletcheck()){
        metamask = (
          <div style={{zIndex:999999}} onClick={()=>{
            window.open("/web3", '_blank');
          }}>
            <a target="_blank" href={"/web3"}>
            {mobileImage}
            <span style={this.state.textStyle}>
              Install & Unlock Web3
            </span>
            </a>
          </div>
        )
      }else{
        metamask = (
          <div style={{zIndex:999999}} onClick={mmClick}>
            <a target="_blank" href={mmLink}>
            {metamaskImage}
            <span style={this.state.textStyle}>
              Install & Unlock MetaMask
            </span>
            </a>
          </div>
        )
      }

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
              <a target="_blank" href={"/address/"+this.state.accounts[0]}>
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
              <a target="_Blank" href={"/address/"+this.state.accounts[0]}>
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
window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
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
