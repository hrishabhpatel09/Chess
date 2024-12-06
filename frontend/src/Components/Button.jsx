import React, { memo } from 'react'
import "./Components.css"

const Button = memo(({text,style,onClick}) => {
  console.log("BUtton Got rendered")
  return (
    <button className="rounded-sm self-center min-h-10 px-5 start-btn sm:ml-12" onClick={onClick} style={style}>{text}</button>
  )
})

export default Button
