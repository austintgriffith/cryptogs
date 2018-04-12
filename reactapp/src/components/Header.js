import React from 'react'
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Metamask from '../components/MetaMask.js'
import {Motion, spring, presets} from 'react-motion';
import MMButton from '../components/MMButton.js'

export default createClass({
	render(){
		let {metamaskHint,account,metaMaskHintFn} = this.props

		let apiImage
		if(this.props.api&&this.props.api.version){
			apiImage = "/lightclogo.png"
		}else{
			apiImage = "/darkclogo.png"
		}


		return (
			<header className="site-header">

			<div className="container-fluid">
					<div className="row align-items-center">
							<div style={{position:'absolute',right:0,top:0,cursor:"pointer",zIndex:999}} onClick={this.props.apiClick}>
								<img style={{width:60,marginRight:5,marginTop:20}} src={apiImage} />
							</div>
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
							<div className="col-md-4 text-center">
								<a href="/"><img style={{maxHeight:60,opacity:1}}src="/logo.png"/></a>
							</div>
							<div className="col-md-3">
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
														{"My Togs"}
													</a>
													</li>
													<li>
													<a href="/stacks" style={{padding:10}}>
														{"Play Togs"}
													</a>
													</li>
													<li>
													<a href="/buy" style={{padding:10}}>
														{"Buy Togs"}
													</a>
													</li>
											</ul>
									</nav>
							</div>
							<div className="col-md-1">

							</div>
					</div>
			</div>
	</header>

    )
	}
});
