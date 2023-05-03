import React, { Component, useContext } from 'react';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import { SocketContext } from '../../../pages/ChatPage';

const MySwal = withReactContent(Swal);

interface Props {
  animationDelay: number;
  active?: string;
  image?: string;
  isOnline: string;
  name: string;
  id_channel: number;
}

async function getChannelProtection(id: number,accessToken: string){
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${import.meta.env.VITE_BACKEND_URL}` + '/chat/channels/'+id+"/isprotected",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${accessToken}`
    }
  };
  
  const value = axios.request(config)
  .then((response) => {
    return response.data;
  })
  .catch((error) => {
    console.log(error);
    return [];
  });

  return (value);
}

const ChanItems: React.FC<Props> = ({ name, active, animationDelay, id_channel }) => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const selectChat = (e: React.MouseEvent<HTMLDivElement>) => {
    for (
      let index = 0;
      index < e.currentTarget.parentNode!.children.length;
      index++
    ) {
      (e.currentTarget.parentNode!.children[index] as HTMLElement).classList.remove(
        "active"
      );
    }
    e.currentTarget.classList.add("active");
    AlertPassword().then((password) => {
      if (password === undefined){
        socket.emit("joinNewChannel",{chatId:id_channel});
      }
      else
        socket.emit("joinNewChannel",{chatId:id_channel, Password:password});
    });
  };
  
  const AlertPassword = async () => {
    const isProtected = await getChannelProtection(id_channel,document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
    if (isProtected === false)
      return;
    // console.log("is protected:",isProtected);
    const { value: password } = await MySwal.fire({
      title: 'Enter your password',
      input: 'password',
      inputLabel: 'Password',
      inputPlaceholder: 'Enter your password',
    })
    return password;
  };

  return (
    <div style={{ animationDelay: `0.${animationDelay}s` }}
      onClick={selectChat}
      className={`chatlist__item ${active ? active : ""} `}
    >
      <div className="userMeta">
        <p>{name}</p>
      </div>
    </div>
  );
};

export default ChanItems;
