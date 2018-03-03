import React, { Component } from 'react';
import createClass from 'create-react-class';
import {Motion, spring, presets} from 'react-motion';
import Block from './Block.js'
import StackGrid from 'react-stack-grid'
import PogAnimation from '../components/PogAnimation.js'

const extraDip = 80

let interval

export default createClass({
  getInitialState(){
    return {
      isMinimized:false,
      blocks: []
    }
  },
  componentDidMount(){
    interval=setInterval(this.loader,677)
    this.loader()
  },
  toggle(){
      this.setState({isMinimized:!(this.state.isMinimized)})
  },
  async loader(){
    let {web3,blockNumber} = this.props
    if(blockNumber){
      for(let b=0;b<10;b++){
        if(!this.state.blocks[blockNumber-b]){
          this.state.blocks[blockNumber-b] = await web3.eth.getBlock(blockNumber-b);
        }
      }
    }
  },
  componentWillUnmount(){
    clearInterval(interval)
  },
  render(){
    let {web3,blockNumber,etherscan} = this.props
    if(!web3||!web3.eth||!blockNumber){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={"unicorn.png"}/></div>
      )
    }
    if(this.props.loadingTx) {
      let width = 700
      let offset = (document.body.clientWidth-700)/2;
      let height = 400+extraDip
      let bottom = extraDip*-1 //height-100*-1
      let blockDisplay = []
      let avgBlockTime = 0
      let timestamps = []
      for(let b=10;b>=0;b--){
        if(this.state.blocks&&this.state.blocks[blockNumber-b]&&this.state.blocks[blockNumber-b].timestamp){
          timestamps.push(this.state.blocks[blockNumber-b].timestamp)
          //var randTx = this.state.blocks[blockNumber-b].transactions[Math.floor(Math.random() * this.state.blocks[blockNumber-b].transactions.length)];
        //  let txObf = web3.eth.getTransaction(randTx)
        }
        if(b<=3) blockDisplay.push(<Block key={"block"+b} etherscan={etherscan} {...this.state.blocks[blockNumber-b]} blockNumber={blockNumber-b}/>)
      }
      blockDisplay.push(<Block key={"waiting"} waitingFor={blockNumber+1}/>)
      let total = 0;
      let count = 0;
      for(let t=0;t<timestamps.length-1;t++){
        if(timestamps[t] && timestamps[t+1]){
          let diff = timestamps[t+1]-timestamps[t];
          total+=diff;
          count++;
        }
      }
      let average = Math.round(total*10/count)/10;
      if((this.state.isMinimized)){
        bottom = (height*-1)+100
      }


      let bigTextStyle = {width:"100%",textAlign:"center",fontWidth:'bold',fontSize:16,padding:10}
      return (
        <Motion
          defaultStyle={{
            bottom: window.innerHeight*-1,
            height: height
          }}
          style={{
            bottom:spring(bottom,{ stiffness: 100, damping: 12 }),
            height:spring(height,{ stiffness: 100, damping: 20 }),
          }}
          >
            {currentStyles => {
              return (
                <div onClick={this.toggle} className={"messageGray"}  style={{zIndex:999,opacity:0.9,position:'fixed',bottom:currentStyles.bottom,left:offset,margin:'0 auto',width:width,height:currentStyles.height,backgroundColor:"#eeeeee",padding:20,border:"20px solid #dddddd"}}>
                  <div style={bigTextStyle}>
                      <div style={{opacity:0.3,float:'left',marginTop:-65}}><PogAnimation loader={true} image={"unicorn.png"}/></div> <div style={{opacity:0.3,float:'right',marginTop:-65}}><PogAnimation loader={true} image={"unicorn.png"}/></div>Waiting for transaction <a href={etherscan+"tx/"+this.props.loadingTx} target="_Blank">{this.props.loadingTx.substr(0,10)}</a> to be mined into the blockchain.
                  </div>

                  <StackGrid
                    style={{width:"100%",marginLeft:8}}
                    columnWidth={110}
                  >
                    {blockDisplay}
                  </StackGrid>
                  <div style={{marginTop:40}}/>
                  <div style={bigTextStyle}>Transactions are currently taking an average of {average} seconds plus network propagation.</div>
                  <div style={bigTextStyle}>Higher gas prices mean faster trasactions, but they will cost more.</div>
                </div>
              )
            }}
        </Motion>
      )
    }else{
      return (
        <div>
        </div>
      )
    }
  }
})
/*
<div style={{width:size,height:size,margin:3}}>
  <div className="circle-text">
    <img className="circular-square" src={this.props.image} />
  </div>
</div>
 */
