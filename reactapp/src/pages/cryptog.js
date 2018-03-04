import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import PropsRoute from '../components/PropsRoute.js'
import CryptogStack from '../components/CryptogStack.js'
import PogAnimation from '../components/PogAnimation'

let syncInterval
export default createClass({
	displayName: 'CryptogPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		showLoadingScreen: PropTypes.func,
	},
	render(){
		const { contracts } = this.context
		if( !contracts.Cryptogs){
			return (
				<div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
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
	              path="/cryptog/:cryptog"
	              component={CryptogStack}
								context={this.context}
								account={this.context.account}
								contracts={this.context.contracts}
								showLoadingScreen={this.context.showLoadingScreen}
	            />
	          </div>
	        )}
	      />
			</div>
    )
	}
});
//
