import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {v4 as uuidv4} from 'uuid';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { Req } from '@nestjs/common';


type Ball={
	x: number;
	y: number;
	vx: number;
	vy: number;
	speed: number;
	radius: number;
}

type Game = {
	player1_position: number;
	player2_position: number;
	player1_score: number;
	player2_score: number;
	is_playing: boolean;
	ball: Ball;
}

type Room = {
	name: string;
	player1: string;
	player2: string;
	spectators: string[];
	game: Game;
}

@Injectable()
export class WsGameService {
	constructor(private schedulerRegistry: SchedulerRegistry, private prisma: PrismaService) {}
	number_of_player: number = 0;
	rooms: {[key:string]:Room} = {};
	queue: string[] = [];
	clients:{[key:string]:Socket} = {};

	async getUsernameFromToken(token:string): Promise<string> {
		let user = await this.prisma.user.findUnique({
			where: {
				accessToken: token
			},
			select:{
				username: true
			}
		});
		return user.username;
	}

	getUsernameFromId(id:string): string {
		return Object.keys(this.clients).find(key => this.clients[key].id === id);
	}

	async newUserConnected(client:Socket, server:Server): Promise<void> {
		if (client.handshake.auth.token === '')
			return;
		let user = await this.getUsernameFromToken(client.handshake.auth.token);
		// console.log("Connection:"+user);
		this.clients[user] = client;
	}
	
	userDisconnected(client:Socket, server:Server): void {
		let user = this.getUsernameFromId(client.id);
		if (user === undefined)
			return;
		if (this.queue.includes(user))
			this.queue.splice(this.queue.indexOf(user), 1);
		for (let room in this.rooms) {
			if (this.rooms[room].player1 === user && this.rooms[room].game.is_playing === true) {
				this.leaveRoom(client, this.rooms[room].name, server);
			}
			else if (this.rooms[room].player2 === user && this.rooms[room].game.is_playing === true) {
				this.leaveRoom(client,this.rooms[room].name, server);
			}
		};
	}

	async createRoom(client1:string,client2:string,server:Server): Promise<void> {
		let userplayers = await  this.prisma.user.findMany({
			where:{
				OR:[
					{username:client1},
					{username:client2}
				]
			}
		});

		// let new_game = await this.prisma.game.create({
		// 	data:{
		// 		players:[userplayers[0], userplayers[1]],
		// 		duration:10,
		// 		score:[0,0],
		// 	}
		// })

		const uuid = uuidv4();

		const new_game = await this.prisma.game.create({
			data: {
				players: {
					connect: [
						{ username: client1 },
						{ username: client2 },
					],
				},
				duration: 10,
				score: [0, 0],
				roomName: uuid,
				player1Name: client1,
			},
		});

		let room: Room = {
			name: uuid,
			player1: client1,
			player2: client2,
			spectators: [],
			game: {
				player1_position: 0,
				player2_position: 0,
				player1_score: 0,
				player2_score: 0,
				is_playing: false,
				ball: {
					x: 0.5,
					y: 0.5,
					vx: 0.001,
					vy: 0.001,
					speed: 0,
					radius: 0.015,
				}
			}
		}
		this.rooms[room.name] = room;
		server.emit('RoomCreated', room);
		server.to([this.clients[client1].id, this.clients[client2].id]).emit('FindGame', room.name);
	}

	async createRoomWithFriends(client1:string, client2:string){
		let userplayers = await  this.prisma.user.findMany({
			where:{
				OR:[
					{username:client1},
					{username:client2}
				]
			}
		});
		const uuid = uuidv4();

		const new_game = await this.prisma.game.create({
			data: {
				players: {
					connect: [
						{ username: client1 },
						{ username: client2 },
					],
				},
				duration: 10,
				score: [0, 0],
				roomName: uuid,
				player1Name: client1,
			},
		});

		let room: Room = {
			name: uuid,
			player1: client1,
			player2: client2,
			spectators: [],
			game: {
				player1_position: 0,
				player2_position: 0,
				player1_score: 0,
				player2_score: 0,
				is_playing: false,
				ball: {
					x: 0.5,
					y: 0.5,
					vx: 0.001,
					vy: 0.001,
					speed: 0,
					radius: 0.015,
				}
			}
		}
		this.rooms[room.name] = room;
		return (room);
	}

	matchmaking(client:Socket, server:Server): Promise<void> {
		let user = this.getUsernameFromId(client.id);
		if (user === undefined)
			return;
		if (this.queue.includes(user))
			return; // already in queue
		// Verifier si le client est connecte
		this.queue.push(user);
		if (this.queue.length > 1) {
			const player1: string = this.queue[0];
			const player2: string = this.queue[1];
			this.queue.splice(0, 2);
			this.createRoom(player1, player2, server);
		}
	}

