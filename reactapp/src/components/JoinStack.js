import React, { Component } from 'react';
import Stack from '../components/Stack.js'
import StackSelect from '../components/StackSelect.js'
import MMButton from '../components/MMButton.js'
import PogAnimation from '../components/PogAnimation'

let waitInterval
let txhash

class JoinStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stack:this.props.match.params.stack
    }
    this.loadStackData()
  }
  async loadStackData(){
    let stack
    let stackData = await this.props.context.contracts['Cryptogs'].methods.getStack(this.state.stack).call()
    for(let t=1;t<=5;t++){

      let token = await this.props.context.contracts['Cryptogs'].methods.getToken(stackData["token"+t]).call()
      stackData["token"+t+"Image"] = this.props.context.web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
    }
    this.setState({stackData:stackData})
  }
  joinStack(tokens){
		const { account,contracts,showLoadingScreen } = this.props.context
    const { stack } = this.state

		let finalArray = []
		for(let id in tokens){
			if(tokens[id]){
				finalArray.push(id)
			}
		}

		console.log("submitCounterStack as "+account,finalArray)
		//submitCounterStack(address _slammerTime, bytes32 _stack, uint256 _id, uint256 _id2, uint256 _id3, uint256 _id4, uint256 _id5)
		contracts["Cryptogs"].methods.submitCounterStack(contracts["SlammerTime"]._address,stack,finalArray[0],finalArray[1],finalArray[2],finalArray[3],finalArray[4]).send({
        from: account,
        gas:350000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{

				console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
				this.props.throwAlert(
					<div>
						<span>Warning: Your transation is not yet mined into the blockchain. Increase your gas price and try again or </span>
						<a href={this.context.etherscan+"tx/"+txhash} target='_blank'>{"wait for it to finish"}</a>.
						<div style={{position:"absolute",right:20,bottom:20}}>
							<MMButton color={"#6081c3"} onClick={()=>{
								this.props.throwAlert(false);
								window.location = "/play/"+stack
							}}>continue and wait</MMButton>
						</div>
						<div style={{position:"absolute",left:20,bottom:20}}>
							<MMButton color={"#f7861c"} onClick={()=>{
								this.props.throwAlert(false);
							}}>close and try again</MMButton>
						</div>
					</div>
				)

      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        window.location = "/play/"+stack
        showLoadingScreen(false)
      })
	}
  render(){
    if(!this.state.stackData){
      return (
        <div style={{opacity:0.3}}><PogAnimation image={'awyinandyang.jpg'} /></div>
      )
    }
    return (
      <div>
        <div style={{opacity:0.7}}>
          <Stack {...this.state.stackData}/>
        </div>
        <StackSelect message={"Select five of your pogs to join existing game:"} myTokens={this.props.context.myTokens} goFn={this.joinStack.bind(this)} />
      </div>
    )
  }
}
export default JoinStack;

/*

const JoinStack = ({ match: { params } }) => (
  <div>
    {params.stack}
  </div>
)*/
