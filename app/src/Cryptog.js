import React, { Component } from 'react';
class Cryptog extends Component {
  render(){
    let size = 100;
    if(this.props.size){
      size=this.props.size
    }
    return (
      <div style={{width:size,height:size,margin:3}}>
        <div className="circle-text">
          <img className="circular-square" src={this.props.image} />
        </div>
      </div>
    )
  }
}
export default Cryptog;
