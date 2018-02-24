import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import Cryptog from '../components/Cryptog.js'
import StackGrid from 'react-stack-grid'
let loadInterval

class AddressStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenData:[]
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
    this.setState({tokenData:tokens})
  }
  render(){
    let {tokenData} = this.state
    if(!tokenData){
      return (
        <div style={{opacity:0.3}}>Loading...</div>
      )
    }

		let tokenDisplay = tokenData.map((token)=>{
			return <Cryptog key={"cryptog"+token.id} id={token.id} image={token.image}/>
		})
    return (
      <div>
        <div style={{float:'right',marginTop:-20}}>({tokenData.length})</div>
        <StackGrid
          style={{marginTop:50}}
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
