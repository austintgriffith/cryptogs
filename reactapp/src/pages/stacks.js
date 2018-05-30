import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';
import MMButton from '../components/MMButton.js'
import SimpleStack from '../components/SimpleStack.js'
import PogAnimation from '../components/PogAnimation'
import Online from '../components/Online'

import axios from 'axios'

const DEBUG = false;
const BLOCKLOOKBACK = 240*24*4; //show the last 4 days

let mountTime = Date.now()

let loadInterval
export default createClass({
	displayName: 'StacksPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		network: PropTypes.number,
		blockNumber: PropTypes.number,
		metaMaskHintFn: PropTypes.func,
		api: PropTypes.object,
	},
	getInitialState(){
		return {allStacks:[],extraMessage:"",extraMessageLink:""}
	},
	componentDidMount(){
		mountTime = Date.now()
		loadInterval = setInterval(this.loadStackData,1003)
		setTimeout(()=>{
			console.log("Checking for connection...")
			let {contracts,web3,blockNumber,account,network} = this.context
			if(!account || !network || !contracts || !contracts["Cryptogs"] || !blockNumber){
				console.log("No connection, throw metamask message up...")
				if(window.mobileAndTabletcheck()){
					this.setState({extraMessage:"Install Web3 to play.",extraMessageLink:"https://cryptogs.io/web3"})
				}else{
					this.setState({extraMessage:"Unlock MetaMask to play.",extraMessageLink:"https://metamask.io/"})
				}

			}
		},5000)
	},
	componentWillUnmount(){
		clearInterval(loadInterval)
	},
	async loadStackData(){
		let {contracts,web3,blockNumber,account,network} = this.context
		if(!network || !contracts || !contracts["Cryptogs"] || !blockNumber){
			console.log("WAITING",network,blockNumber)
			return (
				<div>
					<div style={{opacity:0.3}}><PogAnimation loader={true} image={'dragon.png'} /></div>
					<div style={{fontSize:20,width:"100%",textAlign:"center"}}><a href={this.state.extraMessageLink}>{this.state.extraMessage}</a></div>
				</div>
			)
		}else{

			if(this.context.api&&this.context.api.version){




				let updateGenerateGame= async (update)=>{
					//console.log("updateGenerateGame",update)
					let id = update._commit
					//console.log("checking current value ",id,this.state.allStacks[id],this.state.allStacks[id]==true)
					if(!this.state.allStacks[id]) this.state.allStacks[id]={};
					if(!this.state.allStacks[id].finished) this.state.allStacks[id].finished=true;
					this.setState({allStacks:this.state.allStacks});
				}
				EventParser(contracts["PizzaParlor"],"GenerateGame",blockNumber-BLOCKLOOKBACK,blockNumber,updateGenerateGame);
				setInterval(()=>{
					LiveParser(contracts["PizzaParlor"],"GenerateGame",blockNumber,updateGenerateGame)
				},997)

				EventParser(contracts["PizzaParlor"],"DrainGame",blockNumber-BLOCKLOOKBACK,blockNumber,updateGenerateGame);
				setInterval(()=>{
					LiveParser(contracts["PizzaParlor"],"DrainGame",blockNumber,updateGenerateGame)
				},997)

				setInterval(()=>{
						//console.log("Connecting to API...")
						try{
							axios.get(this.context.api.host+"/commits/")
							.then((response)=>{
								let commits = response.data
								//console.log("COMMITS BACK FROM API");
								for(let c in commits){
									let commitId = commits[c].replace("commit_","")
									//console.log("CHECKING",this.state.allStacks[commitId])
									if(!this.state.allStacks[commitId]||!this.state.allStacks[commitId]._sender||!this.state.allStacks[commitId].otherPlayer){
										//console.log("DOING GET")
										axios.get(this.context.api.host+"/commit/"+commitId)
										.then((commitData)=>{
											//console.log("commitData for "+commitId,commitData.data)
											let stackObject = {
												_public: true,
												_sender: commitData.data.stackData.owner,
												_stack: commitId,
												_token1: commitData.data.stackData.token1,
												_token1Image: commitData.data.stackData.token1Image,
												_token2: commitData.data.stackData.token2,
												_token2Image: commitData.data.stackData.token2Image,
												_token3: commitData.data.stackData.token3,
												_token3Image: commitData.data.stackData.token3Image,
												_token4: commitData.data.stackData.token4,
												_token4Image: commitData.data.stackData.token4Image,
												_token5: commitData.data.stackData.token5,
												_token5Image: commitData.data.stackData.token5Image,
												_blockNumber: commitData.data.stackData.block,
												timestamp: Date.now(),
												senders: [],
											}
											for(let c in commitData.data.counterStacks){
												stackObject.senders.push(commitData.data.counterStacks[c].owner)
											}
											stackObject.canceledSenders = commitData.data.canceledSenders

											if(commitData.data._counterStack){
												for(let c in commitData.data.counterStacks){
													if(commitData.data._counterStack==commitData.data.counterStacks[c]._counterStack){
														stackObject.otherPlayer = commitData.data.counterStacks[c].owner
													}
												}
											}

											if(this.state.allStacks[commitId] && this.state.allStacks[commitId]._sender && !stackObject.otherPlayer){
												//skip update?
											}else{
												console.log("Saving stack object",stackObject)
												if(!this.state.allStacks[commitId]) this.state.allStacks[commitId]={}

												this.state.allStacks[commitId] = Object.assign(this.state.allStacks[commitId],stackObject)
												this.setState({allStacks:this.state.allStacks})
											}



										})
									}
								}
							})
						} catch(e) {
							console.log(e)
						}
				},3001)

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
				EventParser(contracts["Cryptogs"],"SubmitStack",blockNumber-BLOCKLOOKBACK,blockNumber,updateAllStacks);
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
				EventParser(contracts["Cryptogs"],"CounterStack",blockNumber-BLOCKLOOKBACK,blockNumber,updateCounterStack);
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
				EventParser(contracts["Cryptogs"],"AcceptCounterStack",blockNumber-BLOCKLOOKBACK,blockNumber,updateAcceptCounterStack);
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
				EventParser(contracts["Cryptogs"],"CancelStack",blockNumber-BLOCKLOOKBACK,blockNumber,updateCancelStack);
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
				EventParser(contracts["Cryptogs"],"CancelCounterStack",blockNumber-BLOCKLOOKBACK,blockNumber,updateCancelCounterStack);
				setInterval(()=>{
					LiveParser(contracts["Cryptogs"],"CancelCounterStack",blockNumber,updateCancelCounterStack)
				},997)

			}

			clearInterval(loadInterval)
		}
	},
	render(){
		const { contracts,account,metaMaskHintFn,api } = this.context
		if(!contracts.Cryptogs){
			return (
				<div>
					<div style={{opacity:0.3}}><PogAnimation loader={true} image={'dragon.png'} /></div>
					<div style={{fontSize:20,width:"100%",textAlign:"center"}}><a href={this.state.extraMessageLink}>{this.state.extraMessage}</a></div>
				</div>
			)
		}
		const {allStacks} = this.state

		//console.log("allStacks",allStacks)

		let myStacks = []
		let stacks = []
		let liveStacks = []
		let finishedStacks = []

		let simpleArray = []
		let count = 0
		for(let s in allStacks){
			simpleArray.push(allStacks[s])
		}
		let allStacksFlipped = simpleArray.sort(function(a, b) {
        return a.timestamp<b.timestamp
    });
		for(let s in allStacksFlipped){
			//console.log("STACK:",allStacksFlipped[s])
			if(allStacksFlipped[s].finished){
				if(allStacksFlipped[s]._sender && finishedStacks.length<5){
					count++
					finishedStacks.push(
						<div key={"mystack4"+s} style={{position:"relative"}}>

							<SimpleStack showBlockie={true} padding={300} scale={0.95} spacing={130} height={180}  {...allStacksFlipped[s]} 	/>

							<div style={{position:"absolute",right:0,top:50}}>
								<MMButton color={"#f7861c"} onClick={()=>{
									if(account){
										window.location="/play/"+allStacksFlipped[s]._stack
									}else{
										metaMaskHintFn()
									}
								}}>view</MMButton>
							</div>

						</div>
					)
				}

			}else if(account &&
				(!allStacksFlipped[s].canceled) &&
				 (!allStacksFlipped[s].finished) &&
					(
						(allStacksFlipped[s]._sender && allStacksFlipped[s]._sender.toLowerCase() == account.toLowerCase()) ||
						(
							(allStacksFlipped[s].senders && allStacksFlipped[s].senders.indexOf(account.toLowerCase())>=0) &&
							(!allStacksFlipped[s].canceledSenders || allStacksFlipped[s].canceledSenders.indexOf(account.toLowerCase())<0)
						)
					)
				){
				//	console.log("allStacksFlipped[s]",allStacksFlipped[s])
				//console.log("FINISHED?",allStacksFlipped[s].finished)
				if(allStacksFlipped[s]._stack){
					count++
					myStacks.push(
						<div key={"mystack"+s} style={{position:"relative"}}>

							<SimpleStack  showBlockie={true} padding={350} scale={0.95} spacing={130} height={180}  {...allStacksFlipped[s]} 	/>

							<div style={{position:"absolute",right:0,top:50}}>
								<MMButton color={"#6ac360"} onClick={()=>{
									if(account){
										window.location="/play/"+allStacksFlipped[s]._stack
									}else{
										metaMaskHintFn()
									}
								}}>view</MMButton>
							</div>

						</div>
					)
				}

			}else if(account && (allStacksFlipped[s].otherPlayer || allStacksFlipped[s]._counterStack) && !allStacksFlipped[s].canceled&& !allStacksFlipped[s].canceled &&
					(
						!allStacksFlipped[s].canceledSenders ||
						allStacksFlipped[s].canceledSenders.indexOf(account.toLowerCase()) < 0
					)
				){
				if(allStacksFlipped[s].otherPlayer.toLowerCase() == account.toLowerCase()){
					console.log("allStacksFlipped[s].canceledSenders",allStacksFlipped[s].canceledSenders)
					count++
					myStacks.push(
						<div key={"mystack2"+s} style={{position:"relative"}}>
							<SimpleStack showBlockie={true} padding={350} scale={0.95} spacing={130} height={180}  {...allStacksFlipped[s]} 	/>
							<div style={{position:"absolute",right:0,top:50}}>
							<MMButton color={"#6ac360"} onClick={()=>{
								if(account){
									window.location="/play/"+allStacksFlipped[s]._stack
								}else{
									metaMaskHintFn()
								}
							}}>play</MMButton>
							</div>

						</div>
					)
				}else{
					count++
					liveStacks.push(
						<div key={"mystack1"+s} style={{position:"relative"}}>
							<SimpleStack showBlockie={true} padding={350} scale={0.95} spacing={130} height={180}  {...allStacksFlipped[s]} 	/>
							<div style={{position:"absolute",right:0,top:50}}>
							<MMButton color={"#f7861c"} onClick={()=>{
								if(account){
									window.location="/play/"+allStacksFlipped[s]._stack
								}else{
									metaMaskHintFn()
								}
							}}>view</MMButton>
							</div>

						</div>
					)
				}
			}else if(allStacksFlipped[s].timestamp && (!allStacksFlipped[s].canceled) ){
				count++
				stacks.push(
					<div key={"mystack3"+s} style={{position:"relative"}}>
						<SimpleStack showBlockie={true} padding={350} scale={0.95} spacing={130} height={180}  {...allStacksFlipped[s]} 	/>
						<div style={{position:"absolute",right:0,top:50}}>
						<MMButton color={"#6081c3"} onClick={()=>{
							if(account){
								window.location="/join/"+allStacksFlipped[s]._stack
							}else{
								metaMaskHintFn()
							}
						}}>Join</MMButton>
						</div>
					</div>
				)
			}
		}

		let sectionStyle = {borderTop:'1px solid #dddddd',padding:10,marginTop:40,opacity:0.4}

		count++
		let bottomRender = (
			<div>
				<div style={{opacity:0.3}}><PogAnimation loader={true} image={'dragon.png'} /></div>
				<div style={{fontSize:20,width:"100%",textAlign:"center"}}>{this.state.extraMessage}</div>
			</div>
		)
		if(count>1 || mountTime<Date.now()-3000){
			bottomRender = (
				<div>
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

		let qrdisplay = ""
		if(window.web3 && window.web3.currentProvider && window.web3.currentProvider.scanQRCode){
			qrdisplay = (
				<img src="/qr.png" style={{width:40,height:40}} onClick={()=>{
					window.web3.currentProvider.scanQRCode((/^http.+$/))
				  .then(data => {
				    console.log('QR Scanned:', data)
						window.location = data
				  })
				  .catch(err => {
				    console.log('Error:', err)
				  })
				}}/>
			)
		}

		return (
      <div style={{margin: '0 auto',maxWidth: 960,padding: '0px 1.0875rem 1.45rem',paddingTop: 0}}>
				<div style={{position:'absolute',right:10,top:246}}>
					{qrdisplay}
				</div>
				<div style={{float:'right',padding:30,paddingRight:100}}>
					<MMButton color={"#6ac360"} onClick={()=>{
						if(account){
							window.location = "/create"
						}else{
							metaMaskHintFn()
						}
					}}>Create Game</MMButton>
				</div>
				<Online account={account} api={api}/>
				<div style={{float:'left',padding:30,paddingRLeft:100}}>
				</div>
				<div style={{ clear:"both"}}></div>
				{bottomRender}
      </div>
    )
	}
});
window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
