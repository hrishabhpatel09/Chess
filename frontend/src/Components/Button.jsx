import React, { memo } from 'react'
import "./Components.css"

const Button = memo(({text,style,onClick}) => {
  console.log("BUtton Got rendered")
  return (
    <button className="fixed right-32 rounded-sm min-h-10 px-5 start-btn" onClick={onClick} style={style}>{text}</button>
  )
})

export default Button
