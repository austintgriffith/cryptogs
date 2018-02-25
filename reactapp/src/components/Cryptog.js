import React, { Component } from 'react';
import createClass from 'create-react-class';

export default createClass({
  render(){
    let size = 100;
    if(this.props.size){
      size=this.props.size
    }
    let angle = 25
    if(this.props.angle){
      angle=this.props.angle
    }
    let scale = 0.65
    if(this.props.scale){
      scale=this.props.scale
    }
    return (
      <div>
        <div className="coin__container" style={{
            transform: "scale("+scale+")"
        }}>

            <div className="coin" style={{
                zIndex: this.props.zIndex,
                transform:"rotateX("+angle+"deg)"
            }}>

                <div className="coin__front" style={{
                    backgroundImage: 'url("/'+this.props.image+'")'
                }}></div>

                <div className="coin__back"></div>

                <div className="coin__side">
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                    <div className="coin__c"></div>
                </div>

            </div>

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
