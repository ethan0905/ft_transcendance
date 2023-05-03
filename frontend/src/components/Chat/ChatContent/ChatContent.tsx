import React, { useState, useEffect, useRef, useContext} from "react";
import ChatItem from "./ChatItem";
import "./ChatContent.css";
import { SocketContext } from '../../../pages/ChatPage';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import withReactContent from 'sweetalert2-react-content';
import CSS from 'csstype';

const MySwal = withReactContent(Swal);
interface FormValues {
  // name: string;
  password: string;
}

const initialFormValues: FormValues = {
  // name: '',
  password: '',
};

const FormButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const socket = useContext(SocketContext);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // console.log('Form submitted:', formValues);
    let id = Number(location.pathname.split("/")[2]);
    socket.emit('update', { channelid:id, Password:formValues.password, username: username})
    // setFormValues(initialFormValues);
    setIsOpen(false);
  }
  const [token, setToken] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (token !== ''){
      getUsername(token);
    }
    let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieToken) {
      setToken(cookieToken);
    }
  }, [token]);
  
  async function getUsername(accessToken: string): Promise<any> {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/username/get', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${accessToken}`
          },
        });
        const data = await response.json();
        if (data) {
          setUsername(data.username);
        }
        // return data;
      } catch (error) {
  
        console.error(error);
        // handle error
      }
    }

  return (
    <div  >
      <i className="btn-nobg fa fa-cog" onClick={() => setIsOpen(true)}></i>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
            <form onSubmit={handleSubmit}>
            {/* <div className="form-group"> */}
              {/* <label htmlFor="name">Edit name:</label> */}
              {/* <input type="text" name="name" value={formValues.name} onChange={handleChange}/> */}
            {/* </div> */}
            <div className="form-group">
              <label htmlFor="email">Edit password:</label>
              <input type="password" name="password" value={formValues.password} onChange={handleChange} />
            </div>
              <button type="submit" >Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

async function getAllMessages(id_channel:number, accessToken:string){
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${import.meta.env.VITE_BACKEND_URL}` + '/chat/channels/' + id_channel+"/msg",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${accessToken}`
    }
  };
  
  const value = axios.request(config)
  return (value);
}

async function getChannelName(id_channel:number, accessToken:string){
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${import.meta.env.VITE_BACKEND_URL}` + '/chat/channels/' + id_channel+"/name",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${accessToken}`
    }
  };
  
  const value = axios.request(config)
  return (value);
}

type ChatItm = {
  id: number,
  createdAt: string,
  message: string,
  userId: number,
  channelId: number,
  owner:any
};

type ChatContentProps = {};

const AlertNotAllowed = () => MySwal.fire({
  title: 'You are not allowed to access this channel',
  icon: 'error',
  confirmButtonText: 'Ok',
  confirmButtonColor: '#ff0000',
});

const AlertYouAreBanned = () => MySwal.fire({
  title: 'You are banned from this channel',
  icon: 'error',
  confirmButtonText: 'Ok',
  confirmButtonColor: '#ff0000',
});

const AlertYouAreKicked = () => MySwal.fire({
  title: 'You are kicked from this channel',
  icon: 'error',
  confirmButtonText: 'Ok',
  confirmButtonColor: '#ff0000',
});

const AlertSuccessfulQuit = () => MySwal.fire({
  title: 'You have quit this channel',
  icon: 'success',
  confirmButtonText: 'Ok',
  confirmButtonColor: '#ff0000',
});

const AlertYouCannotLeaveDM = () => MySwal.fire({
  title: 'You Cannot Leave DM',
  icon: 'error',
  confirmButtonText: 'Ok',
  confirmButtonColor: '#ff0000',
});

