import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import Cryptog from '../components/Cryptog.js'
import Spinner from '../components/Spinner.js'
import StackGrid from 'react-stack-grid'
import Blockies from 'react-blockies'
let loadInterval

class AddressStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenData:[],
      hovers:[]
    }
    this.loadTokenData()
    loadInterval = setInterval(this.loadTokenData.bind(this),701)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  async loadTokenData(){
    console.log("Loading token data")
    let tokenData = await this.props.context.contracts['Cryptogs'].methods.tokensOfOwner(this.props.match.params.address).call()
    let tokens = []
    for(let t in tokenData){
      let tokenObject = {id:tokenData[t]}
      let token = await this.props.context.contracts['Cryptogs'].methods.getToken(tokenObject.id).call()
      tokenObject.image = this.props.context.web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
      tokens.push(tokenObject)
    }
    console.log("token data loaded...")
    this.setState({tokenData:tokens})
  }
  render(){
    let {tokenData,hovers} = this.state
    if(!tokenData){
      return (
        <div style={{opacity:0.3}}>Loading...</div>
      )
    }

		let tokenDisplay = tokenData.map((token)=>{
			return (
        <Spinner guts={
          (spinning)=>{
            return (
              <Cryptog key={"cryptog"+token.id} id={token.id} slowrolling={spinning} image={token.image} zIndex={1}/>
            )
          }
        }/>
      )
		})

    return (
      <div>

        <div style={{float:'left',marginTop:-40}}>
          <span style={{verticalAlign:'middle'}}>
          <Blockies
            seed={this.props.match.params.address.toLowerCase()}
            scale={4}
          />
          </span>
          <span style={{fontSize:20,paddingLeft:5}}>{this.props.match.params.address}</span>
        </div>
        <div style={{float:'right',marginTop:-40}}>({tokenData.length})</div>
        <StackGrid
          style={{marginTop:90}}
          columnWidth={110}
        >
           {tokenDisplay}
        </StackGrid>
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
