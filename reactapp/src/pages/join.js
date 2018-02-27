import React from 'react'
import createClass from 'create-react-class'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import PropsRoute from '../components/PropsRoute.js'
import Cryptog from '../components/Cryptog.js'
import JoinStack from '../components/JoinStack.js'

let syncInterval
export default createClass({
	displayName: 'JoinPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		showLoadingScreen: PropTypes.func,
	},
	render(){
		const { account,contracts } = this.context
		if(!account || !contracts.Cryptogs){
			return (
				<div style={{opacity:0.3}}>Loading...</div>
			)
		}
		return (
      <Route
        render={({ location }) => (
          <div>
            <PropsRoute
              location={location}
              key={location.key}
              path="/join/:stack"
              component={JoinStack}
							context={this.context}
            />
          </div>
        )}
      />
    )
	}
});
