import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import Cryptog from '../components/Cryptog.js'
import Spinner from '../components/Spinner.js'
import StackGrid from 'react-stack-grid'
import Blockies from 'react-blockies'
import MMButton from '../components/MMButton.js'
import PogAnimation from '../components/PogAnimation.js'
import Artist from '../modules/artist.js';

let loadInterval
let txhash

class CryptogStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenData:{},
      hasLoadedFirst:false,
      address:""
    }
    this.loadTokenData()
    setTimeout(this.loadTokenData.bind(this),701)
    loadInterval = setInterval(this.loadTokenData.bind(this),1577)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  async loadTokenData(){
    let token = await this.props.context.contracts['Cryptogs'].methods.getToken(this.props.match.params.cryptog).call()
    token.id = this.props.match.params.cryptog
    token.imageAscii = this.props.context.web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
    let totalSupply = await this.props.context.contracts['Cryptogs'].methods.totalSupply().call()
    this.setState({tokenData:token,hasLoadedFirst:true,totalSupply:totalSupply})
  }
  sendCryptog(){
		console.log("sendCryptog",this.state.tokenData.id,this.state.address)
		const { account,contracts,showLoadingScreen } = this.props
    console.log("CONTRACTS",contracts)


		contracts["Cryptogs"].methods.transfer(this.state.address,this.state.tokenData.id).send({
        from: account,
        gas:100000,
        gasPrice:this.context.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
				showLoadingScreen(hash)
				txhash=hash
      }).on('error',(a,b)=>{
				console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
			}).then((receipt)=>{
				console.log("RESULT:",receipt)
				showLoadingScreen(false)
				this.findSubmitStackAndGo()
      }).catch(e=> {
          console.error('caught error', e);
      })
	}
  change(e){
    this.setState({address:e.target.value})
  }
  render(){
    let {account} = this.props
    let {hasLoadedFirst,tokenData,hovers} = this.state
    if(!tokenData){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={"unicorn.png"}/></div>
      )
    }
    if(!hasLoadedFirst){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={"unicorn.png"}/></div>
      )
    }

    let transferDisplay = ""
    if(account && account.toLowerCase()==this.state.tokenData.owner.toLowerCase()){
      transferDisplay = (
        <div style={{backgroundColor:"#efefef",border:"1px solid #dfdfdf",padding:50}}>
          Transfer Cryptog #{this.state.tokenData.id} to address: <input onChange={this.change.bind(this)} value={this.state.address} type="text" style={{padding:3,width:400,margin:5}}/>
          <span style={{padding:20}}>
          <MMButton color={"#6081c3"} onClick={this.sendCryptog.bind(this)}>Send</MMButton>
          </span>
        </div>
      )
    }



    return (
      <div>

        <div style={{float:'right',marginTop:30}}><
          Blockies
            seed={this.state.tokenData.owner.toLowerCase()}
            scale={10}
          />
        </div>
        <div style={{padding:50}}>
          <Cryptog scale={1.2} image={this.state.tokenData.imageAscii}/>
          <div style={{marginTop:50}}>
            Artist: {Artist(this.state.tokenData.imageAscii)}
          </div>
          <div style={{marginTop:10}}>
            Copies: {this.state.tokenData.copies} <div>(Prevalence: {this.state.tokenData.copies/this.state.totalSupply})</div>
          </div>
        </div>

        {transferDisplay}

      </div>
    )
  }
}
export default CryptogStack;

/*
<span style={{verticalAlign:'middle'}}>
<Blockies
  seed={this.props.match.params.address.toLowerCase()}
  scale={4}
/>
</span>
<span style={{fontSize:20,paddingLeft:5}}>{this.props.match.params.address}</span>
*/
