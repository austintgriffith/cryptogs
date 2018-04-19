import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import Cryptog from '../components/Cryptog.js'
import Spinner from '../components/Spinner.js'
import StackGrid from 'react-stack-grid'
import Blockies from 'react-blockies'
import MMButton from '../components/MMButton.js'
import PogAnimation from '../components/PogAnimation.js'
import axios from 'axios'
var QRCode = require('qrcode-react');

let loadInterval

class AddressStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenData:[],
      hovers:[],
      hasLoadedFirst:false
    }
    this.loadTokenData()
    setTimeout(this.loadTokenData.bind(this),701)
    loadInterval = setInterval(this.loadTokenData.bind(this),1577)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  componentDidMount(){
    setInterval(this.loadStats.bind(this),7377)
    setTimeout(this.loadStats.bind(this),500)
    setTimeout(this.loadStats.bind(this),1500)
    setTimeout(this.loadStats.bind(this),4500)
  }
  loadStats(){
    try{
      let {api} = this.props
      if(api&&api.host){
        axios.get(api.host+"/stats/"+this.props.match.params.address)
        .then((response)=>{
          this.setState({stats:response.data})
        })
      }
    }catch(e){
      console.log(e)
    }
  }
  async loadTokenData(){
    let tokenData = await this.props.context.contracts['Cryptogs'].methods.tokensOfOwner(this.props.match.params.address).call()
    let tokens = []
    for(let t in tokenData){
      let tokenObject = {id:tokenData[t]}
      let token = await this.props.context.contracts['Cryptogs'].methods.getToken(tokenObject.id).call()
      tokenObject.image = this.props.context.web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
      tokens.push(tokenObject)
    }
    this.setState({tokenData:tokens,hasLoadedFirst:true})
  }
  render(){
    let {hasLoadedFirst,tokenData,hovers} = this.state
    if(!tokenData){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={"ad8ball.png"}/></div>
      )
    }
    if(!hasLoadedFirst){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={"ad8ball.png"}/></div>
      )
    }

    let stackWidth = 85

		let tokenDisplay = tokenData.map((token)=>{
			return (
        <Spinner key={"cryptog"+token.id} guts={
          (spinning)=>{
            return (
              <Cryptog  id={token.id} scale={0.8} slowrolling={spinning} image={token.image} zIndex={1}/>
            )
          }
        } click={()=>{
          if(token.id>0){
            window.open("/cryptog/"+token.id);
          }
        }}/>
      )
		})

    let callToAction = ""
    let callToBuy = ""
    if(tokenData.length<=0){
      callToAction= (
        <div className={"centercontainer"}>
          <div style={{padding:40,marginBottom:60,opacity:0.3}}>
            <MMButton color={"#6081c3"} onClick={()=>{window.location="/create"}}>{"Play"}</MMButton>
          </div>
        </div>
      )
      callToBuy = (
        <div className={"centercontainer"}>
          <div style={{padding:40,marginBottom:60}}>
            <MMButton color={"#6ac360"} onClick={()=>{window.location="/buy"}}>{"Buy Togs"}</MMButton>
          </div>
        </div>
      )
    }else{
      callToAction = (
        <div className={"centercontainer"}>
          <div style={{padding:40,marginBottom:60}}>
            <MMButton color={"#6ac360"} onClick={()=>{window.location="/create"}}>{"Play"}</MMButton>
          </div>
        </div>
      )
    }

    let stats = ""
    let history = ""
    if(this.state.stats&&this.state.stats.gamesPlayed&&this.state.stats.gamesPlayed.length>0){
      stats = (
        <div style={{marginLeft:20}}>
            <div>Games Played: {this.state.stats.gamesPlayed.length}</div>
            <div>Togs Won: {this.state.stats.togsWon}</div>
            <div>Togs Lost: {this.state.stats.togsLost}</div>
        </div>
      )

      let games = this.state.stats.gamesPlayed.map((game)=>{
        return (
          <div>
            <a href={"/play/"+game}>{game}</a>
          </div>
        )
      })

      history = (
        <div style={{marginLeft:20,marginBottom:80,marginTop:40,fontSize:12}}>
          <h3>Game History:</h3>
          {games}
        </div>
      )
    }

    return (
      <div>
      <div style={{float:'left',marginTop:44,marginLeft:10}}>
        <span style={{verticalAlign:'middle'}}>
        <Blockies
          seed={this.props.match.params.address.toLowerCase()}
          scale={3}
        />
        </span>
        <span style={{fontSize:16,paddingLeft:5}}><a target="_blank" href={this.props.etherscan+"address/"+this.props.match.params.address}>{this.props.match.params.address.substr(0,16)}</a></span>
      </div>
      <div style={{float:'right',marginTop:-140,opacity:0.4}}>({tokenData.length})</div>
        {callToAction}
        {stats}
          <StackGrid
            style={{marginTop:20}}
            columnWidth={85}
          >
             {tokenDisplay}
          </StackGrid>
          {history}
        {callToBuy}
        <div className="row align-items-center" style={{marginTop:100,marginBottom:150}}>
          <div className="col-md-12">
            <div className={"centercontainer"} style={{marginTop:10}}>
              <QRCode value={this.props.match.params.address} size={320}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default AddressStack;

/*

const JoinStack = ({ match: { params } }) => (
  <div>
    {params.stack}
  </div>
)*/
