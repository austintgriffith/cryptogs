import React from 'react'
import createClass from 'create-react-class'
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types'
import Stack from '../components/Stack.js'

let syncInterval
export default createClass({
	displayName: 'StacksPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		allStacks: PropTypes.array,
	},
	render(){
		const { allStacks,account } = this.context

		let myStacks = []
		let stacks = []


		console.log("allStacks",allStacks)
		for(let s in allStacks){
			console.log("stack",s,account,allStacks[s])
			if(allStacks[s]._sender.toLowerCase() == account.toLowerCase()){
				myStacks.push(
					<Stack key={"mystack"+s} {...allStacks[s]} callToAction={
						<a href={"/play/"+s}>play</a>
					}/>
				)
			}else{
				stacks.push(
					<Stack key={"stack"+s} {...allStacks[s]} callToAction={
						<a href={"/join/"+s}>join</a>
					}/>
				)
			}

		}

		return (
      <div>
				<div>{myStacks}</div>
				<div><a href="/create">Create a game</a></div>
				<div>{stacks}</div>
      </div>
    )
	}
});
//
