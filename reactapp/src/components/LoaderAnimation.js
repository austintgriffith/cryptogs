import React from 'react'

const LoaderAnimation = (props) => {

  const style = {
    backgroundColor: '#333'
  }

  return (
    <div className="spinner-b">
      <div style={style} className="bounce1"></div>
      <div style={style} className="bounce2"></div>
      <div style={style} className="bounce3"></div>
    </div>
  )
}
export default LoaderAnimation
