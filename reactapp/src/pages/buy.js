import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import Intro from '../components/Intro.js'
import BuyPacks from '../components/BuyPacks.js'
import Slack from '../components/Slack.js'

let loadInterval
let initialIntervalLoaded

const MINTEDPACKDISPLAYLIMIT = 10
const GWEI=10

export default createClass({
	displayName: 'BuyPage',
	render(){
		return (
			<div>
				<BuyPacks />
				<Slack />
			</div>
		)
	}
});
