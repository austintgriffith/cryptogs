import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'

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
	},
	getInitialState(){
		let contractList = ["Cryptogs","SlammerTime","PizzaParlor","Artists"]
		let mainnet = {}
		let ropsten = {}
		for(let c in contractList){
	    try{
				ropsten[contractList[c]] = require("../contracts/"+contractList[c]+".3.address.js")
				console.log("Loaded ropsten:",ropsten)
				mainnet[contractList[c]] = require("../contracts/"+contractList[c]+".1.address.js")
				console.log("Loaded mainnet:",mainnet)
	    }catch(e){console.log(e)}
	  }

		console.log("ROPSTEN",ropsten)

		return {
			mainnet:mainnet,
			ropsten:ropsten
		}
	},

	render(){

		return (
      <div style={{margin: '0 auto',maxWidth: 960,padding: '0px 1.0875rem 1.45rem',paddingTop: 0}}>
				<h1>Smart Contracts</h1>
				<section className="section bg-primary pt-5 pb-5">
						<div className="container">
								<h1 className="h2 mb-5 text-center"></h1>

								<div className="jumbotron jumbotron--white p-5">
									<h2>Mainnet</h2>
										<div className="row align-items-center">
												<div className="col-md-3">
														<div>Cryptogs.sol</div>
														<div>SlammerTime.sol</div>
														<div>PizzaParlor.sol</div>
														<div>Artists.sol</div>
												</div>
												<div className="col-md-9">
													<div>
														<a href={"https://etherscan.io/address/"+this.state.mainnet.Cryptogs+"#code"}>{this.state.mainnet.Cryptogs}</a>
													</div>
													<div>
														<a href={"https://etherscan.io/address/"+this.state.mainnet.SlammerTime+"#code"}>{this.state.mainnet.SlammerTime}</a>
													</div>
													<div>
														<a href={"https://etherscan.io/address/"+this.state.mainnet.PizzaParlor+"#code"}>{this.state.mainnet.PizzaParlor}</a>
													</div>
													<div>
														<a href={"https://etherscan.io/address/"+this.state.mainnet.Artists+"#code"}>{this.state.mainnet.Artists}</a>
													</div>
												</div>
										</div>

										<hr className="my-5" />
										<h2>Ropsten</h2>
										<div className="row align-items-center">
												<div className="col-md-3">
													<div>Cryptogs.sol</div>
													<div>SlammerTime.sol</div>
													<div>PizzaParlor.sol</div>
													<div>Artists.sol</div>
												</div>
												<div className="col-md-9">
													<div>
														<a href={"https://ropsten.etherscan.io/address/"+this.state.ropsten.Cryptogs+"#code"}>{this.state.ropsten.Cryptogs}</a>
													</div>
													<div>
														<a href={"https://ropsten.etherscan.io/address/"+this.state.ropsten.SlammerTime+"#code"}>{this.state.ropsten.SlammerTime}</a>
													</div>
													<div>
														<a href={"https://ropsten.etherscan.io/address/"+this.state.ropsten.PizzaParlor+"#code"}>{this.state.ropsten.PizzaParlor}</a>
													</div>
													<div>
														<a href={"https://ropsten.etherscan.io/address/"+this.state.ropsten.Artists+"#code"}>{this.state.ropsten.Artists}</a>
													</div>
												</div>
										</div>

										<hr className="my-5" />
										<h2>Github</h2>
										<div className="row align-items-center">
												<div className="col-md-3">
													<div>Cryptogs.sol</div>
													<div>SlammerTime.sol</div>
													<div>PizzaParlor.sol</div>
													<div>Artists.sol</div>
												</div>
												<div className="col-md-9">
													<div>
														<a href="https://github.com/austintgriffith/cryptogs/blob/master/Cryptogs/Cryptogs.sol">Source Code</a>
													</div>
													<div>
														<a href="https://github.com/austintgriffith/cryptogs/blob/master/SlammerTime/SlammerTime.sol">Source Code</a>
													</div>
													<div>
														<a href="https://github.com/austintgriffith/cryptogs/blob/master/PizzaParlor/PizzaParlor.sol">Source Code</a>
													</div>
													<div>
														<a href="https://github.com/austintgriffith/cryptogs/blob/master/Artists/Artists.sol">Source Code</a>
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
