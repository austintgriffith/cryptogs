import React, { Component } from 'react';
import createClass from 'create-react-class';
import Blockies from 'react-blockies'
import StackGrid from 'react-stack-grid'
import Cryptog from '../components/Cryptog.js'

export default createClass({
  render(){
    let {callToAction} = this.props
    let cryptogs = []
    let account
    if(this.props._sender){
      account = this.props._sender.toLowerCase()
      for(let t=1;t<=5;t++){
        cryptogs.push(<Cryptog key={"tos"+this.props["_token"+t]} id={this.props["_token"+t]} image={this.props["_token"+t+"Image"]}/>)
      }
    }else if(this.props.owner){
       account = this.props.owner.toLowerCase()
       for(let t=1;t<=5;t++){
         cryptogs.push(<Cryptog key={"tos"+this.props["token"+t]} id={this.props["token"+t]} image={this.props["token"+t+"Image"]}/>)
       }
    }
    let button = ""

    if(callToAction){
      button = (
        <div>
          {callToAction}
        </div>
      )
    }

    return (
      <StackGrid
        style={{marginTop:50}}
        columnWidth={110}
      >
      <Blockies
        seed={account}
        scale={6}
      />
      {cryptogs}
      {button}
      </StackGrid>
    )
  }
})
