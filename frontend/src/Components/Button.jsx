import React, { memo } from 'react'
import "./Components.css"

const Button = memo(({text,style,onClick,...props}) => {
  console.log("BUtton Got rendered")
  return (
    <button className="rounded-md font-bold min-h-12 min-w-64 px-5 start-btn" onClick={onClick} style={style} {...props}>{text}</button>
  )
})

export default Button