	cancelMatchmaking(client:Socket, server:Server): Promise<void> {
		let user = this.getUsernameFromId(client.id);
		if (user === undefined)
			return;
		if (this.queue.includes(user)){
			this.queue.splice(this.queue.indexOf(user), 1);
		}
		return;
	}

	MakeMove(client: Socket, server:Server, data: any): void {
		let user = this.getUsernameFromId(client.id);
		if (user === undefined)
			return;
		if (this.rooms[data.id_game] !== undefined) {
			if (data.player == 1 && this.rooms[data.id_game].player1 === user)
				this.rooms[data.id_game].game.player1_position = data.position;
			else if (data.player == 2 && this.rooms[data.id_game].player2 === user)
				this.rooms[data.id_game].game.player2_position = data.position;
		}
		server.to(data.id_game.toString()).except(client.id).emit('UpdateCanvas', {player_role: data.player, position: data.position});
	}

	async getRoles(@Req() req:Request, room_name: string): Promise<number> {
		const room: Room = this.rooms[room_name];
		let playerId = req.headers["authorization"];
		let user = await this.getUsernameFromToken(playerId)
		if (room !== undefined) {
			if (room.player1 == user)
				return 1;
			else if (room.player2 == user)
				return 2;
			else
				return 3;
		}
		return 0;
	}

	joinRoom(client:Socket,room_name:string,server:Server): void {
		const room: Room = this.rooms[room_name];
		let user = this.getUsernameFromId(client.id);
		if (room !== undefined && user !== undefined) {
			if (room.player1 === user){
				server.in(room.name).fetchSockets().then((sockets) => {
					for (let i = 0; i < sockets.length; i++) {
						if (this.clients[room.player2] !== undefined && sockets[i].id === this.clients[room.player2].id)
							this.startGame(room.name,server);
					}
				})
				this.clients[user].join(room.name);
			}
			else if (room.player2 === user) {
				this.clients[user].join(room.name);
				server.in(room.name).fetchSockets().then((sockets) => {
					for (let i = 0; i < sockets.length; i++) {
						if (this.clients[room.player1] !== undefined && sockets[i].id === this.clients[room.player1].id)
							this.startGame(room.name,server);
					}
				})
			}
			else {
				room.spectators.push(user);
				this.clients[user].join(room.name);
			}
		}
	}

	leaveRoom(client:Socket,room_name:string,server:Server): void {
		const room: Room = this.rooms[room_name];
		let user = this.getUsernameFromId(client.id);
		if (user === undefined)
			return;
		if (room !== undefined) {
			// console.log("LeaveRoom: " + room_name + " " + user + " P1 :" + room.player1 + " P2:" + room.player2)
			if (room.player1 === user) {
				// this.clients[client_id].leave(room.name);
				room.player1 = "";
				if (room.game.is_playing === true)
					this.schedulerRegistry.deleteInterval(room.name);
				if (room.game.is_playing === true){
					room.game.player1_score = 0;
					room.game.player2_score = 11;
					room.game.is_playing = false;
					room.game.ball.speed = 0;
				}
				server.to(room.name).emit('PlayerLeft', {player:1, score:[room.game.player1_score, room.game.player2_score]});
				// ajouter dans la bdd | efaccer la room de la liste
				delete this.rooms[room_name];
				server.emit("RoomDeleted", room_name);
				server.socketsLeave(room.name);
			}
			else if (room.player2 === user) {
				// this.clients[client_id].leave(room.name);
				room.player2 = "";
				if (room.game.is_playing === true)
					this.schedulerRegistry.deleteInterval(room.name);
				if (room.game.is_playing === true){
					room.game.player1_score = 11;
					room.game.player2_score = 0;
				}
				server.to(room.name).emit('PlayerLeft', {player:2, score:[room.game.player1_score, room.game.player2_score]});
				// verifier que le'interval existe
				// ajouter dans la bdd | efaccer la room de la liste
				delete this.rooms[room_name];
				server.emit("RoomDeleted", room_name);
				server.socketsLeave(room.name);
			}
			else {
				room.spectators.splice(room.spectators.indexOf(user), 1);
				server.to(room.name).emit('SpectatorLeft', room.spectators);
			}
		}
		// })
	}

	startGame(room_name:string, server:Server): void {
		const room: Room = this.rooms[room_name];
		if (room !== undefined) {
			if (room.game.is_playing === true)
				return;
			room.game.is_playing = true;
			room.game.ball.speed = 10; // was to 10 to play game
			server.to(room.name).emit('StartGame', room.name);
			server.emit('NewMatch', this.rooms);
			const interval = setInterval(() => {
				this.requestBallPosition(room_name, server)
			}, 1000/60);
			this.schedulerRegistry.addInterval(room_name, interval);
		}
	}

