import React, { Component } from 'react';
import createClass from 'create-react-class';
import Cryptog from '../components/Cryptog.js'


export default createClass({
  render(){

    let displayScale = 0.4
    let displayStackRight = 30

    let pogDisplay = (
      <div style={{zIndex:1,position:'absolute',right:-40,top:-90,width:300,height:200}}>

        <div style={{position:'absolute',right:displayStackRight,top:20}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"uincorn.png"}/>
        </div>
        <div style={{position:'absolute',right:displayStackRight,top:15}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"fish.png"}/>
        </div>
        <div style={{position:'absolute',right:displayStackRight,top:10}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"ethereumlogo.png"}/>
        </div>
        <div style={{position:'absolute',right:displayStackRight,top:5}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"fish.png"}/>
        </div>
        <div style={{position:'absolute',right:displayStackRight,top:0}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"unicorn.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight+120,top:35}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"fish.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight+190,top:25}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"ethereumlogo.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight+80,top:-50}}>
          <Cryptog angle={65} scale={displayScale} id={0} creeprolling={true} image={"dragon.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight-60,top:55}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"ethereumlogo.png"}/>
        </div>

      </div>


    )


    return (
      <div className={"messageGray"} style={{marginTop:65,color:"#666666",fontSize:15}}>
        <div style={{position:'relative'}}>

          <div style={{zIndex:2,fontWeight:'bold',paddingBottom:20}}>{"Whip out your slammer and get rad on the blockchain!"}</div>
          {" Born at ETHDenver, CryptoPogs is a fully decentralized ERC721 game. Utilizing a commit/reveal scheme for pseudorandomness, CryptoPogs gaming mechanics are all on-chain. Collect rare pogs and play live with your friends! "}

            <div className={"messageRed"} style={{opacity:0.7,marginTop:40,paddingLeft:40,color:"#666666",fontSize:15}}>
              <span style={{fontWeight:'bold'}}>Warning:</span> We are in alpha test mode. Contracts are unaudited. Use at your own risk!
            </div>

          {pogDisplay}

        </div>

      </div>
    )
  }
})
/*
<div style={{width:size,height:size,margin:3}}>
  <div className="circle-text">
    <img className="circular-square" src={this.props.image} />
  </div>
</div>
 */
