import React, { Component } from 'react';

class CallOut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optional:""
    }
  }
  change(e){
    this.setState({optional:e.target.value})
  }
  render(){

    return (

      <div style={{padding:40}}>


      <h1>Welcome to Cryptogs</h1>
          <form className="form-inline">
          <div className="form-group mx-sm-3 mb-2">

          <input style={{width:300}} type="email" className="form-control" id="optionalemail" value={this.state.optional} onChange={this.change.bind(this)} placeholder="Enter your email..." />
          </div><br/>
          <button type="button" id="mainaction" className="btn btn-primary mb-2" onClick={this.props.getRad.bind(this,this.state.optional)}>Get Cryptogs</button>
          </form>
          <div style={{padding:5,opacity:0.8}}>
Enter your email and <b>get airdropped</b> a pack of Cryptogs (Ropsten).
          </div>
          <div style={{padding:5,opacity:0.8}}>
          <a href="/prototype/">You can play with our live prototype too!</a><br/><br/>
          <div>
          <a target="_blank" href="https://github.com/austintgriffith/cryptogs">github repo</a>
          </div>
          <div>
          <a target="_blank" href="https://ropsten.etherscan.io/address/0xba88b8ee9e8ac7bbe82060f2d13095406d30ac16#code">smart contract</a>
          </div>
          </div>
      </div>
    )
  }
}

export default CallOut;
