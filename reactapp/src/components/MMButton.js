import React from 'react'

const MMButton = (props) => {

    const buttonStyles = {
        display: 'inline-block',
        padding: '5px 17px',
        backgroundColor: props.color,
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
        <button className="grow" style={buttonStyles} onClick={props.onClick}>
                {props.children}
        </button>
    )
}

export default MMButton
