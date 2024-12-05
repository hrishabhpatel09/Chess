import React from 'react'
import "./Components.css"

const Button = ({text,style,onClick}) => {
  return (
    <button className="fixed right-32 rounded-sm min-h-10 px-5 start-btn" onClick={onClick} style={style}>{text}</button>
  )
}

export default Button
