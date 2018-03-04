import React, { Component } from 'react';
import createClass from 'create-react-class';

export default createClass({
  getInitialState() {
    return {
      hover:false
    }
  },
  onHover(id){
    this.setState({hover:true})
  },
  offHover(id){
    this.setState({hover:false})
  },
  render(){
    let extraStyle = {}
    if(typeof this.props.click == "function" ){
      extraStyle.cursor="pointer"
    }
    return (
      <div onClick={this.props.click} style={extraStyle}>
        <div style={{marginLeft:-25}}>
          {this.props.guts(this.state.hover)}
        </div>
        <div style={{opacity:0,position:"absolute",width:"100%",height:"100%",left:0,top:0,backgroundColor:"#cccccc",zIndex:10}}
          onMouseEnter={this.onHover} onMouseOut={this.offHover}>
        </div>
      </div>
    )
  }
})
