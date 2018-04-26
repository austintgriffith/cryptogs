import React from 'react'
import { createElement } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from "react-router-dom";
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Header from './components/Header.js'
import 'regenerator-runtime/runtime';
import ContractLoader from './modules/contractLoader.js';
import TokenLoader from './modules/tokenLoader.js';
import ShallowEqualsById from './modules/shallowEqualsById.js';
import IndexPage from './pages/index.js'
import AddressPage from './pages/address.js'
import StacksPage from './pages/stacks.js'
import Web3Page from './pages/web3.js'
import ArtistsPage from './pages/artists.js'
import ArtPage from './pages/art.js'
import CreatePage from './pages/create.js'
import ContractsPage from './pages/contracts.js'
import PlayPage from './pages/play.js'
import BuyPage from './pages/buy.js'
import JoinPage from './pages/join.js'
import CryptogPage from './pages/cryptog.js'
import FourOhFourPage from './pages/404.js'
import Loader from './components/Loader.js'
import Slack from './components/Slack.js'
import Alert from './components/Alert.js'
import GasSlider from './components/GasSlider.js'
import MMButton from './components/MMButton.js'
import cookie from 'react-cookies'
import axios from 'axios'
import PogAnimation from './components/PogAnimation'
import {Motion, spring, presets} from 'react-motion';

let OPTIONALBACKENDPORT = "8001"

const DEBUG = false
const MAINNETGWEI = 5
const MAINNETMAXGWEI = 8
const MAINNETMINGWEI = 0.1
const STARTINGGWEI = 21
const STARTINGMAXGWEI = 51
const STARTINGMINGWEI = 5

var Web3 = require('web3')
let contractLoadingInterval
let webWaitInterval
let waitForWeb3Interval

