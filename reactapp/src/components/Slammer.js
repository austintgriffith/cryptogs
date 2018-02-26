import React, { Component } from 'react';
import createClass from 'create-react-class';

export default createClass({
  render(){

    let angle = 65
    if(this.props.angle){
      angle=this.props.angle
    }

    let style = {
        zIndex: 90,
        transform:"rotateX("+angle+"deg)",
    }
    if(this.props.spinning){
      style["animation"] = "spinY 1s infinite";
      style["animationTimingFunction"] ="linear";
    }

    let scale = 1
    if(this.props.scale){
      scale=this.props.scale
    }

    return(
      <div>
          <div className="slammer__container" style={{
              transform: "scale("+scale+")"
          }}>



              <div className={"slammer"} style={style}>

                  <div className="slammer__front" style={{
                      backgroundImage: 'url("/cryptogs/'+this.props.image+'")'
                  }}></div>

                  <div className="slammer__back"></div>

                  <div className="slammer__side">
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                      <div className="slammer__c"></div>
                  </div>

              </div>

          </div>
      </div>
    )
  }
})
