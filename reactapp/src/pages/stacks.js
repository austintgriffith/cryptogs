import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import Stack from '../components/Stack.js'
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';
import MMButton from '../components/MMButton.js'

const DEBUG = false;

let loadInterval
export default createClass({
	displayName: 'StacksPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		blockNumber: PropTypes.number,
		metaMaskHintFn: PropTypes.func
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
			if(DEBUG) console.log("Waiting for contracts...")
		}else{
			let updateAllStacks = async (update)=>{
				let id = update._stack
				if(id){
					if(!this.state.allStacks[id]) this.state.allStacks[id]={};
					if(!this.state.allStacks[id].timestamp){
						Object.assign(this.state.allStacks[id],update);
						if(DEBUG) console.log("UPDATE allStacks ",this.state.allStacks)
						for(let t=1;t<=5;t++){
							let token = await contracts['Cryptogs'].methods.getToken(this.state.allStacks[id]["_token"+t]).call()//this.state.allStacks[id]
							this.state.allStacks[id]["_token"+t+"Image"] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
						}
						this.setState({allStacks:this.state.allStacks});
					}
				}
			}
			EventParser(contracts["Cryptogs"],"SubmitStack",contracts["Cryptogs"].blockNumber,blockNumber,updateAllStacks);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"SubmitStack",blockNumber,updateAllStacks)
			},731)


			//event AcceptCounterStack(address indexed _sender,bytes32 indexed _stack, bytes32 indexed _counterStack);
			let updateCounterStack = async (update)=>{
				let id = update._stack;
				if(!this.state.allStacks[id]) this.state.allStacks[id]={};
				if(!this.state.allStacks[id].senders) this.state.allStacks[id].senders=[];
				if(update._sender && this.state.allStacks[id].senders.indexOf(update._sender.toLowerCase())<0){
					this.state.allStacks[id].senders.push(update._sender.toLowerCase())
					if(DEBUG) console.log("UPDATE WITH COUNTERSTACKS",this.state.allStacks)
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"CounterStack",contracts["Cryptogs"].blockNumber,blockNumber,updateCounterStack);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"CounterStack",blockNumber,updateCounterStack)
			},737)


			//event AcceptCounterStack(address indexed _sender,bytes32 indexed _stack, bytes32 indexed _counterStack);
			let updateAcceptCounterStack = async (update)=>{
				let id = update._stack
				let counterStack = update._counterStack
				if(!this.state.allStacks[id]) this.state.allStacks[id]={};
				if(!this.state.allStacks[id].counterStack){
					this.state.allStacks[id].counterStack = counterStack
					this.state.allStacks[id].otherPlayer = await contracts['Cryptogs'].methods.stackOwner(counterStack).call()
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"AcceptCounterStack",contracts["Cryptogs"].blockNumber,blockNumber,updateAcceptCounterStack);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"AcceptCounterStack",blockNumber,updateAcceptCounterStack)
			},751)


			let updateFinishGame = async (update)=>{
				let id = update.stack
				if(!this.state.allStacks[id]) this.state.allStacks[id]={};
				if(!this.state.allStacks[id].finished){
					if(DEBUG) console.log("STACK",id,"IS FINISHED")
					this.state.allStacks[id].finished=true
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"FinishGame",contracts["Cryptogs"].blockNumber,blockNumber,updateFinishGame);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"FinishGame",blockNumber,updateAllStacks)
			},791)


			//CancelStack(address indexed _sender,uint256 indexed timestamp,bytes32 indexed _stack);
			let updateCancelStack = async (update)=>{
				let id = update._stack
				if(!this.state.allStacks[id]) this.state.allStacks[id]={};
				if(!this.state.allStacks[id].canceled){
					if(DEBUG) console.log("STACK",id,"IS CANCELED")
					this.state.allStacks[id].canceled=true
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"CancelStack",contracts["Cryptogs"].blockNumber,blockNumber,updateCancelStack);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"CancelStack",blockNumber,updateCancelStack)
			},991)

			let updateCancelCounterStack = async (update)=>{
				let id = update._stack
				if(!this.state.allStacks[id]) this.state.allStacks[id]={};
				if(!this.state.allStacks[id].canceledSenders) this.state.allStacks[id].canceledSenders=[];
				if(this.state.allStacks[id].canceledSenders.indexOf(update._sender.toLowerCase())<0){
					if(DEBUG) console.log("COUNTER STACK OWNER ",update._sende,"CANCELED")
					this.state.allStacks[id].canceledSenders.push(update._sender.toLowerCase())
					this.setState({allStacks:this.state.allStacks});
				}
			}
			EventParser(contracts["Cryptogs"],"CancelCounterStack",contracts["Cryptogs"].blockNumber,blockNumber,updateCancelCounterStack);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"CancelCounterStack",blockNumber,updateCancelCounterStack)
			},997)

			clearInterval(loadInterval)
		}
	},
	render(){
		const { contracts,account,metaMaskHintFn } = this.context
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

		let simpleArray = []
		for(let s in allStacks){
			simpleArray.push(allStacks[s])
		}
		let allStacksFlipped = simpleArray.sort(function(a, b) {
        return a.timestamp<b.timestamp
    });
		for(let s in allStacksFlipped){
			if(allStacksFlipped[s].finished&&allStacksFlipped[s]._sender){
				if(finishedStacks.length<5){
					finishedStacks.push(
						<Stack key={"mystack"+s} {...allStacksFlipped[s]} callToAction={

							<div  style={{marginTop:20,marginLeft:30}}>
								<MMButton color={"#6081c3"} onClick={()=>{
									if(account){
										window.location="/play/"+allStacksFlipped[s]._stack
									}else{
										metaMaskHintFn()
									}
								}}>view</MMButton>
							</div>

						}/>
					)
				}

			}else if(account &&
				(!allStacksFlipped[s].canceled) &&
					(
						(allStacksFlipped[s]._sender && allStacksFlipped[s]._sender.toLowerCase() == account.toLowerCase()) ||
						(
							(allStacksFlipped[s].senders && allStacksFlipped[s].senders.indexOf(account.toLowerCase())>=0) &&
							(!allStacksFlipped[s].canceledSenders || allStacksFlipped[s].canceledSenders.indexOf(account.toLowerCase())<0)
						)
					)
				){
					console.log("allStacksFlipped[s].canceledSenders",allStacksFlipped[s].canceledSenders)
				myStacks.push(
					<Stack key={"mystack"+s} {...allStacksFlipped[s]} callToAction={
						<div  style={{marginTop:20,marginLeft:30}}>
							<MMButton color={"#6081c3"} onClick={()=>{
								if(account){
									window.location="/play/"+allStacksFlipped[s]._stack
								}else{
									metaMaskHintFn()
								}
							}}>view</MMButton>
						</div>
					}/>
				)
			}else if(allStacksFlipped[s].otherPlayer && !allStacksFlipped[s].canceled &&
					(
						!allStacksFlipped[s].canceledSenders ||
						allStacksFlipped[s].canceledSenders.indexOf(account.toLowerCase()) < 0
					)
				){
				if(allStacksFlipped[s].otherPlayer.toLowerCase() == account.toLowerCase()){
					console.log("allStacksFlipped[s].canceledSenders",allStacksFlipped[s].canceledSenders)
					myStacks.push(
						<Stack key={"mystack"+s} {...allStacksFlipped[s]} callToAction={
							<div style={{marginTop:20,marginLeft:30}}>
								<MMButton color={"#6081c3"} onClick={()=>{
									if(account){
										window.location="/play/"+allStacksFlipped[s]._stack
									}else{
										metaMaskHintFn()
									}
								}}>play</MMButton>
							</div>
						}/>
					)
				}else{
					liveStacks.push(
						<Stack key={"mystack"+s} {...allStacksFlipped[s]} callToAction={
							<div  style={{marginTop:20,marginLeft:20}}>
								<MMButton color={"#6081c3"} onClick={()=>{
									if(account){
										window.location="/play/"+allStacksFlipped[s]._stack
									}else{
										metaMaskHintFn()
									}
								}}>view</MMButton>
							</div>
						}/>
					)
				}
			}else if(allStacksFlipped[s].timestamp && (!allStacksFlipped[s].canceled) ){
				stacks.push(
					<Stack key={"stack"+s} {...allStacksFlipped[s]} callToAction={
						<div style={{marginTop:16,marginLeft:30}}>
							<MMButton color={"#6081c3"} onClick={()=>{
								if(account){
									window.location="/join/"+allStacksFlipped[s]._stack
								}else{
									metaMaskHintFn()
								}
							}}>Join</MMButton>
						</div>
					}/>
				)
			}
		}

		let sectionStyle = {borderTop:'1px solid #dddddd',padding:10,marginTop:40,opacity:0.4}

		return (
      <div>
				<div style={{float:'right',padding:30,paddingRight:100}}>
					<MMButton color={"#6ac360"} onClick={()=>{
						if(account){
							window.location = "/create"
						}else{
							metaMaskHintFn()
						}
					}}>Create Game</MMButton>
				</div>
				<div style={{ clear:"both"}}></div>
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
