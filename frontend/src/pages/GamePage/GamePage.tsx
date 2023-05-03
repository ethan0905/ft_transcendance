import './gamePage.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import { io, Socket } from 'socket.io-client';
import { useDebugValue, useEffect, useState } from 'react';
import { createContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate} from 'react-router-dom';
import PlayPage from './PlayPage.tsx';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import withReactContent from 'sweetalert2-react-content';
export const SocketContext = createContext({} as Socket);
interface TableProps {
  data: {
	player1: string;
	player2: string;
	player1_score: number;
	player2_score: number;
	name: string;
	game: any;
  }[];
}

const MySwal = withReactContent(Swal);

const GameTable = (props: TableProps) => {
  const { data } = props;
  const navigate = useNavigate();

  return (
	<div className='tableau'>
	  <table>
			<thead>
				<tr>
					<th colSpan={6} className='maintitleTab'>Live Matches</th>
				</tr>
				<tr className='titlesTab'>
					<th>#</th>
					<th className='cellPlayer'>P1</th>
					<th></th>
					<th className='cellPlayer'>P2</th>
					<th>Score</th>
					<th>Watch</th>
				</tr>
			</thead>
			<tbody>
				{data.map((item, index) => (
					<tr className='lineTab' key={index}>
						<td>{index + 1}</td>
						<td>{item.player1}</td>
						<td>VS</td>
						<td>{item.player2}</td>
						<td>{item.game.player1_score+ ":"+ item.game.player2_score}</td>
						{/* <td>{item.name}</td> */}
						<td onClick={() => {navigate(item.name)}}>link</td>
					</tr>
				))}
				{Array(7 - data.length).fill('').map((item, index) => (
				<tr key={data.length + index}>
					<td className='lineTab'>-</td>
					<td className='lineTab'>-</td>
					<td className='lineTab'>VS</td>
					<td className='lineTab'>-</td>
					<td className='lineTab'>-</td>
					<td className='lineTab'>unavailable</td>
				</tr>
				))}

			</tbody>
	  </table>
	</div>
  );
};

async function getRooms() {
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `${import.meta.env.VITE_BACKEND_URL}/ws-game/rooms`,
		headers: {}
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

const NoOpponentPopUp = () => MySwal.fire({
	title: 'No opponent found',
	text: 'Nobody want play?',
})

const matchmakingPopUp = (socket:Socket) => MySwal.fire({
		title: 'Searching for an opponent...',
		allowOutsideClick: false,
		allowEscapeKey: false,
		allowEnterKey: false,
		showConfirmButton: false,
		showCancelButton: true,
		timer: 60000,
		timerProgressBar: true,
	}).then((result) => {
	if (result.dismiss === Swal.DismissReason.timer) {
		socket.emit("cancelMatchmaking");
		NoOpponentPopUp();
	}
	else if (result.dismiss === Swal.DismissReason.cancel) {
		socket.emit("cancelMatchmaking");
	}
});

export default function GamePage() {
	const [socket, setSocket] = useState(io(`${import.meta.env.VITE_GAME_URL}` + "/ws-game", {transports:["websocket"], autoConnect:false, reconnection:true,reconnectionAttempts: 3, reconnectionDelay: 1000}));
	// const data = [];
	let location = useLocation();
	const navigate = useNavigate();
	const [token, setToken] = useState<string>("");
	const [data, setData] = useState<any>([]);

	useEffect(() => {
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (!cookieToken) {
			setToken("prout");
		}
		else
			setToken(cookieToken);
		getRooms().then((values) => {
			const rooms:any = Object.values(values);
			setData(rooms);
		})
	},[token]);

	useEffect(() => {
		if (socket.disconnected && token !== ''){
			socket.auth = {token: token};
			socket.connect();
		}
	},[socket, token]);

	useEffect(() => {
		socket.on("RoomCreated", (value:any) => {
			setData((rooms:any) => {
				for (var i in rooms) {
					if (rooms[i].name === value.name) {
						return rooms;
					}
				}
				return [...rooms, value];
			});
		})
		
		socket.on("FindGame", (value:any) => {
			// console.log("FindGame: " + value)
			Swal.close();
			navigate(value);
		});


		socket.on("RoomDeleted", (value:string) => {
			setData((rooms:any)=>{
				let tab = rooms.filter((room:any,index:any) => room.name !== value);
				// console.log(tab);
				// console.log(value);
				return (tab);
			})
		});

		return (() =>{
			socket.off("RoomCreated");
			socket.off("FindGame");
			socket.off("RoomDeleted");
			socket.disconnect();
		})
	}, [socket, token, navigate])

	const [checked, setChecked] = useState(false);

	useEffect(() => {
		if (token !== '') {
			checkThemeStatus(token).then((value) => {
				if (value) {
					setChecked(true);
				}
			});
		}
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (cookieToken) {
			setToken(cookieToken);
		}
	}, [token]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

		setChecked(event.target.checked);
		// console.log("status: ", !checked);
		fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/theme/edit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token, status: !checked })
		})
	};

	async function checkThemeStatus(accessToken: string): Promise<any> {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/theme/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `${accessToken}`
				},
			});
			const data = await response.json();

			// console.log("theme ==== ", data.theme);

			return data.theme;
		} catch (error) {

			console.error(error);
			// handle error
		}
	}

	return (
	<>
		<SocketContext.Provider value={socket}>
			<Sidebar />
			{location.pathname === '/Game' ?
				<div className='GamePage'>
					<GameTable data={data} />

					<div className="btn-container">
					<FormControlLabel control={
							<Switch
								checked={checked}
								onChange={handleChange} 
								inputProps={{"aria-label": "controlled"}}
						/>} label={
							checked ?
							"Map: Konoha"
							: "Map: Default"} />
						{/* <label className="switch btn-color-mode-switch">
							<input type="checkbox" name="map_mode" id="map_mode" value="1"/>
							<label data-on="Special" data-off="Default" className="btn-color-mode-switch-inner"></label>
						</label> */}
					</div>

					<div className='ButtonPlay' onClick={() => {
						socket.emit("matchmaking")
						matchmakingPopUp(socket);
					}}>
						<img src="/rasengan.png" alt='ImgButton' id='ImgButton'/>
						<span id='textPlay'>PLAY</span>
					</div>
				</div>:
				<PlayPage />
			}
		</SocketContext.Provider>
	</>
	);
}