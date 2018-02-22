import React from 'react'
import createClass from 'create-react-class'
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types'
import Cryptog from '../components/Cryptog.js'
import StackGrid from 'react-stack-grid'

let syncInterval
export default createClass({
	displayName: 'MinePage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
	},
	render(){
		const { myTokens } = this.context
		if(!myTokens) return (<div style={{opacity:0.3}}>loading...</div>)
		let tokenDisplay = myTokens.map((token)=>{
			return <Cryptog key={"cryptog"+token.id} id={token.id} image={token.image}/>
		})
		return (
      <div>
				<div style={{float:'right'}}>count ({tokenDisplay.length})</div>
				<StackGrid
					style={{marginTop:50}}
					columnWidth={110}
				>
					 {tokenDisplay}
				</StackGrid>

      </div>
    )
	}
});
//
