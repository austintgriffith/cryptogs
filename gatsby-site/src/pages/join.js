import React from 'react'
import createClass from 'create-react-class'
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types'
import PropsRoute from '../components/PropsRoute.js'
import Cryptog from '../components/Cryptog.js'
import JoinStack from '../components/JoinStack.js'

import { Route, Redirect } from "react-router-dom"

let syncInterval
export default createClass({
	displayName: 'JoinPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
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
