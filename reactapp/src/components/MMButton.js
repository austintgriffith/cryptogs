import React from 'react'

const MMButton = (props) => {

    const buttonStyles = {
        display: 'inline-block',
        padding: '3px 12px',
        backgroundColor: props.color,
        border: 'none',
        color: '#ffffff',
        cursor: 'pointer',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '13px',
        fontWeight: '700',
        textTransform: 'uppercase',
        boxShadow: '0 2px 5px 0px rgba(0, 0, 0, 0.15)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    }

    return (
        <button style={buttonStyles} onClick={props.onClick}>
                {props.children}
        </button>
    )
}

export default MMButton
