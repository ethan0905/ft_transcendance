import React, { useState, useEffect, useRef, Component } from 'react';
import UserAvatar from "./UserAvatar";
import "./UserList.css";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@mui/material';
import { SocketContext } from '../../../pages/ChatPage';
import { useContext } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//le chatId est un number, le username est un string sur la cible

// const socket = useContext(SocketContext);
interface Pop {
  buttonText: string;
}

const PopupButton: React.FC<Pop> = ({ buttonText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // console.log("click outside");
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  }

  return (
    <div>
      <i className="fa fa-ellipsis-h" aria-hidden="true" onClick={handleButtonClick}></i>
      {isOpen && (
        <div className="popup" >
          <button onClick={() => console.log("kick")/*kick()*/}>Kick</button>
          <button onClick={() => console.log("ban")/*ban()*/}>Ban</button>
          <button onClick={() => console.log("mute")/*mute()*/}>Mute</button>
        </div>
      )}
    </div>
  );
}

interface Props {
  animationDelay: number;
  active?: string;
  image?: string;
  isOnline: string;
  name: string;
  privilege: boolean;
  category: string;
}
const UserItems = ({ active, animationDelay, image, name , privilege, category}: Props) => {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const location = useLocation();

  const selectChat = (e: React.MouseEvent<HTMLDivElement>) => {
    for (let index = 0; index < e.currentTarget.parentNode!.children.length; index++) {
      (e.currentTarget.parentNode!.children[index] as HTMLElement).classList.remove("active");
    }
    e.currentTarget.classList.add("active");
  };

  async function goToProfile() {
    navigate('/Profile/' + name);
  }

  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (token !== '') {
      getUsername(token);
    }
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (cookieToken) {
			setToken(cookieToken);
		}  }, [token]);

  async function getUsername(token: string) {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/username/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `${token}`
				},
			});
			const data = await response.json();
			if (data) {
				setUsername(data.username);
			}
			return data.username;
		} catch (error) {

			console.error(error);
			// handle error
		}
  }

  return (
    <Accordion
      style={{width:"95%",backgroundColor:'rgba(52, 52, 52, 0.5)',color:'black',border:"1px solid",borderRadius:'10px', boxShadow:'none', margin:'0px', padding:'0px'}}
    >
      <AccordionSummary
        style={{backgroundColor:'rgba(255, 255, 255, 0)', margin:'0px', padding:'0px'}}
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <div style={{ animationDelay: `0.${animationDelay}s` }} className={`userlist__item ${active ? active : ""} `}>
            <div className='id_user'>
            {/* <div onClick={goToProfile} className='id_user'> */}
              <UserAvatar image={image ? image : "http://placehold.it/80x80"}/>
              <a>{name}</a>
            </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="buttons" >
          <button onClick={() => navigate('/Profile/' + name)}>See Profile</button>

          { username !== name && (
            <>
              {privilege && (category === "Admins" || category === "Members") ?<button onClick={() => socket.emit("set-admin", {username:name, chatId:Number(location.pathname.split("/")[2])})}>Set Admin</button> : null}
              {privilege && (category === "Admins" || category === "Members" || category === "Muted" ) ?<button onClick={() => socket.emit("kick", {username:name, chatId:Number(location.pathname.split("/")[2])})}>Kick</button> : null}
              {privilege && (category === "Admins" || category === "Members" || category === "Muted" ) ?<button onClick={() => socket.emit("ban", {username:name, chatId:Number(location.pathname.split("/")[2])})}>Ban</button> : null}
              {privilege && (category === "Admins" || category === "Members") ?<button onClick={() => socket.emit("mute", {username:name, chatId:Number(location.pathname.split("/")[2])})}>Mute</button> : null}
              {privilege && category === "Muted" ? <button onClick={() => socket.emit("unmute", {username:name, chatId:Number(location.pathname.split("/")[2])})}>Unmute</button> : null}
              {privilege && category === "Banned" ? <button onClick={() => socket.emit("unban", {username:name, chatId:Number(location.pathname.split("/")[2])})}>Unban</button> : null}
            </>
          )}
          
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default UserItems;