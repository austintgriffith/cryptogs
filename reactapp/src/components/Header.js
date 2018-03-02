import React from 'react'
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Metamask from '../components/MetaMask.js'
import {Motion, spring, presets} from 'react-motion';

export default createClass({
	render(){
		let {metamaskHint,account,metaMaskHintFn} = this.props
		return (
			<header className="site-header">
			<div className="container-fluid">
					<div className="row align-items-center">
							<div className="col-md-4">
									<Motion
									defaultStyle={{
										marginLeft:10
									}}
									style={{
										marginLeft:spring(metamaskHint,{ stiffness: 100, damping: 6 })
									}}
									>
										{currentStyles => {
											return <Metamask {...this.props} currentStyles={currentStyles}/>
										}}
									</Motion>
							</div>
							<div className="col-md-4">
									<h1 className="logo text-center"><a href="/">CryptoPogs</a></h1>
							</div>
							<div className="col-md-4">
									<nav className="site-nav">
											<ul>
													<li>
													<a href="#" onClick={()=>{
														if(account){
															window.location = "/address/"+account
														}else{
															metaMaskHintFn()
														}
													}} style={{padding:10, cursor:"pointer"}}>
														My Pogs
													</a>
													</li>
													<li>
													<a href="/stacks" style={{padding:10}}>
														Play Pogs
													</a>
													</li>
													<li>
													<a href="/buy" style={{padding:10}}>
														Buy Pogs
													</a>
													</li>
											</ul>
									</nav>
							</div>
					</div>
			</div>
	</header>

    )
	}
});
