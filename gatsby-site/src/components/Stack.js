import React, { Component } from 'react';
import createClass from 'create-react-class';
import Blockies from 'react-blockies'
import StackGrid from 'react-stack-grid'
import Cryptog from '../components/Cryptog.js'

export default createClass({
  render(){

    let cryptogs = []
    for(let t=1;t<=5;t++){
      cryptogs.push(<Cryptog id={this.props["_token"+t]} image={this.props["_token"+t+"Image"]}/>)
    }
    
    return (
      <StackGrid
        style={{marginTop:50}}
        columnWidth={110}
      >
      <Blockies
        seed={this.props._sender.toLowerCase()}
        scale={6}
      />
      {cryptogs}
      </StackGrid>
    )
  }
})
