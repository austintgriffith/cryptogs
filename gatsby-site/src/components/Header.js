import React from 'react'
import createClass from 'create-react-class';
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types';
import Metamask from '../components/MetaMask.js'
import {Motion, spring, presets} from 'react-motion';

export default createClass({
	render(){
		let {metamaskHint,account} = this.props
		return (
      <div style={{background: '#F4F4F4',marginBottom: '1.45rem'}}>
				<Motion
				defaultStyle={{
					marginLeft:10
				}}
				style={{
					marginLeft:spring(metamaskHint,{ stiffness: 100, damping: 6 })
				}}
				>
					{currentStyles => {
						return <Metamask {...this.props} currentStyles={currentStyles}/>
					}}
				</Motion>
				<h1 style={{ float:"right",padding:10 }}>
					<Link to="/" style={{color: '#333333',textDecoration: 'none'}}>
						CryptoPogs
					</Link>
				</h1>
        <div style={{margin: '0 auto',maxWidth: 960,height: 70,padding:10,textAlign:'right'}}>
					<h4 style={{marginTop:20,letterSpacing:-0.8}}>
						<Link to={"/address/"+account} style={{color: '#666666',padding:10}}>
							My Pogs
						</Link>
						<Link to="/stacks" style={{color: '#666666',padding:10}}>
							Play Pogs
						</Link>
						<Link to="/" style={{color: '#666666',padding:10}}>
							Buy Pogs
						</Link>
					</h4>
        </div>
      </div>
    )
	}
});
