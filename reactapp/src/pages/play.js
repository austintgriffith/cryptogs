import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import PropsRoute from '../components/PropsRoute.js'
import Cryptog from '../components/Cryptog.js'
import PlayStack from '../components/PlayStack.js'
import PogAnimation from '../components/PogAnimation'

let syncInterval
export default createClass({
	displayName: 'PlayPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		blockNumber: PropTypes.number,
		showLoadingScreen: PropTypes.func,
		GWEI: PropTypes.number,
		throwAlert: PropTypes.func,
		etherscan: PropTypes.string,
		api: PropTypes.object,
	},
	render(){
		const { account,contracts } = this.context
		if(!account || !contracts || !contracts.Cryptogs){
			return (
				<div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
			)
		}
		return (
			<div style={{margin: '0'}}>
	      <Route
	        render={({ location }) => (
	          <div>
	            <PropsRoute
	              location={location}
	              key={location.key}
	              path="/play/:stack"
	              component={PlayStack}
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
