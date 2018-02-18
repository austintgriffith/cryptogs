import React, { Component } from 'react';
import Cryptog from './Cryptog.js'
class MyCryptogs extends Component {

  render(){
    let {myCryptogObjs,fillerCryptogs,web3} = this.props

    let mytokenlist

    if(myCryptogObjs.length>0){
      mytokenlist = myCryptogObjs.map((item)=>{

        let image = web3.utils.toAscii(item.image).replace(/[^a-zA-Z\d\s.]+/g,"");
        return (
          <div className="col-xs-2 col-md-2">
          <Cryptog image={"cryptogs/"+image} />
          </div>
        )
      })
    }else{

      mytokenlist = fillerCryptogs.map((item)=>{
        let image = item;
        return (
          <div className="col-xs-2 col-md-2">
          <Cryptog image={"cryptogs/"+image} />
          </div>
        )
      })


    }


    return (

        <div className="row">
          {mytokenlist}
        </div>
    )
  }
}

export default MyCryptogs;
