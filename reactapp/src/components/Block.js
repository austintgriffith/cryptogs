import React, { Component } from 'react';
import createClass from 'create-react-class';

const height = 100
const width = 100

export default createClass({
  render(){
    let {number,gasLimit,gasUsed,hash,timestamp,transactions,etherscan,waitingFor,blockNumber} = this.props

    let textStyle = {
      fontSize:12,
      width:width,
      textAlign:'center',
      lineHeight:1.3
    }

    if(waitingFor){
      return (
        <div style={{position:'relative',width:width,height:height,backgroundColor:"#ffffff",border:"1px solid #dddddd"}}>
          <div style={{marginTop:8}}/>
          <div style={textStyle}>Waiting for</div>
          <div style={textStyle}>Block</div>
          <div style={textStyle}>#{waitingFor}</div>
          <div style={{position:'absolute',left:-20,top:40,fontSize:20,letterSpacing:-1}}>{"-->"}</div>
        </div>
      )
    }

    if(!timestamp){
      return (
        <div style={{position:'relative',width:width,height:height,backgroundColor:"#ffffff",border:"1px solid #dddddd"}}>
          <div style={{marginTop:8}}/>
          <div style={textStyle}>Block</div>
          <div style={textStyle}><a href={etherscan+"block/"+number} target="_Blank">#{blockNumber}</a></div>
          <div style={{position:'absolute',left:-20,top:40,fontSize:20,letterSpacing:-1}}>{"-->"}</div>
        </div>
      )
    }



    let gasPercentUsed = height*gasUsed/gasLimit



    return (
      <div id={number} style={{transition:"border-color 1s ease-in",position:'relative',width:width,height:height,backgroundColor:"#ffffff",border:"1px solid #dddddd"}}>
        <div style={{marginTop:8}}/>
        <div style={textStyle}>Block</div>
        <div style={textStyle}><a href={etherscan+"block/"+number} target="_Blank">#{blockNumber}</a></div>
        <div style={textStyle}>{(Math.round(Date.now()/1000)-timestamp)}s ago</div>
        <div style={textStyle}>{Math.round(gasPercentUsed*10)/10}% gas</div>
        <div style={textStyle}>{transactions.length} txs</div>
        <div style={{position:'absolute',opacity:0.25,left:0,bottom:0,width:100,height:gasPercentUsed,backgroundColor:"#bbcccc",border:"1px solid #dddddd"}}>
          <div style={{paddingLeft:5,fontSize:12,color:"#ffffff"}}></div>
        </div>
        <div style={{position:'absolute',left:-20,top:40,fontSize:20,letterSpacing:-1}}>{"-->"}</div>
      </div>
    )
  }
})