	UpdateScore(room_name:string, player:number, server:Server): void {
		if (this.rooms[room_name] !== undefined) {
			server.to(room_name).emit('UpdateScore', {score:[this.rooms[room_name].game.player1_score,this.rooms[room_name].game.player2_score]});
			if (this.rooms[room_name].game.player1_score == 11 || this.rooms[room_name].game.player2_score == 11){
				this.endGame(room_name, server);
			}
		}
	}

	requestBallPosition(room_name:string, server:Server): void {
		const room: Room = this.rooms[room_name];
		if (room !== undefined) {
			let ball = room.game.ball;
			server.to(room.name).emit('GetBallPosition', ball);
			if (ball.x - ball.radius <= 0.02 && (ball.y >= this.rooms[room_name].game.player2_position && ball.y <= this.rooms[room_name].game.player2_position + 0.2) ){
				ball.vx = -ball.vx;
			}
			else if (ball.x + ball.radius >= 1 - (0.02) && (ball.y >= this.rooms[room_name].game.player1_position && ball.y <= this.rooms[room_name].game.player1_position + 0.2)){
				ball.vx = -ball.vx;
			}
			else if (ball.x - ball.radius <= 0.02){
				// console.log("GOAL 1: ORIENTATION 0")
				ball.x = 0.5;
				ball.y = 0.5;
				this.rooms[room_name].game.player1_score++;
				this.UpdateScore(room_name, 1, server);
			}
			else if (ball.x + ball.radius >= (1 - 0.02)){
				// console.log("GOAL 2 Orientation 0")
				ball.x = 0.5;
				ball.y = 0.5;
				this.rooms[room_name].game.player2_score++;
				this.UpdateScore(room_name, 2, server);
			}
			else if (ball.y - ball.radius < 0){
				ball.vy = -ball.vy;
			}
			else if (ball.y + ball.radius  >= 1){
				ball.vy = -ball.vy;
			}
			ball.x += (ball.vx * ball.speed);
			ball.y += (ball.vy * ball.speed);
			if (this.rooms[room_name] !== undefined)
				this.rooms[room_name].game.ball = ball;
		}
	}

	// endGame(room_name:string, server:Server): void {
	// 	// console.log("END GAME:"+room_name);

	// 	console.log("score 1 : ", this.rooms[room_name].game.player1_score, "score 2 : ", this.rooms[room_name].game.player2_score);

	// 	const scoreArray = [this.rooms[room_name].game.player1_score, this.rooms[room_name].game.player2_score];

	// 	console.log("scoreArray : ", scoreArray);

	// 	const game = this.prisma.game.update({
	// 		where: {
	// 			roomName: room_name,
	// 		},
	// 		data: {
	// 			score: scoreArray,
	// 		}
	// 	})

	// 	this.schedulerRegistry.deleteInterval(room_name);
	// 	if (this.rooms[room_name].game.player1_score > this.rooms[room_name].game.player2_score){
	// 		server.to(room_name).emit('EndGame', {score:[this.rooms[room_name].game.player1_score,this.rooms[room_name].game.player2_score], winner:1});
	// 	}
	// 	else
	// 		server.to(room_name).emit('EndGame', {score:[this.rooms[room_name].game.player1_score,this.rooms[room_name].game.player2_score], winner:2});
	// 	server.emit("RoomDeleted", room_name);
	// 	this.rooms[room_name].game.ball.speed = 0;
	// 	this.rooms[room_name].game.is_playing = false;
	// 	// Enregistrer le score dans la bdd
	// 	delete this.rooms[room_name];
	// 	server.socketsLeave(room_name);
	// }

	endGame(room_name:string, server:Server): void {
		// console.log("score 1 : ", this.rooms[room_name].game.player1_score, "score 2 : ", this.rooms[room_name].game.player2_score);
	
		const scoreArray = [this.rooms[room_name].game.player1_score, this.rooms[room_name].game.player2_score];
	
		// console.log("scoreArray : ", scoreArray);
	
		this.prisma.game.update({
			where: {
				roomName: room_name,
			},
			data: {
				score: scoreArray,
			}
		}).then(() => {
			this.schedulerRegistry.deleteInterval(room_name);
			if (this.rooms[room_name].game.player1_score > this.rooms[room_name].game.player2_score){
				server.to(room_name).emit('EndGame', {score:[this.rooms[room_name].game.player1_score,this.rooms[room_name].game.player2_score], winner:1});
			}
			else
				server.to(room_name).emit('EndGame', {score:[this.rooms[room_name].game.player1_score,this.rooms[room_name].game.player2_score], winner:2});
			server.emit("RoomDeleted", room_name);
			this.rooms[room_name].game.ball.speed = 0;
			this.rooms[room_name].game.is_playing = false;
			// Enregistrer le score dans la bdd
			delete this.rooms[room_name];
			server.socketsLeave(room_name);
		}).catch((err) => {
			console.log(err);
		});
	}
	

	getRooms(): {[key:string]:Room}{
		return this.rooms;
	}

	getPlayers(): number{
		return this.number_of_player;
	}
}
