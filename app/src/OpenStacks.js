import React, { Component } from 'react';
import Stack from './Stack.js'

class OpenStacks extends Component {

  render(){
    let {SubmitStacks} = this.props

    let stacks = []
    for(let s in SubmitStacks){
      stacks.push(
        <Stack
          {...SubmitStacks[s]}
        />
      )
    }

    return (
      <div style={{width:'100%',margin: "0 auto",background:"#ffffff",border:'1px solid #BBBBBB',padding:10}}>
        {stacks}
      </div>
    )
  }
}

export default OpenStacks;
