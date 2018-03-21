import React, { Component } from 'react';
import createClass from 'create-react-class';
import Cryptog from '../components/Cryptog.js'

export default createClass({
  render(){
    let {callToAction} = this.props
    let cryptogs = []
    let account
    if(this.props._sender){
      account = this.props._sender.toLowerCase()
      for(let t=1;t<=5;t++){
        cryptogs.push(
          <div key={"cryptog"+this.props["_token"+t]} style={{position:"absolute",left:(t-1)*this.props.spacing,top:0}}>
           <Cryptog   scale={this.props.scale} id={this.props["_token"+t]} image={this.props["_token"+t+"Image"]} zIndex={1}/>
          </div>
        )
      }
    }else if(this.props.owner){
       account = this.props.owner.toLowerCase()
       for(let t=1;t<=5;t++){
         cryptogs.push(
           <div key={"cryptog"+this.props["token"+t]} style={{position:"absolute",left:(t-1)*this.props.spacing,top:0}}>
            <Cryptog  scale={this.props.scale} id={this.props["token"+t]} image={this.props["token"+t+"Image"]} zIndex={1}/>
           </div>
         )
       }
    }
    let button = ""

    return (
      <div style={{width:"100%",height:this.props.height}}>

          <div style={{position:"relative",display:"table",margin:"0 auto",left:-(this.props.spacing*2.5)-30}}>
            {cryptogs}
          </div>

      </div>
    )
  }
})
