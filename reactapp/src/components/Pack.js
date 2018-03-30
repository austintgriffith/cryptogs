import React, { Component } from 'react';
import createClass from 'create-react-class';
import Blockies from 'react-blockies'
import MMButton from '../components/MMButton.js'
import SimpleStack from '../components/SimpleStack.js'
export default createClass({
  render(){
    let {price,id,tokens,images,compact} = this.props

    let button = (
      <div className="text-center">
        <div style={{opacity:0.5,fontSize:12}}>for sale</div>
        <div style={{opacity:0.9,fontSize:20,backgroundColor:"#FFFFFF"}}>Ξ{price}</div>
        <MMButton onClick={this.props.PackClick.bind(this,this.props.id)} color={"#6ac360"}>Purchase</MMButton>
      </div>
    )

    if(compact){
      return (
        <div style={{position:'relative'}}>
          <div className="col-md-10">
            <SimpleStack click={this.props.PackClick.bind(this,this.props.id)} count={10} scale={0.5} spacing={20} height={200} {...this.props}/>
          </div>
          <div className="mt-3 mb-3" onClick={this.props.PackClick.bind(this,this.props.id)}>
            {button}
          </div>
        </div>
      )
    }else{
      return (
        <div className="row align-items-center" style={{marginBottom:20}}>
          <div className="col-md-10">
            <SimpleStack click={this.props.PackClick.bind(this,this.props.id)} count={10} scale={0.8} spacing={70} height={200} {...this.props}/>
          </div>
          <div className="col-md-2" style={{marginBottom:30}}>
            <div>
              {button}
            </div>
          </div>
        </div>
      )
    }

  }
})
