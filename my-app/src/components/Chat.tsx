import React, { useEffect } from 'react'
import { useMoralis } from 'react-moralis'
import ResponsiveAppBar from './Nav'

function Chat() {
  return (
    <div
      id="tlkio"
      data-channel="headlinkers"
      data-theme="theme--minimal"
      style={{ width: 'margin-auto', height: '500px', marginTop: '5%', border: "5px" }}
    ></div>
  )
}

export default Chat;
