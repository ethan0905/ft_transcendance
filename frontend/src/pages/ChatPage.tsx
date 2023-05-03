import ChatBody from '../components/Chat/ChatBody'
import Sidebar from '../components/Sidebar/Sidebar'
import { createContext } from 'react'
import {io, Socket} from 'socket.io-client'
import { useState, useEffect } from 'react'


export const SocketContext = createContext({} as Socket);

export default function ChatPage() {
  const [isConnect, setIsConnect] = useState(false);
  const [socket, setSocket] = useState(io(`${import.meta.env.VITE_BACKEND_URL}` + '/chat', {transports:["websocket"], autoConnect:false, reconnection:true,reconnectionAttempts: 3, reconnectionDelay: 1000}));

  useEffect(() => {
    if (socket.disconnected){
      socket.auth={token: document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}
      socket.connect();
      setIsConnect(true);
    }

    return () => {
      if (socket.connected)
        socket.disconnect();
    }
  }, [socket]);

  return (
    <>
      <SocketContext.Provider value={socket}>
        <Sidebar />
        <ChatBody />
      </SocketContext.Provider>
    </>
  )
}