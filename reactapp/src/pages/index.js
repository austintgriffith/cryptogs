import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import Intro from '../components/Intro.js'
import BuyPacks from '../components/BuyPacks.js'

let loadInterval
let initialIntervalLoaded

const MINTEDPACKDISPLAYLIMIT = 10
const GWEI=10

export default createClass({
	displayName: 'IndexPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		metaMaskHintFn: PropTypes.func,
		showLoadingScreen: PropTypes.func,
	},
	render(){
		let {web3} = this.context
		return (
			<div>
				<Intro web3={web3}/>
				<BuyPacks compact={true} />
			</div>
		)
	}
});
