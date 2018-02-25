import React, { Component } from 'react';
import createClass from 'create-react-class';
import Blockies from 'react-blockies'
import StackGrid from 'react-stack-grid'
import Cryptog from '../components/Cryptog.js'

export default createClass({
  render(){
    let {price,id,tokens,images} = this.props
    let cryptogs = []

    for(let t=1;t<10;t++){
      cryptogs.push(<Cryptog key={"tos"+tokens[t]} id={tokens[t]} image={images[t]}/>)
    }

    let button = ""


      button = (
        <div>
          <div style={{marginTop:25,opacity:0.5,fontSize:12}}>for sale</div>
          <div style={{opacity:0.9,fontSize:20}}>Ξ{price}</div>
        </div>
      )


    return (
      <StackGrid
        style={{marginTop:50,cursor:'pointer'}}
        columnWidth={70}
        onClick={this.props.PackClick.bind(this,this.props.id)}
      >
      {cryptogs}
      <div></div>
      {button}
      </StackGrid>
    )
  }
})