export default createClass({
	displayName: 'MainLayout',
	propTypes: {children: PropTypes.func},
	childContextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		etherscan: PropTypes.string,
		myTokens: PropTypes.array,
		blockNumber: PropTypes.number,
		metaMaskHintFn: PropTypes.func,
		showLoadingScreen: PropTypes.func,
		throwAlert: PropTypes.func,
		network: PropTypes.number,
		GWEI: PropTypes.number,
		api: PropTypes.object,
	},
	getChildContext(){
		return {
			web3: this.state.web3,
			contracts: this.state.contracts,
			account: this.state.account,
			etherscan:this.state.etherscan,
			myTokens: this.state.myTokens,
			blockNumber: this.state.blockNumber,
			metaMaskHintFn: this.metaMaskHintFn,
			showLoadingScreen: this.showLoadingScreen,
			throwAlert: this.throwAlert,
			network: this.state.network,
			GWEI: this.state.GWEI,
			api: this.state.api,
		};
	},
	throwAlert(message){
		this.setState({alert:message})
	},
	showLoadingScreen(tx,dest){
		this.setState({loadingTx:tx,loadingDest:dest})
	},
	setGWEI(GWEI){
		//console.log("setGWEI",GWEI)
		let update = {GWEI:parseInt(GWEI*10)/10}
		this.setState(update)
		cookie.save('GWEI', GWEI, { path: '/', maxAge:1800 })
	},
	setGWEIScale(MINGWEI,MAXGWEI){
		//console.log("setGWEIScale",MINGWEI,MAXGWEI)
		let update = {MINGWEI:parseInt(MINGWEI*10)/10,MAXGWEI:parseInt(MAXGWEI*10)/10}
		this.setState(update)
	},
	metaMaskHintFn(){
		window.scrollTo(0,0);
		this.setState({metamaskHint:30})
		setTimeout(()=>{
			this.setState({metamaskHint:10})
		},1000)
	},
	getInitialState(){
		let GWEI =  parseInt(cookie.load('GWEI')*10)/10
		if(!GWEI) GWEI=MAINNETGWEI;
		//console.log("STARTING MAINNETMAXGWEI",MAINNETMAXGWEI)
		return {
			web3: {},
			contracts: [],
			metamaskHint: 10,
			loadingTx:"",
			loadingDest:"",
			GWEI:GWEI,
			alert: "",
			network:0,
			api:{},
			apiHint:-100,
			reloadRouter:false,
			account:"",
			MINGWEI:MAINNETMINGWEI,
			MAXGWEI:STARTINGMAXGWEI,
		};
	},
	componentDidMount(){
		cookie.save('apiinfo', 1, { path: '/', maxAge:1800 })
		//web3 will com back from the metamask component so wait for that
		this.waitForContracts()
	},
	setupApi(){
		let currentLocation = window.location
		//console.log("currentLocation",currentLocation)
		let backend = currentLocation.protocol+"//"+currentLocation.hostname+":"+OPTIONALBACKENDPORT
		if(this.state.network=="1"){
			backend = "https://api.cryptogs.io"
		}else if(this.state.network=="3"){
			backend = "https://stage.cryptogs.io:8001"
		}else{
			backend = "http://localhost:8002"
		}
		//console.log("backend",backend)
		let apiCookie = parseInt(cookie.load('api'))
		if(apiCookie==-1){
			console.log("don't even try centralized, they have turned it off")
		}else{
			try{
				console.log("Looking for a backend @ ",backend)
				axios.get(backend)
				.then((response)=>{
					let update = {host:backend,...response.data}
					console.log("API!!!!",response,update);
					cookie.save('api', 1, { path: '/', maxAge:1800 })
					this.setState({api:update})
					let apiinfo =  parseInt(cookie.load('apiinfo'))
					if(!apiinfo){
						setTimeout(()=>{
							this.setState({apiHint:20})
						},1500)
						setTimeout(()=>{
							this.setState({apiHint:-100})
						},4500)
						cookie.save('apiinfo', 1, { path: '/', maxAge:1800 })
					}
				})
			} catch(e) {
				console.log(e)
			}
		}
	},
	componentWillUnmount(){
		if (this._timer){
			clearTimeout(this._timer);
		}
	},
	setEtherscan(url){
    this.setState({etherscan:url})
  },
	networkReady(network,web3js) {
		console.log("NETWORK READY:",network,web3js.currentProvider)
		let contracts = ContractLoader(["Cryptogs","SlammerTime","PizzaParlor","Artists"],web3js,network);
		let update = {network:network,web3:web3js,contracts:contracts,contractsLoaded:true}
	//	if(!this.state || !this.state.GWEI || this.state.GWEI == STARTINGGWEI MAINNETGWEI){
			console.log("GWEI...")
			if(network>1){
				this.setGWEI(STARTINGGWEI)
			}else{
				console.log("Setting gas to default and hitting API for a better price...")
				this.setGWEI(MAINNETGWEI)
				axios.get("https://ethgasstation.info/json/ethgasAPI.json")
				.then((response)=>{
					console.log("GAS",response.data)
					if(response.data.average>0&&response.data.average<200){
						response.data.average=response.data.average+2
						let setMainGasTo = response.data.average/10
						this.setGWEI(setMainGasTo)
					}
				})
			}
	//	}else{
	//		console.log("GWEI already",this.state.GWEI)
		//}
		if(network>1){
			this.setGWEIScale(STARTINGMINGWEI,STARTINGMAXGWEI)
		}else{
			this.setGWEIScale(MAINNETMINGWEI,MAINNETMAXGWEI)
		}
		this.setState(update)



		//check to see if we can talk to the api
		setTimeout(()=>{
			this.setupApi()
		},250)
	},
	init(account,network,web3js) {
		console.log("INIT",account,network,web3js.currentProvider)
		let update = {account:account}
		this.setState(update)
	},
	waitForContracts(){
		if(this.state && this.state.contractsLoaded){
			this.loadBlockNumber(this.whenContractsAreReady);
		}else{
			contractLoadingInterval = setInterval(()=>{
				if(this.state && this.state.contractsLoaded){
					this.loadBlockNumber(this.whenContractsAreReady);
					clearInterval(contractLoadingInterval)
				}
			},707)
		}
	},
	apiClick(){

		/*
		cookie.save('apiinfo', 0, { path: '/', maxAge:1800 })
		if(this.state.api&&this.state.api.version){
			console.log("clear api and go dencentralized")
			this.setState({api:false,apiHint:20,reloadRouter:true})
			setTimeout(()=>{
				this.setState({reloadRouter:false})
			},2000)
			cookie.save('api', -1, { path: '/', maxAge:1800 })
			setTimeout(()=>{
				this.setState({apiHint:-100})
			},4000)
		}else{

			console.log("Give me just a little centralization for less transactions")
			cookie.save('api', 1, { path: '/', maxAge:1800 })
		  setTimeout(()=>{
				this.setupApi()
			},500)
			this.setState({reloadRouter:true})
			setTimeout(()=>{
				this.setState({reloadRouter:false})
			},2000)

		}
		*/
		window.location = "/"
	},
	whenContractsAreReady(){
		setInterval(()=>{
			TokenLoader(this.state.account,this.state.contracts["Cryptogs"],this.state.web3,(update)=>{
				if(!ShallowEqualsById(update,this.state.myTokens,"image")){
					if(DEBUG) console.log("UPDATE MY TOKENS",update)
					this.setState({myTokens:update});
				}
			});
		},777)
		setInterval(()=>{
			this.loadBlockNumber()
		},757)
		this.loadBlockNumber()
	},
	loadBlockNumber(cb){
		this.state.web3.eth.getBlockNumber().then((number)=>{
			number=parseInt(number)
			if(number && !this.state.blockNumber || this.state.blockNumber!=number){
				this.setState({blockNumber:number},cb)
			}
		});
	},
	render(){
		const { count,contracts,loadingTx,loadingDest } = this.state;

		let loader = ""
		if(loadingTx){
			loader = (
				<Loader showLoadingScreen={this.showLoadingScreen} contracts={this.state.contracts} etherscan={this.state.etherscan} web3={this.state.web3} blockNumber={this.state.blockNumber} loadingTx={loadingTx} loadingDest={loadingDest} />
			)
		}


		let apiHintContent = (
			<div>
				<img src="/darkclogo.png" style={{maxHeight:20}}/> Fully decentralized, you should run the <a href="https://github.com/austintgriffith/cryptogs/tree/master/reactapp" target="_blank">react app</a> locally too.
			</div>
		)
		if(this.state.api&&this.state.api.version){
			apiHintContent = (
				<div>
					<img src="/lightclogo.png" style={{maxHeight:20}}/> Connected to centralized API for faster and fewer transactions.
				</div>
			)
		}

		let router

		if(this.state.reloadRouter){
				router = (
						<div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
				)
		}else{
			router = (
	 			<Router>
	 				<Switch>
	 						 <Route exact path="/" component={IndexPage} />
							 <Route path={`/web3`} component={Web3Page} />
	 						 <Route path={`/stacks`} component={StacksPage} />
	 						 <Route path={`/create`} component={CreatePage} />
	 						 <Route path={`/buy`} component={BuyPage} />
	 						 <Route path={`/address/:address`} component={AddressPage} />
	 						 <Route path={`/play/:stack`} component={PlayPage} />
	 						 <Route path={`/join/:stack`} component={JoinPage} />
	 						 <Route path={`/cryptog/:cryptog`} component={CryptogPage} />
	 						 <Route path={`/contracts`} component={ContractsPage} />
							 <Route path={`/artists`} component={ArtistsPage} />
							 <Route path={`/art`} component={ArtPage} />
	 						 <Redirect to='/' />
	 				</Switch>
	 			</Router>
	 		)
		}

		return (
			<div style={{backgroundColor:"#FFFFFF"}}>

				<Header
					syncBlockNumber={this.syncBlockNumber}
					account={this.state.account}
					init={this.init}
					networkReady={this.networkReady}
					blockNumber={this.state.blockNumber}
					etherscan={this.state.etherscan}
					setEtherscan={this.setEtherscan}
					metamaskHint={this.state.metamaskHint}
					metaMaskHintFn={this.metaMaskHintFn}
					web3={this.state.web3}
					network={this.state.network}
					api={this.state.api}
					apiClick={this.apiClick}
				/>

				<Motion
				defaultStyle={{
					top:-100,
				}}
				style={{
					top:spring(this.state.apiHint,{ stiffness: 100, damping: 12 })
				}}
				>
					{currentStyles => {
						return (
							<div style={{width:380,padding:20,fontSize:11,backgroundColor:"#FFFFFF",cursor:"pointer",position:"absolute",top:currentStyles.top,right:0,zIndex:1000}}>
								{apiHintContent}
							</div>
						)
					}}
				</Motion>

				<div>
          {router}
				</div>
				{loader}
				<Slack />
				<GasSlider setGWEI={this.setGWEI} MINGWEI={this.state.MINGWEI} MAXGWEI={this.state.MAXGWEI} GWEI={this.state.GWEI} network={this.state.network}/>
			</div>
    )

	}
});
/*


<Alert
	message={this.state.alert}
/>
 */
