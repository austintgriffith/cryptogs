import React, { Component } from 'react';
import createClass from 'create-react-class';
import {Motion, spring, presets} from 'react-motion';
import Block from './Block.js'
import StackGrid from 'react-stack-grid'
import PogAnimation from '../components/PogAnimation.js'
import LoaderAnimation from '../components/LoaderAnimation.js'
import MMButton from '../components/MMButton.js'


let interval
let watchTransactionInterval

const extraDip = 80
const width = 700
const height = 400+extraDip

export default createClass({
  getInitialState(){
    return {
      isMinimized:false,
      blocks: [],
      foundtx: false
    }
  },
  componentDidMount(){
    interval=setInterval(this.loader,677)
    watchTransactionInterval=setInterval(this.watchTransaction,793)
    this.loader()
  },
  toggle(){
      //this.setState({isMinimized:!(this.state.isMinimized)})
  },
  async loader(){
    let {web3,blockNumber,showLoadingScreen} = this.props
    if(blockNumber){
      for(let b=0;b<10;b++){
        if(!this.state.blocks[blockNumber-b]){
          this.state.blocks[blockNumber-b] = await web3.eth.getBlock(blockNumber-b);
        }
      }
    }
  },
  async watchTransaction(){
    let {web3,loadingTx,showLoadingScreen,loadingDest} = this.props
    try{
      const transaction = await web3.eth.getTransaction(loadingTx)
      const transactionReceipt = await web3.eth.getTransactionReceipt(loadingTx)
      //console.log("ACCORDING TO web3 it is:",transaction,transactionReceipt)
      if(transaction) {
        if(!this.state.foundtx){
          console.log("Loader Found TX:",transaction)
          this.setState({foundtx:transaction})
        }
      }
      if(transactionReceipt){
        console.log("got transactionReceipt:",transactionReceipt)
        showLoadingScreen(false)
        if(loadingDest){
          if(typeof loadingDest == "function"){
            loadingDest()
          }else{
             window.location = loadingDest
          }
        }
      }
    }catch(e){console.log("LOADERERROR",e)}
  },
  componentWillUnmount(){
    clearInterval(interval)
    clearInterval(watchTransactionInterval)
  },
  render(){
    let {web3,blockNumber,etherscan,contracts} = this.props
    if(!web3||!web3.eth||!blockNumber||!contracts){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={"unicorn.png"}/></div>
      )
    }
    if(this.props.loadingTx) {
      let offset = (document.body.clientWidth-width)/2;

      let blockDisplay = []
      let avgBlockTime = 0
      let timestamps = []
      for(let b=10;b>=0;b--){
        if(this.state.blocks&&this.state.blocks[blockNumber-b]&&this.state.blocks[blockNumber-b].timestamp){
          timestamps.push(this.state.blocks[blockNumber-b].timestamp)
          //var randTx = this.state.blocks[blockNumber-b].transactions[Math.floor(Math.random() * this.state.blocks[blockNumber-b].transactions.length)];
        //  let txObf = web3.eth.getTransaction(randTx)
        }
        if(b<=3) blockDisplay.push(
          <div style={{position:'absolute',left:300-(b*100),top:0}}>
            <Block key={"block"+b} etherscan={etherscan} {...this.state.blocks[blockNumber-b]} blockNumber={blockNumber-b}/>
          </div>
        )
      }
      blockDisplay.push(
        <div style={{position:'absolute',left:400,top:0}}>
          <Block key={"waiting"} waitingFor={blockNumber+1}/>
        </div>
      )
      let total = 0;
      let count = 0;
      for(let t=0;t<timestamps.length-1;t++){
        if(timestamps[t] && timestamps[t+1]){
          let diff = timestamps[t+1]-timestamps[t];
          total+=diff;
          count++;
        }
      }


      let bottom = extraDip*-1 //height-100*-1

      let transform = ""

      let loaderPad = 80

      if(window.innerWidth < width+loaderPad){
        let scale = (window.innerWidth/(width+loaderPad))
        transform =  "scale("+scale+")"
        bottom -= (1-scale)*140
      }


      let average = Math.round(total*10/count)/10;
      if((this.state.isMinimized)){
        bottom = (height*-1)+100
      }

      let rightSideLoader = ""
      let theMessage = ""
      if(this.state.foundtx){
        rightSideLoader = (
          <LoaderAnimation/>
        )
        theMessage = (
          <span>
            Waiting for transaction <a href={etherscan+"tx/"+this.props.loadingTx} target="_Blank">{this.props.loadingTx.substr(0,10)}</a> to be mined...
          </span>
        )
      }else {
        theMessage = (
          <span>
            Waiting for the network to acknowledge transaction <a href={etherscan+"tx/"+this.props.loadingTx} target="_Blank">{this.props.loadingTx.substr(0,10)}</a>...
          </span>
        )
      }


      let bigTextStyle = {width:"100%",textAlign:"center",fontWidth:'bold',fontSize:14,padding:3}
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
                <div onClick={this.toggle} className={"messageGray"}  style={{transform:transform,zIndex:999,opacity:0.95,position:'fixed',bottom:currentStyles.bottom,left:offset,margin:'0 auto',width:width,height:currentStyles.height,backgroundColor:"#eeeeee",padding:20,border:"20px solid #dddddd"}}>
                  <div style={bigTextStyle}>
                      <div style={{opacity:0.3,float:'left',marginTop:-100,paddingLeft:30}}><LoaderAnimation/></div>
                      <div style={{opacity:0.3,float:'right',marginTop:-100,paddingRight:30}}>{rightSideLoader}</div>
                      {theMessage}
                      <div style={{marginTop:10}}></div>
                  </div>

                  <div style={{position:"relative",marginLeft:60,width:500,height:100}}>
                    {blockDisplay}
                  </div>
                  <div style={{marginTop:12}}/>
                  <div style={bigTextStyle}>Blocks are taking an average of {average} seconds plus network time.</div>
                  <div style={bigTextStyle}>Your transaction will be mined into a block based on your gas price.</div>
                  <div style={bigTextStyle}>Higher <img style={{opacity:0.5}} src="/gas.png"/> means faster trasactions.</div>
                  <div style={bigTextStyle}>Gas prices must be at least higher than the <a href="https://ethgasstation.info" target="_blank">Safe Low</a>.</div>
                  <div style={{marginLeft:150,marginTop:10}}>
                      <MMButton color={"#6081c3"} onClick={()=>{
      									window.open(etherscan+"address/"+contracts['Cryptogs']._address);
      								}}>Watch Contract Transactions</MMButton>
                  </div>
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
