import React, { useContext, useEffect, createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatList from './ChanList/ChanList';
import ChatContent from './ChatContent/ChatContent';
import UserList from './UserList/UserList';
import './ChatBody.css';
import { useLocation, useNavigate} from 'react-router-dom';
import { SocketContext } from '../../pages/ChatPage';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ChatBody: React.FC = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  let location = useLocation();

  useEffect(() => {
    socket.on("error",(value:string) =>{
      navigate('/Chat');
      Alert(value);
    })
    return () => {
      socket.off("error");
    }
  },[])

  const Alert = (value:string) =>{
    MySwal.fire({
      icon: 'error',
      title: 'Oops...',
      text: value,
    })
  }

  return (
    <div className='main__chatbody'>
      <ChatList />
      {location.pathname === '/Chat' ? null :
        (
          <>
            <ChatContent/>
            <UserList/>
          </>
        )}
    </div>
  );
};

export default ChatBody;