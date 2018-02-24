import React from 'react'
import createClass from 'create-react-class'
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types'
import Stack from '../components/Stack.js'
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';

let loadInterval
export default createClass({
	displayName: 'StacksPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		blockNumber: PropTypes.number,
	},
	getInitialState(){
		return {allStacks:[]}
	},
	componentDidMount(){
		this.loadStackData()
		loadInterval = setInterval(this.loadStackData,101)
	},
	componentWillUnmount(){
		clearInterval(loadInterval)
	},
	async loadStackData(){
		let {contracts,web3,blockNumber} = this.context
		if(!contracts || !contracts["Cryptogs"] || !blockNumber){
			console.log("Waiting for contracts...")
		}else{
			let updateAllStacks = async (update)=>{
				let id = update._stack
				if(id && !this.state.allStacks[id]){
					this.state.allStacks[id]=update;
					console.log("UPDATE allStacks ",this.state.allStacks)
					for(let t=1;t<=5;t++){
						let token = await contracts['Cryptogs'].methods.getToken(this.state.allStacks[id]["_token"+t]).call()//this.state.allStacks[id]
						this.state.allStacks[id]["_token"+t+"Image"] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
					}
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"SubmitStack",contracts["Cryptogs"].blockNumber,blockNumber,updateAllStacks);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"SubmitStack",blockNumber,updateAllStacks)
			},731)


			//event AcceptCounterStack(address indexed _sender,bytes32 indexed _stack, bytes32 indexed _counterStack);
			let updateAcceptCounterStack = async (update)=>{
				let id = update._stack
				let counterStack = update._counterStack
				if(this.state.allStacks[id]&&!this.state.allStacks[id].counterStack){
					this.state.allStacks[id].counterStack = counterStack
					this.state.allStacks[id].otherPlayer = await contracts['Cryptogs'].methods.stackOwner(counterStack).call()
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"AcceptCounterStack",contracts["Cryptogs"].blockNumber,blockNumber,updateAcceptCounterStack);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"AcceptCounterStack",blockNumber,updateAcceptCounterStack)
			},731)


			let updateFinishGame = async (update)=>{
				let id = update.stack
				if(this.state.allStacks[id]&&!this.state.allStacks[id].finished){
					this.state.allStacks[id].finished=true
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"FinishGame",contracts["Cryptogs"].blockNumber,blockNumber,updateFinishGame);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"FinishGame",blockNumber,updateAllStacks)
			},731)

			clearInterval(loadInterval)
		}
	},
	render(){
		const { contracts,account } = this.context
		if(!contracts.Cryptogs){
			return (
				<div style={{opacity:0.3}}>Loading...</div>
			)
		}
		const {allStacks} = this.state

		let myStacks = []
		let stacks = []
		let liveStacks = []
		let finishedStacks = []


		for(let s in allStacks){
			if(allStacks[s].finished){
				finishedStacks.push(
					<Stack key={"mystack"+s} {...allStacks[s]} callToAction={
						<a href={"/play/"+s}>view</a>
					}/>
				)
			}else if(allStacks[s]._sender.toLowerCase() == account.toLowerCase()){
				myStacks.push(
					<Stack key={"mystack"+s} {...allStacks[s]} callToAction={
						<a href={"/play/"+s}>play</a>
					}/>
				)
			}else if(allStacks[s].otherPlayer){
				if(allStacks[s].otherPlayer.toLowerCase() == account.toLowerCase()){
					myStacks.push(
						<Stack key={"mystack"+s} {...allStacks[s]} callToAction={
							<a href={"/play/"+s}>play</a>
						}/>
					)
				}else{
					liveStacks.push(
						<Stack key={"mystack"+s} {...allStacks[s]} callToAction={
							<a href={"/play/"+s}>play</a>
						}/>
					)
				}
			}else{
				stacks.push(
					<Stack key={"stack"+s} {...allStacks[s]} callToAction={
						<a href={"/join/"+s}>join</a>
					}/>
				)
			}
		}

		let sectionStyle = {borderTop:'1px solid #dddddd',padding:10,marginTop:40,opacity:0.4}

		return (
      <div>
				<div><a href="/create">Create a game</a></div>
				<div style={sectionStyle}>Your Games:</div>
				<div>{myStacks}</div>
				<div style={sectionStyle}>Open Games:</div>
				<div>{stacks}</div>
				<div style={sectionStyle}>Live Games:</div>
				<div>{liveStacks}</div>
				<div style={sectionStyle}>Finished Games:</div>
				<div>{finishedStacks}</div>
      </div>
    )
	}
});
//
