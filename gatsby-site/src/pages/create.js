import React from 'react'
import createClass from 'create-react-class'
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types'
import StackSelect from '../components/StackSelect.js'

const GWEI = 1

let syncInterval
export default createClass({
	displayName: 'CreatePage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
	},
	getInitialState(){
		return {
			selectedTokens:[],
			loading:false
		}
	},
	submitStack(tokens){
		console.log("GO tokens",tokens)

		const { account,contracts } = this.context
		let finalArray = []
		for(let id in tokens){
			if(tokens[id]){
				finalArray.push(id)
			}
		}

		console.log("GO",finalArray)
		//submitStack(address _slammerTime, uint256 _id,uint256 _id2,uint256 _id3,uint256 _id4,uint256 _id5, bool _public)
		contracts["Cryptogs"].methods.submitStack(contracts["SlammerTime"]._address,finalArray[0],finalArray[1],finalArray[2],finalArray[3],finalArray[4],true).send({
        from: account,
        gas:350000,
        gasPrice:GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
				this.findSubmitStackAndGo()
      })
	},
	async findSubmitStackAndGo(){
		const { account,contracts } = this.context
		let submitStackEvents = await contracts['Cryptogs'].getPastEvents("SubmitStack", {
			filter: {_sender: account},
			fromBlock: contracts['Cryptogs'].blockNumber,
			toBlock: 'latest'
		});
		let mostRecentStack = ""
		let mostRecentStackTimestamp = 0
		for(let e in submitStackEvents){
			if(submitStackEvents[e].returnValues.timestamp > mostRecentStackTimestamp){
				mostRecentStackTimestamp = submitStackEvents[e].returnValues.timestamp
				mostRecentStack = submitStackEvents[e].returnValues._stack
			}
		}
		window.location = "/play/"+mostRecentStack
	},
	render(){
		if(this.state.loading){
			return (
	      <div style={{opacity:0.3}}>
					Waiting for trasaction to go through.........
	      </div>
	    )
		}
		return (
      <div>
				<StackSelect message={"Select 5 tokens to open a new game."} myTokens={this.context.myTokens} goFn={this.submitStack} />
      </div>
    )
	}
});
//
