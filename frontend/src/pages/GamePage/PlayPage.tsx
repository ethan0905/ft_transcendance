import { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from './GamePage.tsx';
import { Socket } from 'socket.io-client';
import data from './game_data.ts';
import { useParams } from 'react-router-dom';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

async function fetchRole(id_game:string, token:string){
	const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + "/ws-game/rooms/"+ id_game +"/role", {
		method:'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization':token,
		}
	});
	const data = await res.json();
	return data;
}

// THEME 1: Konoha
// const COLOR_P1 = 'rgba(0, 255, 178, 1)'; // green
// const COLOR_P2 = 'rgba(255, 114, 0, 1)';// orange
// const COLOR_BALL = 'white';
// const MAP_BG = '../../public/konoha.jpg';

// THEME 2: Endvalley
// const COLOR_P1 = 'rgba(0, 0, 255, 1)'; // blue
// const COLOR_P2 = 'rgba(255, 0, 0, 1)'; // red
// const COLOR_BALL = 'yellow';
// const MAP_BG = '../../public/endvalley.png';

// const MAP_BG = '../../public/404notfound.jpg';

function drawBall(canvas:HTMLCanvasElement, ballColor:string){
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;//console.log("ctx is null");
	ctx.beginPath();
	// console.log("x: " + data.ballObj.x + " y: " + data.ballObj.y + " radius: " + data.ballObj.radius)
	ctx.arc(canvas.width * data.ballObj.x, canvas.height * data.ballObj.y, canvas.width * data.ballObj.radius, 0, 2 * Math.PI);
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();
}

function drawPlayer(canvas:HTMLCanvasElement, player1Color:string, player2Color:string){
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;//console.log("ctx is null");
	if (data.playground.orientation === 0){
		data.player1.x = 0;
		data.player2.x = 1 - data.player2.width;
		ctx.fillStyle = player1Color
		ctx.fillRect(canvas.width-(canvas.width * data.player2.width), data.player1.y * canvas.height, canvas.width * data.player1.width, canvas.height * data.player1.height)
		ctx.fillStyle = player2Color
		ctx.fillRect(0, data.player2.y * canvas.height, canvas.width * data.player2.width, canvas.height * data.player2.height)
	}
	else if (data.playground.orientation === 1){
		data.player1.y = 0;
		data.player2.y = data.player2.height;
		ctx.fillStyle = player1Color
		ctx.fillRect((1 - data.player1.x - 0.2) * canvas.width, canvas.height - (canvas.height * data.player2.height), canvas.width * data.player1.width, canvas.height * data.player1.height)
		ctx.fillStyle = player2Color
		ctx.fillRect((1 - data.player2.x - 0.2) * canvas.width, 0, canvas.width * data.player2.width, canvas.height * data.player2.height)
	}
}

