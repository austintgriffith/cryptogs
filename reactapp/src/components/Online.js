import React, { Component } from 'react';
import createClass from 'create-react-class';
import Blockies from 'react-blockies'
import StackGrid from 'react-stack-grid'
import axios from 'axios'

export default createClass({
  getInitialState(){
    return {
      online:[]
    }
  },
  componentDidMount(){
    if(this.props.api){
      setInterval(this.checkin,15000);
      setTimeout(this.checkin,5000);
      setTimeout(this.checkin,1000);
    }
  },
  async checkin(){
    if(this.props.api && this.props.api.host && this.props.api.host!="undefined"){
      console.log("Checking in...",this.props.api.host)
  		try{
  				axios.post(this.props.api.host+"/checkin", {
  					account: this.props.account,
  				})
  				.then((response)=>{
            console.log("online:",response.data)
            this.setState({online:response.data})
  				})
  				.catch(function (error) {
  					console.log(error);
  				});

  		} catch(e) {
  			console.log(e)
  		}
    }

	},
  render(){
    let online = this.state.online.map((address)=>{
      if(address&&address!="undefined"){
        return (
          <div key={"online_"+address}>
          <a target="_blank" href={"/address/"+address}>
           <Blockies
             seed={address.toLowerCase()}
             scale={3}
           />
          </a>
          </div>
        )
      }
    })
    return (

      <div className="row align-items-center" style={{width:"100%"}}>
        <div className="col-md-4">
        </div>
        <div className="col-md-4">
          <StackGrid
            style={{marginTop:10}}
            columnWidth={30}
          >
          <div>
            <img src="/cryptogs/lightclogo.png" style={{maxHeight:28,marginTop:-4}}/>
          </div>
          {online}
          </StackGrid>
        </div>
        <div className="col-md-4">
        </div>
      </div>
    )
  }
})
