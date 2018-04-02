
import React, { Component } from 'react';


class MMButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked:false
    }
  }
  click(){
    if(!this.state.clicked){
      this.setState({clicked:true})
      setTimeout(()=>{
        this.setState({clicked:false})
      },5000)
      this.props.onClick.apply( this, arguments );
    }


  }
  render(){
    let color = this.props.color
    if(this.state&&this.state.clicked){
      color = "#999999"
    }

    const buttonStyles = {
        display: 'inline-block',
        padding: '5px 17px',
        backgroundColor: color,
        border: 'none',
        color: '#ffffff',
        cursor: 'pointer',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16px',
        fontWeight: '700',
        textTransform: 'uppercase',
        boxShadow: '0 2px 5px 0px rgba(0, 0, 0, 0.25)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    }

    return (
        <button className="grow" style={buttonStyles} onClick={this.click.bind(this)}>
                {this.props.children}
        </button>
    )
  }


}

export default MMButton