function Playground(props:{role:number, id_game:string, socket:Socket}){
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const role = props.role;
	const id_game = props.id_game;
	const socket = props.socket;
	const [size, setSize] = useState({
		orientation: -1,
		width: 0,
		height: 0
	});
	
	// const [theme, setTheme] = useState<boolean>(false);
	const [token, setToken] = useState<string>("");
	const [colorP1, setColorP1] = useState<string>("rgba(0, 0, 255, 1)");
	const [colorP2, setColorP2] = useState<string>("rgba(255, 0, 0, 1)");
	// const [mapUrl, setMapUrl] = useState<string>("");
	const [mapUrl, setMapUrl] = useState<string>("../../public/whitebg.png");
	const [colorBall, setColorBall] = useState<string>("yellow");

	function getCanvasSize(){
		const width = window.innerWidth * 0.7;
		const height = window.innerHeight * 0.8;

		if (width > height){
			if (data.playground.orientation === 1){
				let tmp = data.player1.x;
				data.player1.x = data.player1.y;
				data.player1.y = tmp;
				tmp = data.player2.x;
				data.player2.x = data.player2.y;
				data.player2.y = tmp;
			}
			data.playground.orientation = 0;
			data.player1.width = 0.02;
			data.player1.height = 0.2;
			data.player2.width = 0.02;
			data.player2.height = 0.2;
			if (width * (4/7) < height){
				setSize({orientation:0, width: width, height: width*(4/7)});
				data.playground.width = width;
				data.playground.height = width*(4/7);
			}
			else{
				setSize({orientation:0, width: height*(7/4), height: height});
				data.playground.width = height*(7/4);
				data.playground.height = height;
			}
		}
		else
		{
			if (data.playground.orientation === 0){
				let tmp = data.player1.x;
				data.player1.x = data.player1.y;
				data.player1.y = tmp;
				tmp = data.player2.x;
				data.player2.x = data.player2.y;
				data.player2.y = tmp;
			}
			data.playground.orientation = 1;
			data.player1.width = 0.2;
			data.player1.height = 0.02;
			data.player2.width = 0.2;
			data.player2.height = 0.02;
			if (height * (4/7) < width){
				setSize({orientation:1,width: height*(4/7), height: height});
				data.playground.width = height*(4/7);
				data.playground.height = height;
			}
			else{
				data.playground.width = width;
				data.playground.height = width*(7/4);
				setSize({orientation:1,width: width, height: width*(7/4)});
			}
		}
	}

	useEffect(() => {
		socket.on('UpdateCanvas', (player_info) => {
			if (player_info.player_role === 1 && data.playground.orientation === 0)
				data.player1.y = player_info.position;	
			else if (player_info.player_role === 2 && data.playground.orientation === 0)
				data.player2.y = player_info.position;
			else if (player_info.player_role === 1 && data.playground.orientation === 1)
				data.player1.x = player_info.position;
			else if (player_info.player_role === 2 && data.playground.orientation === 1)
				data.player2.x = player_info.position;
		});
	
		socket.on("GetBallPosition", (ball) => {
			if (data.playground.orientation === 0){
				data.ballObj.x= ball.x;
				data.ballObj.y= ball.y;
			}
			else if (data.playground.orientation === 1){
				data.ballObj.x= 1 - ball.y;
				data.ballObj.y= ball.x;
			}
			data.ballObj.speed= ball.speed;
			data.ballObj.radius= ball.radius;
	
		})
		return(() => {
			socket.off('UpdateCanvas');
			socket.off('GetBallPosition');
		})
	},[socket]);

	useEffect(() => {
		getCanvasSize();
		// console.log(size.width, size.height);
		const canvas = canvasRef.current;
		if (!canvas)
			return;//console.log("canvas is null");

		const render = () => {
			// socket.emit("RequestBallPosition", {room_name:id_game})
			const ctx = canvas.getContext('2d');
			if (!ctx)
			return;//console.log("ctx is null");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			// console.log("ball color: ", colorBall);						<span id='textPlay' onClick={() => {

			drawBall(canvas, colorBall);
			// wallColission(canvas);
			// console.log("player1 color: ", colorP1, "player2 color: ", colorP2);
			drawPlayer(canvas, colorP1, colorP2);
			requestAnimationFrame(render);
		};
		requestAnimationFrame(render);
		// render();
		window.addEventListener('resize', getCanvasSize);
		return () => {
			window.removeEventListener('resize', getCanvasSize);
		}
	}, [id_game, socket, size.height, size.width])


	useEffect(() => {
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (!cookieToken)
			setToken("test")
		else
			setToken(cookieToken);
	},[])

	useEffect(() => {
		if (token !== "" && mapUrl !== "../../public/konoha.jpg")
		{
			fetchTheme(token).then((data:boolean) => {
				if (data)
				{
					// console.log("fetching theme... inside effect");
					setColorP1("rgba(0, 255, 178, 1)");
					setColorP2("rgba(255, 114, 0, 1)");
					setMapUrl("../../public/konoha.jpg");
					setColorBall("white");
				}
			})
		}
	}, [token])

	async function fetchTheme(token:string){
		let response = await fetch( `${import.meta.env.VITE_BACKEND_URL}` + "/users/me/theme/get", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": token,
			},
		});
		let data = await response.json();
		// console.log("theme = 45 ->", data.theme);
		if (data.theme){
			setColorP1("rgba(0, 255, 178, 1)");
			setColorP2("rgba(255, 114, 0, 1)");
			setMapUrl("../../public/konoha.jpg");
			setColorBall("white");
			return true;
		}
		else
			return false;

	}

	return (
		<div style={
			{
				backgroundImage: `url(${mapUrl})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
			className="w-full h-full">

		<div className="h-[90vh] w-full flex flex-col justify-center items-center">
			{/* <canvas id="canvas" ref={canvasRef} width={size.width} height={size.height} className="border-slate-700 border-8" onMouseMove={(evt)=> updateDisplay(evt)}  onMouseLeave={(evt)=> updateDisplay(evt)}></canvas> */}
			<canvas id="canvas" ref={canvasRef} width={size.width} height={size.height} className="border-slate-700 border-8" onMouseMove={(evt)=> {
				const canvas = canvasRef.current;
				if (!canvas)
					return;// throw new Error("Canvas not found");
					if (size.orientation === 0){
						if (role === 1){
						data.player1.y = evt.nativeEvent.offsetY/(canvas.height);
						if (data.player1.y < 0)
							data.player1.y = 0;
						else if (data.player1.y > 0.8)
						data.player1.y = 0.8;
						socket.emit('MakeMove', {id_game:id_game,player:1, position: data.player1.y})
					}
					else if (role === 2){
						data.player2.y = evt.nativeEvent.offsetY/(canvas.height);
						if (data.player2.y < 0)
							data.player2.y = 0;
						else if (data.player2.y > 0.8)
							data.player2.y = 0.8;
						socket.emit('MakeMove', {id_game:id_game,player:2, position: data.player2.y})
					}
				}
				else if (size.orientation === 1){
					if (role === 1){
						data.player1.x = 1-(evt.nativeEvent.offsetX/(canvas.width));
						if (data.player1.x < 0)
						data.player1.x = 0;
						else if (data.player1.x > 0.8)
							data.player1.x = 0.8;
						socket.emit('MakeMove', {id_game:id_game,player:1, position: data.player1.x})
					}
					else if (role === 2){
						data.player2.x = 1-(evt.nativeEvent.offsetX/(canvas.width));
						if (data.player2.x < 0)
						data.player2.x = 0;
						else if (data.player2.x > 0.8)
							data.player2.x = 0.8;
						socket.emit('MakeMove', {id_game:id_game,player:2, position: data.player2.x})
					}
				}
			}}  onMouseLeave={(evt)=> {
				const canvas = canvasRef.current;
				if (!canvas)
				return;// throw new Error("Canvas not found");
				if (size.orientation === 0){
					if (role === 1){
						data.player1.y = evt.nativeEvent.offsetY/(canvas.height);
						if (data.player1.y < 0)
							data.player1.y = 0;
						else if (data.player1.y > 0.8)
							data.player1.y = 0.8;
						socket.emit('MakeMove', {id_game:id_game,player:1, position: data.player1.y})
					}
					else if (role === 2){
						data.player2.y = evt.nativeEvent.offsetY/(canvas.height);
						if (data.player2.y < 0)
							data.player2.y = 0;
							else if (data.player2.y > 0.8)
							data.player2.y = 0.8;
						socket.emit('MakeMove', {id_game:id_game,player:2, position: data.player2.y})
					}
				}
				else if (size.orientation === 1){
					if (role === 1){
						data.player1.x = 1-(evt.nativeEvent.offsetX/(canvas.width));
						if (data.player1.x < 0)
							data.player1.x = 0;
							else if (data.player1.x > 0.8)
							data.player1.x = 0.8;
						socket.emit('MakeMove', {id_game:id_game,player:1, position: data.player1.x})
					}
					else if (role === 2){
						data.player2.x = 1-(evt.nativeEvent.offsetX/(canvas.width));
						if (data.player2.x < 0)
							data.player2.x = 0;
						else if (data.player2.x > 0.8)
							data.player2.x = 0.8;
							socket.emit('MakeMove', {id_game:id_game,player:2, position: data.player2.x})
						}
					}
			}}></canvas>
		</div>
	</div>
	);
}

enum StatusGame {
	Waiting = 0,
	Playing = 1,
	End = 2
}

const AlertRoomsNotExists = () => {
	Swal.fire({
		title: 'Error!',
		text: 'Room not exists',
		icon: 'error',
		confirmButtonText: 'Ok'
	})
}

function PlayPage() {
	let params = useParams();
	const navigate = useNavigate();
	const [id_game, setId_game] = useState<string>("");
	const socket = useContext(SocketContext);
	const [role, setPlayer_role] = useState<number>(0);
	const [isWinner, setIsWinner] = useState<boolean>(false);
	const [status_game, setStatus_game] = useState<StatusGame>(StatusGame.Waiting);
	const [score, setScore] = useState<[number, number]>([0,0]);
	const [token, setToken] = useState<string>('');
	
	useEffect(() => {
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (cookieToken !== "")
			setToken(cookieToken);
	},[token])

	useEffect(() => {
		if (socket.disconnected && token !== ''){
			socket.auth= {token: token};
			socket.connect();
		}
	},[socket, token]);

	useEffect(() => {
		setId_game(params.id_game as string);
		// socket.emit("ClientSession", "prout");
		if (id_game !== "" && token !== ''){
			fetchRole(id_game, token).then((data:number) => {
				if (data === 0){
					AlertRoomsNotExists();
					navigate("/Game");
				}
				setPlayer_role(data);
			})
			socket.emit('JoinRoom', {room_name:id_game});
		}

		socket.on('StartGame', (value:any) => {
			setStatus_game(StatusGame.Playing);
		});
		socket.on('PlayerLeft', (values:any) => {
			setStatus_game(StatusGame.End);
			setScore(values.score);
			if (role !== values.player)
				setIsWinner(true);
		})
	
		socket.on('UpdateScore', (values:any) => {
			// console.log("UpdateScore:"+values.score)
			setScore(values.score);
		})
		socket.on('EndGame', (values:any) => {
			setStatus_game(StatusGame.End);
			setScore(values.score);
			if (role === values.winner)
				setIsWinner(true);
		})
		return (() => {
			socket.off('StartGame');
			socket.off('PlayerLeft');
			socket.off('UpdateScore');
			socket.off('EndGame');
		})
	},[params.id_game, id_game, role, socket, token]);

	// useEffect(() => {
	// 	if (status_game === StatusGame.End){
	// 		setTimeout(() => {
	// 			navigate("/myProfile");
	// 		}, 0);
	// 	}
	// },[status_game, navigate]);

	return (
		<div className="w-full h-screen flex flex-col items-center justify-center relative">
			{status_game === StatusGame.Playing ?
				null
			:
				<div className="absolute w-[100%] h-[100%] bg-opacity-20 bg-black z-20 flex flex-col items-center justify-around">
					{status_game === StatusGame.Waiting ? 
						<>
							<h1 className="w-fit text-5xl text-white">Waiting Player</h1>
						</>
					: 
						<>
							<h1 className="w-fit text-5xl text-white">{isWinner ? "YOU WIN!!!!" : "YOU LOSE"}</h1>
							<h1 className="w-fit text-5xl text-white">Score: {score[0]}:{score[1]}</h1>
							<button className="bg-red-200 p-3 rounded-xl w-fit text-2xl" onClick={() => {
									socket.emit('LeaveRoom', {room_name:id_game});
									socket.disconnect();
									navigate("/Game");
							}}>GO BACK TO MENU</button>
						</>
					}
				</div>
			}
			<div className="w-full h-[10vh] inline-flex justify-center items-center gap-2 bg-gray-950">
				<h1 className="w-fit h-min sm:text-4xl text-sm text-white">{score[0]}:{score[1]}</h1>
				<div className="">
					{/* <button className="sm:text-2xl text-sm bg-red-200 rounded-lg p-2" onClick={() => {
						socket.emit('LeaveRoom', {room_name:id_game});
						navigate("/Game");
					}}>QUIT</button> */}

					{/* <button className="sm:text-2xl text-sm bg-red-200 rounded-lg p-2" onClick={() => {
						Swal.fire({
							title: 'Are you sure?',
							text: "You won't be able to revert this!",
							icon: 'warning',
							showCancelButton: true,
							confirmButtonColor: '#3085d6',
							cancelButtonColor: '#d33',
							confirmButtonText: 'Yes, quit!'
						  }).then((result) => {
							if (result.isConfirmed) {
								socket.emit('LeaveRoom', {room_name:id_game});
								navigate("/Game");
							}
						  })
					}}>QUIT</button> */}

					<button className="sm:text-2xl text-sm bg-gray-100 rounded-lg p-2" onClick={() => {
						Swal.fire(
							'How to play?',
							'Use your mouse to move the paddle and hit the ball. The first player to score 10 points wins the game.',
							'question'
						  )
					}}>HELP</button>

				</div>
			</div>
			{id_game !== "" && role !== 0 && socket.connected ? <Playground role={role} id_game={id_game} socket={socket}/> : <div className='text-white'>Loading...</div> }
		</div>
	)
}

export default PlayPage;