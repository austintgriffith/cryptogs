import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import PropsRoute from '../components/PropsRoute.js'
import AddressStack from '../components/AddressStack.js'
import PogAnimation from '../components/PogAnimation'

let syncInterval
export default createClass({
	displayName: 'AddressPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		etherscan: PropTypes.string,
		api: PropTypes.object,
	},
	render(){
		const { contracts } = this.context
		if( !contracts.Cryptogs){
			return (
				<div style={{opacity:0.3}}><PogAnimation loader={true} image={'ad8ball.png'} /></div>
			)
		}
		return (
			<div style={{margin: '0 auto',maxWidth: 960,paddingTop: 0}}>
				<Route
	        render={({ location }) => (
	          <div>
	            <PropsRoute
	              location={location}
	              key={location.key}
	              path="/address/:address"
	              component={AddressStack}
								context={this.context}
								etherscan={this.context.etherscan}
								api={this.context.api}
	            />
	          </div>
	        )}
	      />
			</div>
    )
	}
});
//
