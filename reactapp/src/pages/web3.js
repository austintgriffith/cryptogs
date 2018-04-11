import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import BuyPacks from '../components/BuyPacks.js'
import Banner from '../components/Banner'
import Cryptog from '../components/Cryptog.js'
import Spinner from '../components/Spinner.js'
import CryptogDocScroll from '../components/CryptogDocScroll.js'
var Web3 = require('web3')
var web3
let loadInterval
let initialIntervalLoaded

const MINTEDPACKDISPLAYLIMIT = 10

export default createClass({
	displayName: 'IndexPage',
	contextTypes: {
		web3: PropTypes.object,
		network: PropTypes.number,

	},
	getInitialState(){
		return {status:"init...",accounts:[],checks:0}
	},
	componentDidMount(){
		window.addEventListener('load', () => {
			this.waitForWeb3()
		})
	},
	walletLink(link,image,name){

		return (


						<div className="col-md-4" style={{padding:30,borderBottom:"1px solid #dddddd"}} onClick={()=>{
							window.location = link
						}}>
							<CryptogDocScroll image={image} />

								<div className="pt-2 pb-2" style={{textAlign:"center"}}>
									<p className="lead-2 mb-0" style={{fontSize:30}}><a href={link}>{name}</a></p>
								</div>

						</div>



		)
	},
	waitForWeb3(){
		console.log("=== DETECTING WEB3 ===")
		this.setState({checks:this.state.checks+1,status:"Load..."})
		let web3js
		if (typeof web3 !== 'undefined' && typeof web3.currentProvider !== 'undefined') {
			web3js = new Web3(web3.currentProvider);
		} else if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
			web3js = new Web3(window.web3.currentProvider);
		} else {
			if(this.state.checks>10){

				web3js=web3
				web3js.eth.getAccounts(accounts => {
					this.setState({status:"forceweb3mightwork"+accounts[0]})
				})
				this.setState({status:"forceweb3"})

			}else{
				this.setState({status:"no web3"})
				setTimeout(this.waitForWeb3,1500)
			}
		}

		if(typeof web3js !== 'undefined'){
			this.setState({status:"web3..."})
			web3js.eth.net.getId().then((network)=>{
				this.setState({status:"network:"+network})
				console.log("Getting accounts...")
				web3js.eth.getAccounts().then((accounts)=>{
					this.setState({accounts:accounts})
				})
			})
		}
	},
	render(){
		let {web3,network} = this.context

		let accoutView = ""
		if(this.state.accounts.length>0){
			accoutView = (
				<pre>
					{JSON.stringify(this.state.accounts)}
				</pre>
			)
		}

		return (
			<div>


			<p style={{width:"100%",textAlign:"center",opacity:0.7,marginTop:20}}>
				Mobile wallets available:
			</p>

			<section className="section pt-6 pb-6">
				<div className="container">
					<div className="jumbotron p-5">
						<div className="row align-items-center">
							{this.walletLink("https://trustwalletapp.com/","trust.png","Trust Wallet")}
							{this.walletLink("https://www.toshi.org/","toshi.jpg","Toshi")}
							{this.walletLink("https://www.cipherbrowser.com/","cipher.png","Cipher Browser")}
						</div>
					</div>
				</div>

			</section>


						<div style={{textAlign:"center"}}>
							{this.state.status} {this.state.checks}
							{accoutView}

							<div style={{cursor:"pointer",width:"100%",textAlign:"center",padding:10}} onClick={()=>{
								window.location.reload(true);
							}}>Reload</div>

							<div style={{cursor:"pointer",width:"100%",textAlign:"center",padding:10}} onClick={()=>{
								window.location = "/web3?nocache="+Date.now()
							}}>No Cache</div>

							<pre>
							window.web3:{typeof window.web3}

							</pre>
							<pre>
								web3:{typeof web3}
							</pre>
						</div>



			</div>

		)
	}
});
