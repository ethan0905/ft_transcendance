import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChanList.css';
import ChanItems from './ChanItems';
import axios from 'axios';
import { SocketContext } from '../../../pages/ChatPage';
import { useContext } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import withReactContent from 'sweetalert2-react-content';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const MySwal = withReactContent(Swal);

async function getAllChannels(accessToken:string) {
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `${import.meta.env.VITE_BACKEND_URL}` + '/chat/channels/',
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

function MenuChat({name, channels}:{name:string, channels:any}){
	return (
		<Accordion style={{
			width:"95%",
			backgroundColor: '#ffffff9d',
			color:'black',
			borderRadius:'10px',
		}}>
			<AccordionSummary aria-controls="panel1a-content" id="panel1a-header"
				style={{backgroundColor:'white', borderRadius:'10px',}}
				expandIcon={<ExpandMoreIcon />}
			>
				<Typography>{name}</Typography>
			</AccordionSummary>
			<AccordionDetails
				style={{padding:"0px", display:"flex", flexDirection:"column", alignItems:"center"}}
				>
				<div className="chatlist__items">
					
					{channels.map((item:any, index:number) => {
						// console.log(item.channelName);
						// console.log(item.id);
						return (
							<ChanItems
							name={item.channelName}
							id_channel={item.id}
							key={item.id}
							animationDelay={index + 1}
							active={item.active ? "active" : ""}
							isOnline={item.isOnline ? "active" : ""}
							/>
							);
						})}
				</div>
			</AccordionDetails>
		</Accordion>
	);
}

const FormButton = () => {
	const socket = useContext(SocketContext)
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);
	const [username, setUsername] = useState('');
	const [token, setToken] = useState('');

	useEffect(() => {
		if (token !== '') {
			// console.log("Le token est valide !", token);
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

	const handleSubmit = (e: any) => {
		e.preventDefault();
		getUsername(token);
		// console.log(`Name: ${name}, Password: ${password}, Private: ${isPrivate}, Username: ${username}`);
		if (name !== '' && name.trim().length > 0) {
			socket.emit("create channel", {chatName:name, Password:password, isPrivate:isPrivate, username:username})
		}
		setIsOpen(false);
	}

	const handleInputChange = (e: any) => {
		const { name, value, checked } = e.target;
		if (name === 'name') {
			setName(value);
		} else if (name === 'password') {
			setPassword(value);
		} else if (name === 'isPrivate') {
			setIsPrivate(checked);
		}
	}

	return (
		<>
			<button className="btn" onClick={() => setIsOpen(true)}>
				<i className='fa fa-plus'> </i>
				<span>Create Channel</span>
			</button>

			{isOpen && (
				<div className="modal">
					<div className="modal-content">
						<span className="close" onClick={() => setIsOpen(false)}>&times;</span>
						<form onSubmit={handleSubmit}>
							<input type="text" id="name" name="name" placeholder={"Channel Name"} value={name} onChange={handleInputChange} className="channel_input" maxLength={20} />
							<input type="password" id="password" name="password" placeholder={"Password"} value={password} onChange={handleInputChange} className="channel_input" maxLength={10} />
							<div style={{display:'flex', justifyContent: 'space-between'}}>
								<FormControlLabel control={<Checkbox checked={isPrivate} onChange={handleInputChange} name='isPrivate'/>}  onChange={handleInputChange} label="Private" />
								<button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-7' type="submit">Create</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

interface Channel {
	id: number;
	channelName: string;
	active: boolean;
	isOnline: boolean;
}
async function getNewDmUsers(accessToken: string): Promise<any> {
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `${import.meta.env.VITE_BACKEND_URL}` + "/chat/Dm/users",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `${accessToken}`
		}
	};

	const value = await axios.request(config).then((value:any) => {
		return value.data;
	}).catch(() => {
		return [];
	})
	return (value);
}

const CreateDm = async (token:string) => {
	const listUsers = await getNewDmUsers(token);
	const selection = await MySwal.fire({
		title: 'New DM',
		input: 'select',
		inputOptions: listUsers,
		inputPlaceholder: 'Select contact',
		showCancelButton: true,
	})
	return {confirm: selection.isConfirmed, value:listUsers[Number(selection.value)]};
}

export default function ChanList() {
	const [name, setName] = useState('');
	const socket = useContext(SocketContext)
	const [myChannels, setMyChannels] = useState<Channel[]>([]);
	const [myDms, setMyDms] = useState<Channel[]>([]);
	const [channelsToJoin, setChannelToJoin] = useState<Channel[]>([]);
	const [username, setUsername] = useState<string>()
	const navigate = useNavigate();
	const [token, setToken] = useState('');

	useEffect(() => {
		if (token !== '') {
			// console.log("Le token est valide !", token);
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

	useEffect(() => {
		socket.on("DM Created", (value:any) => {
			setMyDms(data => {
				for (var i in data){
					if (data[i].id === value.id)
						return data;
				}
				return ([...data, value]);
			});
			// console.log("New Channel");
		});
		socket.on("Channel Created", (value:any) => {
			if (value.client_id === socket.id){
				setMyChannels(data => {
					for (var i in data){
						if (data[i].id === value.id)
							return data;
					}
					return ([...data, value]);
				});
			}
			else{
				setChannelToJoin(data => {
					for (var i in data){
						if (data[i].id === value.id)
							return data;
					}
					return ([...data, value]);
				});
			}
			// console.log("New Channel");
		});

		socket.on("Joined", (value:any) => {
			let channel:any = undefined;
			setChannelToJoin(data => {
				for (var i in data){
					if (data[i].id === value.chatId){
						channel = data[i];
						return data.filter((channel: Channel) => channel.id !== value.chatId);
					}
				}
				return data;
			});
			if (channel === undefined){
				navigate("/chat/"+value.chatId);
				return;
			}
			setMyChannels(data => {
				for (var i in data){
					if (data[i].id === value.id)
						return data;
				}
				return ([...data, {channelName:channel.channelName, id:channel.id, active:false, isOnline:false}]);
			});
			navigate("/chat/"+value.chatId);
		}
		);

		socket.on("kicked", (value:any) => {
			let channel:any = undefined;
			setMyChannels(data => {
				for (var i in data){
					if (data[i].id === value.chatId){
						channel = data[i];
						return data.filter((channel: Channel) => channel.id !== value.chatId);
					}
				}
				return data;
			});
			if (channel === undefined){
				return;
			}
			setChannelToJoin(data => {
				for (var i in data){
					if (data[i].id === value.id)
						return data;
				}
				return ([...data, {channelName:channel.channelName, id:channel.id, active:false, isOnline:false}]);
			});
		});
		socket.on("banned", (value:any) => {
			setMyChannels(data => {
				return data.filter((channel: Channel) => channel.id !== value.chatId);
			});
			setChannelToJoin(data => {
				return data.filter((channel: Channel) => channel.id !== value.chatId);;
			});
		});
		socket.on("quited", (value:any) => {
			let quitedChan:any = undefined;
			setMyChannels(data => {
				for (var i in data){
					if (data[i].id === value.chatId){
						quitedChan = data[i]
						return data.filter((channel: Channel) => channel.id !== value.chatId);
					}
				}
				return data;
			});
			if (quitedChan === undefined)
				return;
			setChannelToJoin(data => {
				for (var i in data){
					if (data[i].id === value.id)
						return data;
				}
				return ([...data, {channelName:quitedChan.channelName, id:quitedChan.id, active:false, isOnline:false}]);
			});
		});

		socket.on("invited", (value:any) => {
			setChannelToJoin(data => {
				for (var i in data){
					if (data[i].id === value.chatId)
						return data;
				}
				return [...data, {channelName:value.channelName, id:value.chatId, active:false, isOnline:false}];
			});
		})
		return () => {
			socket.off("DM Created");
			socket.off("Channel Created");
			socket.off("Joined");
			socket.off("kicked");
			socket.off("banned");
			socket.off("quited");
			socket.off("invited");
		}
	}, [socket]);
	
	useEffect(() => {
			// getUsername();
		if (token !== ''){
			getAllChannels(token).then((value: any) => {
				// console.log(value);
				setMyDms(value.MyDms)
				setMyChannels(value.MyChannels);
				setChannelToJoin(value.ChannelsToJoin);
			})
		}
	}, [token]);

	return (
		<div className="main__chatlist">

			<div className="chatlist__heading">
				<h2>Channels</h2>
			</div>
			<button className='btn' onClick={() => {
				CreateDm(token).then((values:any) => {
					if (values.confirm)
						socket.emit("CreateDm", {username:values.value});
				})
			}}>
				<i className='fa fa-plus'> </i>
				<span>Private Message</span>
			</button>

			<FormButton /> {/* Button Create Channel */}

			<div className='accordion-chats'>
					<MenuChat name={"Private Messages"} channels={myDms}/>
					<MenuChat name={"My Channels"} channels={myChannels}/>
					<MenuChat name={"Channels to Join"} channels={channelsToJoin}/>
			</div>
		</div>
	);
}
