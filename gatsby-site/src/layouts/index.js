import React from 'react'
import { createElement } from 'react';
import createClass from 'create-react-class';
import Helmet from 'react-helmet'
import PropTypes from 'prop-types';
import Header from '../components/Header.js'
import './index.css'
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';
import ContractLoader from '../modules/contractLoader.js';
import TokenLoader from '../modules/tokenLoader.js';
import ShallowEqualsById from '../modules/ShallowEqualsById.js';
var Web3 = require('web3');
let contractLoadingInterval;
export default createClass({
	displayName: 'MainLayout',
	propTypes: {children: PropTypes.func},
	childContextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		allStacks: PropTypes.array,
		blockNumber: PropTypes.number
	},
	getChildContext(){
		return {
			web3: this.state.web3,
			contracts: this.state.contracts,
			account: this.state.account,
			myTokens: this.state.myTokens,
			allStacks: this.state.allStacks,
			blockNumber: this.state.blockNumber
		};
	},
	getInitialState(){
		return {
			allStacks: [],
			web3: {},
			contracts: [],
		};
	},
	componentDidMount(){
		try{
			let web3 = new Web3(window.web3.currentProvider)
			let contracts = ContractLoader(["Cryptogs","SlammerTime"],web3);
			this.setState({web3:web3,contracts:contracts,contractsLoaded:true})
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
		console.log("INIT")
		this.setState({account:account})
		this.waitForContracts()
	},
	waitForContracts(){
		if(this.state && this.state.contractsLoaded){
			this.loadBlockNumber(this.whenContractsAreReady);
		}else{
			contractLoadingInterval = setInterval(()=>{
				if(this.state && this.state.contractsLoaded){
					clearInterval(contractLoadingInterval)
					this.loadBlockNumber(this.whenContractsAreReady);
				}
			},171)
		}
	},
	whenContractsAreReady(){


		let updateAllStacks = async (update)=>{
			let id = update._stack
			if(!this.state.allStacks[id]){
				this.state.allStacks[id]=update;
				console.log("UPDATE allStacks ",this.state.allStacks)
				for(let t=1;t<=5;t++){
					let token = await this.state.contracts['Cryptogs'].methods.getToken(this.state.allStacks[id]["_token"+t]).call()//this.state.allStacks[id]
					this.state.allStacks[id]["_token"+t+"Image"] = this.state.web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
				}
				this.setState({allStacks:this.state.allStacks});
			}
		}
		EventParser(this.state.contracts["Cryptogs"],"SubmitStack",this.state.contracts["Cryptogs"].blockNumber,this.state.blockNumber,updateAllStacks);
		setInterval(()=>{
			LiveParser(this.state.contracts["Cryptogs"],"SubmitStack",this.state.blockNumber,updateAllStacks)
		},731)

		setInterval(()=>{
			TokenLoader(this.state.account,this.state.contracts["Cryptogs"],this.state.web3,(update)=>{
				if(!ShallowEqualsById(update,this.state.myTokens,"image")){
					console.log("UPDATE MY TOKENS",update)
					this.setState({myTokens:update});
				}
			});
		},777)

		setInterval(()=>{
			this.loadBlockNumber()
		},757)
	},
	loadBlockNumber(cb){
		this.state.web3.eth.getBlockNumber().then((number)=>{
			number=parseInt(number)
			//console.log("GOT BLOCK",number)
			if(number && !this.state.blockNumber || this.state.blockNumber!=number){
				//console.log("BLOCK MINED",number)
				this.setState({blockNumber:number},cb)
			}
		});
	},
	render(){
		const { count,contracts } = this.state;
		const { children } = this.props;
		return (
			<div>
				<Helmet
					title="Title"
					meta={[
						{ name: 'description', content: 'description' },
						{ name: 'keywords', content: 'keywords' },
					]}
				/>
				<Header
					syncBlockNumber={this.syncBlockNumber}
					account={this.state.account}
					init={this.init}
					blockNumber={this.state.blockNumber}
					etherscan={this.state.etherscan}
					setEtherscan={this.setEtherscan}
				/>
				<div style={{margin: '0 auto',maxWidth: 960,padding: '0px 1.0875rem 1.45rem',paddingTop: 0,}}>
					{ children() }
				</div>
			</div>
    )

	}
});
/*
gatsby loop example for later reference
(function run(self){
	self.setState({ count: self.state.count += 1 });
	self._timer = setTimeout(run, 1000, self);
}(this));
 */
