import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import StackSelect from '../components/StackSelect.js'
import MMButton from '../components/MMButton.js'
import SigLoader from '../modules/sigLoader.js'

import axios from 'axios'

let txhash

let syncInterval
export default createClass({
	displayName: 'CreatePage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		showLoadingScreen: PropTypes.func,
		throwAlert: PropTypes.func,
		GWEI: PropTypes.number,
		api: PropTypes.object,
	},
	getInitialState(){
		return {
			selectedTokens:[],
			loading:false
		}
	},
	async submitStack(tokens){
		console.log("GO tokens",tokens)

		const { account,contracts,showLoadingScreen,api,web3 } = this.context
		let finalArray = []
		for(let id in tokens){
			if(tokens[id]){
				finalArray.push(id)
			}
		}

		console.log("GO",finalArray)
		if(api&&api.version){
			//let sig = await SigLoader(account,web3)
			//if(!sig) alert("Failed to sign. Please try again.")
			//else{
				console.log("USING API")//,sig)
				axios.post(api.host+'/create', {
					account: account,
			    finalArray: finalArray,
					//sig: sig
			  })
			  .then(function (response) {
					console.log(response)
			    console.log("APIDATA",response.data);
					if(response && response.data && response.data.commit) window.location = "/play/"+response.data.commit
			  })
			  .catch(function (error) {
			    console.log(error);
			  });
			//}


		}else{
			console.log("USING CONTRACT")
			//submitStack(address _slammerTime, uint256 _id,uint256 _id2,uint256 _id3,uint256 _id4,uint256 _id5, bool _public)
			contracts["Cryptogs"].methods.submitStack(finalArray[0],finalArray[1],finalArray[2],finalArray[3],finalArray[4],true).send({
	        from: account,
	        gas:350000,
	        gasPrice:this.context.GWEI * 1000000000
	      },(error,hash)=>{
	        console.log("CALLBACK!",error,hash)
					showLoadingScreen(hash,this.findSubmitStackAndGo)
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
		if(mostRecentStack) window.location = "/play/"+mostRecentStack
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
      <div style={{margin: '0 auto',maxWidth: 960,padding: '0px 1.0875rem 1.45rem',paddingTop: 0}}>
				<StackSelect message={"Select 5 tokens to risk against a challanger:"} myTokens={this.context.myTokens} goFn={this.submitStack} />
      </div>
    )
	}
});
