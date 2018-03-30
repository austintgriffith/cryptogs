import React, { Component } from 'react';
import createClass from 'create-react-class';
import Cryptog from '../components/Cryptog.js'
import Blockies from 'react-blockies'

export default createClass({
  render(){
    let cryptogs = []

    //console.log("SIMPLESTACK",this.props)

    let count = 5
    if(this.props.count) count=this.props.count

    let tokens = []
    if(this.props.tokens){
      for(let id in this.props.tokens){
        if(this.props.tokens[id]){
          tokens.push({
            id:id,
            image:this.props.images[id]
          })
        }
      }
      count = tokens.length
    }

    let width = this.props.spacing*count
    //console.log("width",width)

    let loaderPad = 100
    if(this.props.padding){
      loaderPad=this.props.padding
    }
    let transform = ""
    let scale = 1

    //console.log("window.innerWidth",window.innerWidth,"width",width,"loaderPad",loaderPad)
    if(window.innerWidth < width+loaderPad){
      scale = (window.innerWidth/(width+loaderPad))
      transform =  "scale("+scale+")"
    }
    //console.log("SO SCALE:",scale)

    //console.log("count",count,"scale",scale,"transform",transform)



    if(tokens&&tokens.length>0){
      for(let t=0;t<tokens.length;t++){
        let clickFunction = ()=>{}
        if(typeof this.props.click == "function"){
          clickFunction = ()=>{
            this.props.click(tokens[t].id)
          }
        }
        cryptogs.push(
          <div key={"cryptog"+tokens[t].id} style={{position:"absolute",left:(t)*this.props.spacing,top:0,cursor:"pointer"}} onClick={clickFunction}>
           <Cryptog scale={this.props.scale} id={tokens[t].id} image={tokens[t].image} zIndex={1}/>
          </div>
        )
      }
    }
    else if(this.props.tokens && this.props.tokens.length>=count){
      for(let t=0;t<count;t++){
        cryptogs.push(
          <div key={"cryptog"+this.props.tokens[t]} style={{position:"absolute",left:(t)*this.props.spacing,top:0}}>
           <Cryptog scale={this.props.scale} id={this.props.tokens[t]} image={this.props.images[t]} zIndex={1}/>
          </div>
        )
      }
    }else if(this.props["_token1"]){
      for(let t=1;t<=count;t++){

        cryptogs.push(
          <div key={"cryptog"+this.props["_token"+t]} style={{position:"absolute",left:(t-1)*this.props.spacing,top:0}}>
           <Cryptog   scale={this.props.scale} id={this.props["_token"+t]} image={this.props["_token"+t+"Image"]} zIndex={1}/>
          </div>
        )
      }
    }else if(this.props.owner){
       for(let t=1;t<=count;t++){
         cryptogs.push(
           <div key={"cryptog"+this.props["token"+t]} style={{position:"absolute",left:(t-1)*this.props.spacing,top:0}}>
            <Cryptog  scale={this.props.scale} id={this.props["token"+t]} image={this.props["token"+t+"Image"]} zIndex={1}/>
           </div>
         )
       }
    }
    let button = ""

    let blockie = ""
    if(this.props.showBlockie){

      let owner = this.props.owner
      if(!owner){
        owner = this.props._sender
      }
      if(!owner){
        owner = this.props._owner
      }
      if(owner){
        blockie = (
          <div style={{position:"absolute",left:-(this.props.spacing*2/3),top:40*this.props.scale}}>
            <a target="_blank" href={"/address/"+owner}>
             <Blockies
               seed={owner.toLowerCase()}
               scale={10}
             />
            </a>
          </div>
        )
      }

    }
    let simplestackwidth = this.props.spacing*count + 100
    //console.log(simplestackwidth,this.props.spacing,count)
    let scaledPackHeight = this.props.height*Math.min(scale,this.props.scale)
    //console.log("SCALED PACK HEIGHT",scaledPackHeight)
    return (
      <div style={{transform:transform,width:"100%",height:scaledPackHeight}}>
          <div style={{position:"relative",display:"table",margin:"0 auto",left:-(simplestackwidth/2)}}>
            {blockie}
            {cryptogs}
          </div>

      </div>
    )
  }
})
