import React, { Component } from 'react';
import createClass from 'create-react-class';
import Draggable from 'react-draggable';


let gasOffset = 120;


export default createClass({
  getInitialState(){
    let startingPercent = this.props.GWEI / (this.props.MAXGWEI)
    let startingPixels = 100-(startingPercent*100)
    let topSideRoom = 100-startingPixels
    let bottomSideRoom = startingPixels-100

    return {
      gweiOpacity:0.3,
      STARTINGGWEI:this.props.GWEI,
      startingPixels:startingPixels,
      bottomSideRoom:bottomSideRoom
    }
  },
  handleGasStart(){
    this.setState({gweiOpacity:0.8})
  },
  handleGasStop(){
    this.setState({gweiOpacity:0.3})
  },
  handleGasDrag(mouse,obj){
    let currentPercent = 100-(obj.y+this.state.startingPixels);
    //console.log("currentPercent",currentPercent)
    let actualGWEI = Math.round(currentPercent/100 * this.props.MAXGWEI *100,1)/100;
    //console.log("MAXGWEI",this.props.MAXGWEI)
    if(actualGWEI<this.props.MINGWEI) actualGWEI=this.props.MINGWEI;
    if(actualGWEI>this.props.MAXGWEI) actualGWEI=this.props.MAXGWEI;
    this.props.setGWEI(actualGWEI)
  },
  render(){
    return (
      <div className={"messageBorder"} style={{zIndex:1000,position:'fixed',height:80,bottom:-5,left:10,width:45,height:130}}>
        <Draggable axis="y" bounds={{top:this.state.startingPixels*-1,bottom:this.state.bottomSideRoom*-1}}
          onDrag={this.handleGasDrag}
          onStart={this.handleGasStart}
          onStop={this.handleGasStop}
        >
          <div style={{
            cursor:"pointer",
            width:30,
            height:28,
            backgroundImage:"url('/gas.png')",
            position:"absolute",top:this.state.startingPixels,
            opacity:0.6
          }}>
            <div style={{opacity:this.state.gweiOpacity,position:'absolute',left:43,fontSize:14,width:50}} >
              {this.props.GWEI}<span style={{fontSize:9}}>gwei</span>
            </div>
          </div>
        </Draggable>
      </div>
    )
  }
})
