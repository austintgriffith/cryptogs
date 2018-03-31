import React, { Component } from 'react';
import createClass from 'create-react-class';
import Cryptog from '../components/Cryptog.js'

export default createClass({
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    this.handleScroll()
  },
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  handleScroll() {
    this.setState({scroll:(window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop})
  },
  render(){
    if(!this.state) return (<div></div>)
    if(this.state.scroll>1200) return  (<div></div>)
    let image = "awyinandyang.jpg"
    if(this.props.image){
      image=this.props.image
    }


    return (
      <Cryptog key={"cryptogdocscroll"} id={0} scale={1} angle={(this.state.scroll*2)%360}image={image}/>
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
