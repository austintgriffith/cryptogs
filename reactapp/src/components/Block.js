import React, { Component } from 'react';
import createClass from 'create-react-class';

const height = 90
const width = 90

export default createClass({
  render(){
    let {number,gasLimit,gasUsed,hash,timestamp,transactions,etherscan,waitingFor,blockNumber} = this.props

    let textStyle = {
      fontSize:12,
      width:width,
      textAlign:'center',
      lineHeight:1.3
    }
    let blockTextStyle = {
      fontSize:10,
      width:width,
      textAlign:'center',
      lineHeight:1.3,
      opacity:0.3
    }
    let arrowStyle = {maxWidth:30,opacity:0.2}

    if(waitingFor){
      return (
        <div style={{position:'relative',width:width,height:height,backgroundColor:"#ffffff",border:"1px solid #dddddd"}}>
          <div style={{marginTop:26}}/>
          <div style={textStyle}>Waiting for</div>
          <div style={blockTextStyle}>Block</div>
          <div style={textStyle}>#{waitingFor}</div>
          <div style={{position:'absolute',left:-20,top:40,fontSize:20,letterSpacing:-1}}><img style={arrowStyle} src="/arrow.png" /></div>
        </div>
      )
    }

    if(!timestamp){
      return (
        <div style={{position:'relative',width:width,height:height,backgroundColor:"#ffffff",border:"2px solid #bbbbbb"}}>
          <div style={{marginTop:5}}/>
          <div style={blockTextStyle}>Block</div>
          <div style={textStyle}><a href={etherscan+"block/"+number} target="_Blank">#{blockNumber}</a></div>
          <div style={{position:'absolute',left:-20,top:40,fontSize:20,letterSpacing:-1}}><img style={arrowStyle} src="/arrow.png" /></div>
        </div>
      )
    }



    let gasPercentUsed = height*gasUsed/gasLimit



    return (
      <div id={number} style={{transition:"border-color 1s ease-in",position:'relative',width:width,height:height,backgroundColor:"#ffffff",border:"2px solid #bbbbbb"}}>
        <div style={{marginTop:5}}/>
        <div style={blockTextStyle}>Block</div>
        <div style={textStyle}><a href={etherscan+"block/"+number} target="_Blank">#{blockNumber}</a></div>
        <div style={textStyle}>{(Math.round(Date.now()/1000)-timestamp)}s ago</div>
        <div style={textStyle}>{Math.round(gasPercentUsed*10)/10}% gas</div>
        <div style={textStyle}>{transactions.length} txs</div>
        <div style={{position:'absolute',opacity:0.2,left:-2,bottom:-2,width:90,height:gasPercentUsed,backgroundColor:"#6081c3",border:"1px solid #dddddd"}}>
          <div style={{paddingLeft:5,fontSize:12,color:"#ffffff"}}></div>
        </div>
        <div style={{position:'absolute',left:-20,top:40,fontSize:20,letterSpacing:-1}}><img style={arrowStyle} src="/arrow.png" /></div>
      </div>
    )
  }
})
