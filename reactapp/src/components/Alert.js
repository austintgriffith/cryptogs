import React, { Component } from 'react';
import createClass from 'create-react-class';
import {Motion, spring, presets} from 'react-motion';


const extraDip = 80

const height = 300

let interval

export default createClass({
  getInitialState(){
    return {
      isMinimized:false,
    }
  },
  toggle(){
      this.setState({isMinimized:!(this.state.isMinimized)})
  },
  render(){
    let {message} = this.props



      let width = 700
      let offset = (document.body.clientWidth-700)/2;
      let adjustedheight = height+extraDip
      let top = extraDip*-1 //height-100*-1
      let bigTextStyle = {width:"100%",textAlign:"center",fontWidth:'bold',fontSize:16,padding:10,marginBottom:10}


      if(!message){
        top=-500
      }

      return (
        <Motion
          defaultStyle={{
            top: window.innerHeight*-1,
            height: adjustedheight
          }}
          style={{
            top:spring(top,{ stiffness: 100, damping: 12 }),
            height:spring(height,{ stiffness: 100, damping: 20 }),
          }}
          >
            {currentStyles => {
              return (
                <div onClick={this.toggle} className={"messageGray"}  style={{zIndex:999,opacity:0.9,position:'fixed',top:currentStyles.top,left:offset,margin:'0 auto',width:width,height:currentStyles.height,backgroundColor:"#eeeeee",padding:20,border:"20px solid #dddddd"}}>
                    <div style={{paddingBottom:height/4}}></div>
                    {message}
                </div>
              )
            }}
        </Motion>
      )

  }
})
