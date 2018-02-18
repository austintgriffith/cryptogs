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


      <div>Interested in Cryptogs?</div>
          <form className="form-inline">
          <div className="form-group mx-sm-3 mb-2">

          <input style={{width:300}} type="email" className="form-control" id="optionalemail" value={this.state.optional} onChange={this.change.bind(this)} placeholder="optional email" />
          </div>
          <button type="button" className="btn btn-primary mb-2" onClick={this.props.getRad.bind(this,this.state.optional)}>Get Rad</button>
          </form>
          <div style={{padding:5,opacity:0.8}}>
Enter an (optional) email and <b>get rad</b> with our smart contract.
          </div>
      </div>
    )
  }
}

export default CallOut;
