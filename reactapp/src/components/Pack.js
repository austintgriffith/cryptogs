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
          <Cryptog key={"cryptog"+tokens[t]} id={tokens[t]} image={images[t]} scale={0.55} zIndex={1}/>
        )
      }
    }else{
      for(let t=0;t<10;t++){
        cryptogs.push(
          <Spinner key={"spinner"+tokens[t]} guts={
            (spinning)=>{
              return (
                <Cryptog  id={tokens[t]} slowrolling={spinning} image={images[t]} zIndex={1}/>
              )
            }
          }/>
        )
      }
    }

    let button = (
      <div>
        <div style={{marginTop:30,opacity:0.5,fontSize:12}}>for sale</div>
        <div style={{opacity:0.9,fontSize:20,backgroundColor:"#FFFFFF"}}>Ξ{price}</div>
        <MMButton color={"#6ac360"}>Purchase</MMButton>
      </div>
    )

    if(compact){
      return (
        <div className="row">
       <div className="col-sm-9 col-md-7">
        <StackGrid
          style={{marginTop:20,cursor:'pointer',zIndex:5}}
          columnWidth={20}
          onClick={this.props.PackClick.bind(this,this.props.id)}
        >
          {cryptogs}
        </StackGrid>
        </div>
        <div className="col-sm-3 col-md-5" onClick={this.props.PackClick.bind(this,this.props.id)}>
          {button}
        </div>
        </div>
        
      )
    }else{
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

  }
})
