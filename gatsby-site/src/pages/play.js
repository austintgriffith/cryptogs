import React from 'react'
import createClass from 'create-react-class'
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types'
import Stack from '../components/Stack.js'

let syncInterval
export default createClass({
	displayName: 'PlayPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		allStacks: PropTypes.array,
	},
	render(){
		const { allStacks } = this.context

		let stacks = []

		console.log("allStacks",allStacks)
		for(let s in allStacks){
			console.log("stack",s,allStacks[s])
			stacks.push(<Stack {...allStacks[s]}/>)
		}

		return (
      <div>
				play

				<div>list my games in progress at the top</div>


				<div><a href="/create">Create a game</a></div>

				<div>{stacks}</div>


      </div>
    )
	}
});
//
