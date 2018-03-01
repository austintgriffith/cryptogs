import React, { Component } from 'react';
import createClass from 'create-react-class';
import Cryptog from '../components/Cryptog.js'
import Slammer from '../components/Slammer.js'

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

        <div style={{position:'absolute',right:displayStackRight-145,top:45}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"unicorn.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight+95,top:-50}}>
          <Cryptog scale={displayScale} id={0} angle={131} image={"dragon.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight-75,top:-60}}>
          <Cryptog scale={displayScale} id={0} angle={105} image={"dragon.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight-160,top:-45}}>
          <Cryptog  scale={displayScale} id={0} angle={55} image={"dragon.png"}/>
        </div>


        <div style={{position:'absolute',right:displayStackRight,top:-35}}>
          <Slammer scale={displayScale} angle={45} image={"ethslammer.png"}/>
        </div>

        <div style={{position:'absolute',right:displayStackRight-110,top:0}}>
          <Cryptog angle={80} scale={displayScale} id={0} image={"fish.png"}/>
        </div>



        <div style={{position:'absolute',right:displayStackRight-60,top:55}}>
          <Cryptog angle={65} scale={displayScale} id={0} image={"ethereumlogo.png"}/>
        </div>

      </div>


    )

    let warningMessage = (
      <div className={"messageRed"} style={{opacity:0.6,marginTop:40,paddingLeft:30,color:"#666666",fontSize:15}}>
        <span style={{fontWeight:'bold'}}>Warning:</span> We are in alpha test mode. Contracts are unaudited and will be redeployed. Assets will be lost!
      </div>
    )

    if(this.props.network==1){
      warningMessage = (
        <div className={"messageRed"} style={{marginTop:40,paddingLeft:30,color:"#666666",fontSize:20}}>
          <span style={{fontWeight:'bold'}}>DANGER:</span> We are in alpha test mode. GET OFF THE MAIN NET!!!! Contracts are unaudited and will be redeployed. Assets will be lost!!! Switch to Ropsten please!
        </div>
      )
    }



    return (
      <div className={"messageGray"} style={{marginTop:85,color:"#666666",fontSize:15}}>
        <div style={{position:'relative'}}>
          <div style={{zIndex:2,fontWeight:'bold',paddingBottom:20}}>{"Whip out your slammer and get rad on the blockchain!"}</div>
          {" Born at ETHDenver, CryptoPogs is a decentralized ERC721 game. Utilizing a commit/reveal scheme for pseudorandomness, CryptoPogs gaming mechanics are all on-chain. Collect rare pogs and play live with your friends! "}
          {warningMessage}
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
