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
		return {status:"init...",accounts:[]}
	},
	componentDidMount(){
		window.addEventListener('load', () => {
			this.setState({status:"Load..."})
			let web3js
			if (typeof web3 !== 'undefined') {
				web3js = new Web3(web3.currentProvider);
			} else if (typeof window.web3 !== 'undefined') {
				web3js = new Web3(window.web3.currentProvider);
			} else {
				this.setState({status:"no web3"})
			}
			if(web3js){
				this.setState({status:"web3..."})
				web3js.eth.net.getId().then((network)=>{
					this.setState({status:"network:"+network})
					console.log("Getting accounts...")
					web3js.eth.getAccounts().then((accounts)=>{
						this.setState({accounts:accounts})
					})
				})
			}
		})
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



			<div>
				{this.state.status}
			</div>
			{accoutView}

			

			<section className="section pt-6 pb-6">
				<div className="container">
					<div className="jumbotron p-5">
						<div className="row align-items-center" onClick={()=>{
							window.location = "https://www.cipherbrowser.com/"
						}}>
							<div className="col-md-3">
								<CryptogDocScroll image="cipher.jpg" />
							</div>
							<div className="col-md-9">
								<div className="pt-2 pb-2">
								  <p className="lead-2 mb-0" style={{fontSize:30}}><a href="https://www.cipherbrowser.com/">Cipher Browser</a></p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="container">
					<div className="jumbotron p-5">
						<div className="row align-items-center" onClick={()=>{
							window.location = "https://www.toshi.org/"
						}}>
							<div className="col-md-3">
								<CryptogDocScroll image="toshi.jpg" />
							</div>
							<div className="col-md-9">
								<div className="pt-2 pb-2">
									<p className="lead-2 mb-0" style={{fontSize:30}}><a href="https://www.toshi.org/">Toshi</a></p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="container">
					<div className="jumbotron p-5">
						<div className="row align-items-center" onClick={()=>{
							window.location = "https://trustwalletapp.com/"
						}}>
							<div className="col-md-3">
								<CryptogDocScroll image="trust.png" />
							</div>
							<div className="col-md-9">
								<div className="pt-2 pb-2">
									<p className="lead-2 mb-0" style={{fontSize:30}}><a href="https://trustwalletapp.com/">Trust Wallet</a></p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="container">
					<div className="jumbotron p-5">
						<div className="row align-items-center" onClick={()=>{
							window.location = "https://metamask.io/"
						}}>
							<div className="col-md-3">
								<CryptogDocScroll image="metamask.png" />
							</div>
							<div className="col-md-9">
								<div className="pt-2 pb-2">
									<p className="lead-2 mb-0" style={{fontSize:30}}><a href="https://metamask.io/">MetaMask</a></p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>


			</div>

		)
	}
});
