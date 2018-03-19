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

const OPTIONALBACKEND = "http://stage.cryptogs.io:56834"

const DEBUG = false
const MAINNETGWEI = 5
const STARTINGGWEI = 21

var Web3 = require('web3')
var web3
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
		this.setState({GWEI:parseInt(GWEI)})
		cookie.save('GWEI', GWEI, { path: '/', maxAge:1800 })
	},
	metaMaskHintFn(){
		window.scrollTo(0,0);
		this.setState({metamaskHint:30})
		setTimeout(()=>{
			this.setState({metamaskHint:10})
		},1000)
	},
	getInitialState(){
		let GWEI =  parseInt(cookie.load('GWEI'))
		if(!GWEI) GWEI=STARTINGGWEI;
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
		};
	},
	componentDidMount(){
		try{
			web3 = new Web3(window.web3.currentProvider)
			web3.eth.net.getId().then((network)=>{
				if(network>9999) network=9999;
				let contracts = ContractLoader(["Cryptogs","SlammerTime"],web3,network);
				let update = {web3:web3,contracts:contracts,contractsLoaded:true,network:network}
				if(!this.state || !this.state.GWEI || this.state.GWEI == STARTINGGWEI){
					if(network>1){
						this.setGWEI(STARTINGGWEI)
					}else{
						this.setGWEI(MAINNETGWEI)
					}
				}
				this.setState(update)
			})
		} catch(e) {
			console.log(e)
		}
		this.waitForContracts()
		//check to see if we can talk to the api
		this.setupApi()
	},
	setupApi(){
		try{
			console.log("Looking for a backend @ ",OPTIONALBACKEND)
			axios.get(OPTIONALBACKEND)
		  .then((response)=>{
				let update = {host:OPTIONALBACKEND,...response.data}
		    console.log("API!!!!",response,update);
				this.setState({api:update})
		  })
		} catch(e) {
			console.log(e)
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
	init(account) {
		if(DEBUG) console.log("INIT")
		this.setState({account:account})
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
		if(this.state.api&&this.state.api.version){
			this.setState({api:false})
		}else{
			this.setupApi()
		}
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


		return (
			<div style={{backgroundColor:"#FFFFFF"}}>

				<Header
					syncBlockNumber={this.syncBlockNumber}
					account={this.state.account}
					init={this.init}
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

				<div>
          <Router>
            <Switch>
  					     <Route exact path="/" component={IndexPage} />
                 <Route path={`/stacks`} component={StacksPage} />
                 <Route path={`/create`} component={CreatePage} />
								 <Route path={`/buy`} component={BuyPage} />
                 <Route path={`/address/:address`} component={AddressPage} />
                 <Route path={`/play/:stack`} component={PlayPage} />
                 <Route path={`/join/:stack`} component={JoinPage} />
								 <Route path={`/cryptog/:cryptog`} component={CryptogPage} />
								 <Route path={`/contracts`} component={ContractsPage} />
								 <Redirect to='/' />
            </Switch>
          </Router>
				</div>
				{loader}
				<Slack />
				<GasSlider setGWEI={this.setGWEI} GWEI={this.state.GWEI} network={this.state.network}/>
			</div>
    )

	}
});
/*


<Alert
	message={this.state.alert}
/>
 */
