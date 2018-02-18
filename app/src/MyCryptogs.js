import React, { Component } from 'react';
import Cryptog from './Cryptog.js'
class MyCryptogs extends Component {

  render(){
    let {myCryptogObjs,web3} = this.props

    let mytokenlist = myCryptogObjs.map((item)=>{

      let image = web3.utils.toAscii(item.image).replace(/[^a-zA-Z\d\s.]+/g,"");
      return (
        <div className="col-xs-2 col-md-2">
        <Cryptog image={"cryptogs/"+image} />
        </div>
      )
    })

    return (
      <div style={{width:'100%',margin: "0 auto",background:"#ffffff",border:'1px solid #BBBBBB',padding:10}}>
        <div className="row">
          {mytokenlist}
        </div>
      </div>
    )
  }
}

export default MyCryptogs;
