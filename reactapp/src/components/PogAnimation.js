import React from 'react'

const PogAnimation = (props) => {

  let theclass = "coin coin--animation"
  let style = {}
  if(props.loader){
    theclass = "coin coin--animationfast"
    style={
      transform:"scale(0.4)",
      filter:"grayscale(80%)",
    }
  }

  return  (
      <div style={style}>
          <div className="coin__container coin__container--center">

              <div className={theclass}>

                  <div className="coin__front" style={{
                      backgroundImage: `url("/cryptogs/${props.image}")`
                  }}></div>

                  <div className="coin__back"></div>

                  <div className="coin__side">
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                      <div className="coin__c"></div>
                  </div>

              </div>

          </div>
      </div>
  )
}
export default PogAnimation
