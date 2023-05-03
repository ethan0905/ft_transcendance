import CSS from 'csstype';
import React, { useState, useEffect } from 'react';

interface TableProps {
	data: {
	  player1: string;
	  player2: string;
	  player1Name: string;
	  score: string;
	  date: string;
	}[];
  }
  
const GameHistory = (props: TableProps) => {
	const { data } = props;

	const [token, setToken] = useState<string>('');
	const [userName, setUserName] = useState<string>('');

	useEffect(() => {
		if (token !== '') {
			getUserName(token);
		}
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (cookieToken) {
			setToken(cookieToken);
		}
	}, [token]);

	const getUserName = async (token: string) => {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/username/get', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `${token}`
			},
		});
		const data = await response.json();
		if (data) {
			setUserName(data.username);
		}
	}

	// const reversedData = [...data].reverse();

	// const gamesPlayed = reversedData.length;
	const gamesPlayed = data.length;
	let gamesWon = 0;
	let gamesLost = 0;
  
	
	data.forEach((item) => {
		const score1 = item.score[0];
		const score2 = item.score[1];
		const player1 = item.player1Name;

		// console.log("indie gamehistory: " + score1 + " ", score2 + " ", player1 + " ");

		if (score1 > score2 && player1 == userName || score1 < score2 && player1 != userName) {
			gamesWon++;
		} else {
			gamesLost++;
		}
	});

	// reversedData.forEach((item) => {
	// 	const score1 = item.score[0];
	// 	const score2 = item.score[1];
	// 	const player1 = item.player1Name;
	
	// 	console.log("indie gamehistory: " + score1 + " ", score2 + " ", player1 + " ");
	
	// 	if (score1 > score2 && player1 == userName || score1 < score2 && player1 != userName) {
	// 	  gamesWon++;
	// 	} else {
	// 	  gamesLost++;
	// 	}
	//   });
  
	const winrate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : "0.00";
  
	return (
	<div style={{overflowY: 'auto', minWidth: '60%', height: '100%', borderRadius: '10px',}}>
			<table style={{ borderCollapse: 'collapse' }}>

				<thead style={{ position: 'sticky', top: '0' }}>
					<tr>
						<th colSpan={6} style={titleTable}>Game history</th>
					</tr>
					<tr style={stats}>
						<th></th>
						<th>Winrate: {winrate}%</th>
						<th></th>
						<th>Games: {gamesPlayed}</th>
						<th>Win: {gamesWon}</th>
						<th>Lost: {gamesLost}</th>
					</tr>
					<tr>
						<th style={titleCol}>#</th>
						<th style={playerCol}>Player1</th>
						<th style={titleCol}></th>
						<th style={playerCol}>Player2</th>
						<th style={titleCol}>Score</th>
						<th style={titleCol}>Date</th>
					</tr>
				</thead>

				<tbody style={{ paddingTop: '100px' }}>
					{data.length > 0 ? (
						data.map((item, index) => (
						<tr key={index} style={{ backgroundColor: 
							(item.score[0] >= item.score[1] && item.player1Name === userName) || 
							(item.score[1] >= item.score[0] && item.player1Name !== userName) ? 
							(item.score[0] == item.score[1]) ? '#ffffff11' : '#42f5b055' /* green */ 
							: '#f5484255' /* red */
						  }}>
							<td style={lineTable}>{index + 1}</td>
							{ item.player1Name == userName &&
								(
									<>
										<td style={lineTable}>{item.player1}</td>
										<td style={lineTable}>VS</td>
										<td style={lineTable}>{item.player2}</td>
									</>
								)
							}

							{ item.player1Name != userName &&
								(
									<>
										<td style={lineTable}>{item.player2}</td>
										<td style={lineTable}>VS</td>
										<td style={lineTable}>{item.player1}</td>
									</>
								)
							}

							<td style={lineTable}>{item.score.at(0)} - {item.score.at(1)}</td>
							<td style={lineTable}>{item.date.split('T').at(0)}-[{item.date.split('T').at(1)?.split('.').at(0)}]</td>
						</tr>))
						) : (
						<tr style={lineTable}><td colSpan={6}>No match found</td></tr>
						)
					}
				</tbody>
			</table>
		</div>
	);
};

const stats: CSS.Properties = {
	backgroundColor: '#b62f2ff8',
	textAlign: 'center',
}

const titleCol: CSS.Properties = {
	backgroundColor: 'black', 
	color: 'white', 
	textAlign: 'center',
}

const titleTable: CSS.Properties = {
	backgroundColor: 'black', 
	color: 'white', 
	textAlign: 'center', 
	fontFamily: 'Kocak',
	fontSize: '30px',
}

const lineTable: CSS.Properties = {
	borderBottom: '1px solid #ddd',
	textAlign: 'center',
	backgroundColor: '#fff9f932',
	height: '75px',
	fontWeight: 'bold',
	color: 'white',
	textShadow: '1px 1px 1px black',
}

const playerCol: CSS.Properties = {
	backgroundColor: 'black', 
	color: 'white', 
	textAlign: 'center',
	width: '20%'
}

export default GameHistory;