import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import PropsRoute from '../components/PropsRoute.js'
import Cryptog from '../components/Cryptog.js'
import JoinStack from '../components/JoinStack.js'
import PogAnimation from '../components/PogAnimation'

let syncInterval
export default createClass({
	displayName: 'JoinPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		showLoadingScreen: PropTypes.func,
		GWEI: PropTypes.number,
		throwAlert: PropTypes.func,
		api: PropTypes.object,
	},
	getInitialState(){
		return {
			extraMessage:""
		}
	},
	componentDidMount(){
		setTimeout(()=>{
			this.setState({extraMessage:(
					<div style={{width:"100%",textAlign:"center",padding:50}}>
						Unlock <a target="_blank" href='https://metamask.io'>MetaMask</a> to Play.
					</div>
			)})
		},4000)
	},
	render(){
		const { account,contracts } = this.context
		if(!account || !contracts.Cryptogs){
			return (
				<div>
					<div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
					{this.state.extraMessage}
				</div>
			)
		}
		return (
			<div style={{margin: '0 auto',maxWidth: 960,padding: '0px 1.0875rem 1.45rem',paddingTop: 0}}>
	      <Route
	        render={({ location }) => (
	          <div>
	            <PropsRoute
	              location={location}
	              key={location.key}
	              path="/join/:stack"
	              component={JoinStack}
								context={this.context}
								GWEI={this.context.GWEI}
								throwAlert={this.context.throwAlert}
								api={this.context.api}
	            />
	          </div>
	        )}
	      />
			</div>
    )
	}
});
