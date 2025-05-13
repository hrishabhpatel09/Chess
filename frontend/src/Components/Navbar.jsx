import React from 'react'

const Navbar = () => {
  return (
    <div className='h-24 w-full text-center text-xs font-bold text-white py-4 absolute top-0 left-0 z-10'>
      It may take some time to start Backend as it is hosted on Render and it takes time to wake up the server. Please be patient.
      Wait until you see another player in the lobby.
    </div>
  )
}

export default Navbar