export default function ChatContent(props: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  let location = useLocation();
  const socket = useContext(SocketContext);
  const [channel_name,setChannel_name] = useState<string>("Channel Name")
  const [chat, setChat] = useState<ChatItm[]>([]);
  const [msg, setMsg] = useState<string>('');
  const [userID, setUserID] = useState<number>()
  const [token, setToken] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    if (token !== ''){
      getUserId(token);
    }
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (cookieToken) {
			setToken(cookieToken);
		}
	}, [token]);

  useEffect(() => {
    socket.on("DM:quit",() => {
      AlertYouCannotLeaveDM();
    })

    socket.on("banned", (value:any) => {
      let id = Number(location.pathname.split("/")[2]);
      if (id !== value.chatId)
        return;
      AlertYouAreBanned();
      navigate('/Chat');
    });

    socket.on("kicked", (value:any) => {
      let id = Number(location.pathname.split("/")[2]);
      if (id !== value.chatId)
        return;
      AlertYouAreKicked();
      navigate('/Chat');
    });

    socket.on("quited", (value:any) => {
      let id = Number(location.pathname.split("/")[2]);
      if (id !== value.chatId)
        return;
      AlertSuccessfulQuit();
      navigate('/Chat');
    })
    return () => {
      socket.off("DM:quit");
      socket.off("banned");
      socket.off("kicked");
      socket.off("quited");
    }
  }, [socket])
  function clearInput() {
    setMsg("");
  }
  
  async function getUserId(accessToken: string): Promise<any> {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/id/get', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${accessToken}`
          },
        });
        const data = await response.json();
        if (data) {
          setUserID(data.id);
        }
      } catch (error) {
        console.error(error);
      }
    }

  useEffect(() => {
    socket.on("NewMessage", (value:any) => {
      let id = Number(location.pathname.split("/")[2]);
      if (id !== value.channelId)
        return;
      setChat(chats => {
        for (var i in chats){
          if (chats[i].id === value.id){
            return chats;
          }
        }
        return ([...chats, value]);
      })
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    })

    socket.on("NewPartyCreated", (value:string) => {
      navigate("/Game/"+value);
    })

    return () => {
      socket.off("NewMessage");
    }
  },[location.pathname, socket]) // mistake was here

  const onStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  useEffect(() => {
    if (location.pathname !== "/Chat" && token !== ''){
      let id = Number(location.pathname.split("/")[2]);
      // console.log("id: ", id);
      getAllMessages(id, token).then((values:any) => {
        setChat(values.data);
        socket.emit("JoinChannel", id);
      }).catch((error:any) => {
        if (error.response.status === 403) {
          AlertNotAllowed();
          navigate('/Chat');
        }
      });
      getChannelName(id, token).then((values:any) => {
        setChannel_name(values.data.channelName);
      })
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      getIsAdmin(id, token);
    }
  }, [location.pathname, token]) //mistake was here
  
  async function getIsAdmin(id: number, accessToken: string): Promise<any> {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + `/chat/channels/${id}/isAdmin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${accessToken}`
          },
        });
        const data = await response.json();
        // console.log("is admin ? ", data);
        if (data) {
          setIsAdmin(data);
        }
        // setIsAdmin(data);
        return data;
      } catch (error) {
        console.error(error);
      }
    }

  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (token !== ''){
      getUsername(token);
    }
    let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieToken) {
      setToken(cookieToken);
    }
  }, [token]);
  
  async function getUsername(accessToken: string): Promise<any> {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me/username/get`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${accessToken}`
          },
        });
        const data = await response.json();
        if (data) {
          setUsername(data.username);
        }
        // return data;
      } catch (error) {
  
        console.error(error);
        // handle error
      }
    }

  return (  <div className="main__chatcontent">
        
  <div className="content__header">
    <div></div>
    <h1>{channel_name}</h1>
    { isAdmin === true ? (
      <FormButton/>
    ) : (
      <div></div>
    )}
  </div>

  <div className="content__body">
    {chat.map((itm, index) => {
      return (
        <ChatItem
          animationDelay={index + 2}
          key={index}
          user={itm.userId === userID ? "me" : "other"}
          msg={itm.message}
          image={itm.owner.avatarUrl}
          username={itm.owner.username}
          time={itm.createdAt}
        />
      );
    })}
    <div ref={messagesEndRef} />
  </div>
  
  <div className="sendNewMessage">
    <input type="text" placeholder={"Type a message here"}
      onChange={onStateChange}
      value={msg}
      onFocus={() => {return false;}}
      onKeyDown={(e) => { if (e.key === 'Enter') {
        clearInput();
        socket.emit("sendMsgtoC", {
          "chatId":Number(location.pathname.split("/")[2]),
          "msg":msg
        })
      }}}
    />
    <button className="btnSendMsg" id="sendMsgBtn" onClick={() => {
      clearInput();
      socket.emit("sendMsgtoC", {
        "chatId":Number(location.pathname.split("/")[2]),
        "msg":msg
      })
    }}><i className="fa fa-paper-plane"></i></button>
  </div>

</div>
);
}