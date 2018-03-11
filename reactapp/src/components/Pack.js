import React, { Component } from 'react';
import createClass from 'create-react-class';
import Blockies from 'react-blockies'
import StackGrid from 'react-stack-grid'
import Cryptog from '../components/Cryptog.js'
import MMButton from '../components/MMButton.js'
import Spinner from '../components/Spinner.js'
export default createClass({
  render(){
    let {price,id,tokens,images,compact} = this.props
    let cryptogs = []

    if(compact){
      for(let t=0;t<10;t++){
        cryptogs.push(
          <Cryptog key={"cryptog"+tokens[t]} id={tokens[t]} image={images[t]} zIndex={1}/>
        )
      }
    }else{
      for(let t=0;t<10;t++){
        cryptogs.push(
          <Spinner key={"spinner"+tokens[t]} guts={
            (spinning)=>{
              return (
                <Cryptog id={tokens[t]} slowrolling={spinning} image={images[t]} zIndex={1}/>
              )
            }
          }/>
        )
      }
    }

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
          <StackGrid
            className="stack-grid--compact"
            style={{cursor:'pointer',zIndex:5}}
            columnWidth={20}
            onClick={this.props.PackClick.bind(this,this.props.id)}
          >
            {cryptogs}
          </StackGrid>
          <div className="mt-3 mb-3" onClick={this.props.PackClick.bind(this,this.props.id)}>
            {button}
          </div>
        </div>
      )
    }else{
      return (
        <div className="row align-items-center">
          <div className="col-md-10">
            <StackGrid
              className="stack-grid"
              style={{marginTop:50,cursor:'pointer'}}
              columnWidth={70}
              onClick={this.props.PackClick.bind(this,this.props.id)}
            >
              {cryptogs}
            </StackGrid>
          </div>
          <div className="col-md-2">
            <div className="buy-wrapper">
              {button}
            </div>
          </div>
        </div>
      )
    }

  }
})
