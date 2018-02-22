import React from 'react'
import createClass from 'create-react-class';
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types';
import Metamask from '../components/Metamask.js'

export default createClass({
	render(){
		return (
      <div style={{background: '#F4F4F4',marginBottom: '1.45rem'}}>
        <Metamask {...this.props}/>
        <div style={{margin: '0 auto',maxWidth: 960,height: 70,padding:10}}>
          <h1 style={{ float:"right" }}>
            <Link to="/" style={{color: '#333333',textDecoration: 'none'}}>
              Title
            </Link>
            <Link to="/mine" style={{color: '#666666',textDecoration: 'none',padding:5}}>
              mine
            </Link>
						<Link to="/play" style={{color: '#666666',textDecoration: 'none',padding:5}}>
              play
            </Link>
          </h1>
        </div>
      </div>
    )
	}
});
