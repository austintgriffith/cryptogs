import React from 'react'
import createClass from 'create-react-class';
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types';

export default createClass({
	displayName: 'IndexPage',
	contextTypes: {
		count: PropTypes.number
	},
	render(){
		const { count } = this.context;

		return (
      <div>
				list packs available for purchase here
      </div>
    )
	}
});
