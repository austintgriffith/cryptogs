import React, { Component } from 'react';
import createClass from 'create-react-class';
import Blockies from 'react-blockies'
import StackGrid from 'react-stack-grid'
import Cryptog from '../components/Cryptog.js'
import Spinner from '../components/Spinner.js'

export default createClass({
  render(){
    let {callToAction} = this.props
    let cryptogs = []
    let account
    if(this.props._sender){
      account = this.props._sender.toLowerCase()
      for(let t=1;t<=5;t++){
        cryptogs.push(

          <Spinner key={"sendspinner"+t} guts={
            (spinning)=>{
              return (
                <Cryptog key={"cryptog"+this.props["_token"+t]} scale={1} id={this.props["_token"+t]} slowrolling={spinning} image={this.props["_token"+t+"Image"]} zIndex={1}/>
              )
            }
          }/>

        )
      }
    }else if(this.props.owner){
       account = this.props.owner.toLowerCase()
       for(let t=1;t<=5;t++){
         cryptogs.push(
           <Spinner key={"ownspinner"+t} guts={
             (spinning)=>{
               return (
                 <Cryptog key={"cryptog"+this.props["token"+t]} scale={1} id={this.props["token"+t]} slowrolling={spinning} image={this.props["token"+t+"Image"]} zIndex={1}/>
               )
             }
           }/>
         )
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
        style={{marginTop:50,backgroundColor:"#fbfbfb"}}
        columnWidth={110}
      >
      <div style={{paddingTop:45,paddingLeft:10}}>
        <a href={"/address/"+account}>
          <Blockies
            seed={account}
            scale={8}
          />
        </a>
      </div>
      {cryptogs}
      <div style={{paddingTop:45,paddingLeft:10}}>
        {button}
      </div>
      </StackGrid>
    )
  }
})
