import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Avatar from '@mui/material/Avatar';
import GameHistory from '../../components/GameHistory';
import Achievements from '../../components/Achievements/Achievements';
import './userPage.css';
import { useState } from 'react';
import { useEffect } from 'react';
import ProfilePicture from '../../components/ProfileSetting/ProfilePicture';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CSS from 'csstype';

export default function UserPage() {
	const navigate = useNavigate();
	let { username } = useParams();

	const [userExists, setUserExists] = useState(false);
	const [userIsMe, setUserIsMe] = useState(false);
	const [userId, setUserId] = useState<string>('');
	const [profilePicture, setProfilePicture] = useState<File | null>(null);
	const [imageIsLoaded, setImageIsLoaded] = useState(false);
	const [token, setToken] = useState<string>('');
	const [friendAdded, setFriendAdded] = useState(false);
	const [blocked, setBlocked] = useState(false);

	useEffect(() => {
		if (token && username)
		{
			// getUserNameById(id);
			userExistsByUsername(username, token);
			getUserIdByUserName(username);
			getProfilePictureByUserName(username);
			// getProfilePicture(id);
			getFriendStatusById();
			getBlockedStatusById();
			// console.log("Fetching game list...", token);
			const fetchData = async () => {
			  getGameHistory();
			};
			fetchData();
			// console.log("Fetching achievement ...");
			const fetchAchievements = async () => {
				getUserAchievementStatus();
			};
			fetchAchievements();
			// console.log("Fetching user status ...");
			// const fetchUserStatus = async () => {
			// 	getUserStatus();
			// };
			// fetchUserStatus();
		}
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (cookieToken) {
			setToken(cookieToken);
		}
	}, [token, username]);

	useEffect(() => {
		if (profilePicture)
		{
			setTimeout(() => {
				setImageIsLoaded(true);
			}, 400);
		}
	}, [profilePicture]);

	useEffect(() => {
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (cookieToken) {
			setToken(cookieToken);
		}
	}, []);

	async function userExistsByUsername(username: string, accessToken: string) {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/username/valid', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Username': username,
					'Authorization': accessToken,
				},
			});
			const data = await response.json();
			if (data.value === true) {
				setUserExists(data.value);
				// console.log('user is me ? ', data.loggedUser); // getting properly if user is the user logged or not
				setUserIsMe(data.loggedUser);
			} else {
				setUserExists(false);
				alert("User does not exist, redirecting to your profile page..."); // optionnal
				navigate('/myProfile');
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	async function getUserNameById(id: string) {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/username/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Id': id,
				},
			});
			const data = await response.json();
			if (data) {
				// setUserName(data.username); // commented to test /profile/:username
				// return data;
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	async function getUserIdByUserName(username: string) {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/id/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'UserName': username,
				},
			});
			const data = await response.json();
			if (data) {
				setUserId(data.id);
				// return data;
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	async function getProfilePictureByUserName(username: string): Promise<any> {

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/files/' + username, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.status === 404) {
				// console.log("No profile picture found. Loading default profile picture...");
				getDefaultProfilePicture();
				return;
			}
			const blob = await response.blob();
			const file = new File([blob], 'filename.jpg', { type: 'image/jpeg' });
			setProfilePicture(file);
			// return data;
		} catch (error) {

			console.error(error);
			// handle error
		}
	}

	async function addFriend() {
		// 1. get user cookie
		// 2. send friend request to user using his id
		// let token = '';

		// console.log('Add friend button clicked! : ', token);
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/friend/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username: username, Tokensource: token}),
			});
			// console.log('response: ', response);
			const data = await response.json();
			if (data.value) {
				setFriendAdded(true);
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	async function removeFriend() {
		// 1. get user cookie
		// 2. remove friend using his id
		// console.log('Remove friend button clicked! : ', token);

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/friend/remove', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username: username, Tokensource: token}),
			});
			// console.log('response: ', response);
			const data = await response.json();
			if (data.value) {
				setFriendAdded(false);
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	async function getFriendStatusById() {

		let id = '';
		
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/id/get', {
				method: 'GET',
				headers:{
					'Content-Type': 'application/json',
					'Username': username || '',
				},
			});
			const data = await response.json();
			if (data) {
				id = data.id;
			}
		} catch (error) {
			console.error(error);
			// handle error
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/friend/status/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': token,
					'Id': id,
				},
			});
			const data = await response.json();
			if (data.value) {
				// console.log('data.value: FRIEND');
				setFriendAdded(true);
			}
			else {
				// console.log('data.value: NOT FRIEND');
				setFriendAdded(false);
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	// block part
	async function blockUser() {
		// 1. get user cookie
		// 2. send friend request to user using his id
		// let token = '';

		// console.log('Block button clicked! : ', token);
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/user/block', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username: username, Tokensource: token}),
			});
			// console.log('response: ', response);
			const data = await response.json();
			if (data.value) {
				setBlocked(true);
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	async function unblockUser() {
		// 1. get user cookie
		// 2. remove friend using his id
		// console.log('Unblock button clicked! : ', token);

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/user/unblock', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username: username, Tokensource: token}),
			});
			// console.log('response: ', response);
			const data = await response.json();
			if (data.value) {
				setBlocked(false);
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	async function getBlockedStatusById() {

		let id = '';
		
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/id/get', {
				method: 'GET',
				headers:{
					'Content-Type': 'application/json',
					'Username': username || '',
				},
			});
			const data = await response.json();
			if (data) {
				id = data.id;
			}
		} catch (error) {
			console.error(error);
			// handle error
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/block/status/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': token,
					'Id': id,
				},
			});
			const data = await response.json();
			if (data.value) {
				// console.log('data.value: BLOCKED');
				setBlocked(true);
			}
			else {
				// console.log('data.value: UNBLOCKED');
				setBlocked(false);
			}
		} catch (error) {
			console.error(error);
			// handle error
		}
	}

	const [gameHistoryList, setGameHistoryList] = useState([]);

	async function getGameHistory(): Promise<any> {

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/game/history/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Username': `${username}`,
				},
			});
			const data = await response.json();
			if (data) {
				setGameHistoryList(data);
			}
			return data;
		} catch (error) {

			console.error(error);
			// handle error
		}
	}

	const [hasPlayed, setHasPlayed] = useState(false);
	const [hasWon, setHasWon] = useState(false);
	const [hasFriend, setHasFriend] = useState(false);

	async function getUserAchievementStatus(): Promise<any> {

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/achievements/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Username' : username || '',
				},
			});
			const data = await response.json();
			if (data)
			{
				setHasPlayed(data.hasPlayed);
				setHasWon(data.hasWon);
				setHasFriend(data.hasFriend);
			}
		} catch (error) {
			console.log(error);
		}

	}

	const [userStatus, setUserStatus] = useState(null);

	useEffect(() => {
		if (username)
		{
			fetchUserStatus();
		}
	  }, [username]);
	

	async function fetchUserStatus() {
		let config = {
			method: 'get',
			maxBodyLength: Infinity,
			url: `${import.meta.env.VITE_BACKEND_URL}` + '/users/user/status/get',
			headers: {
				'Content-Type': 'application/json',
				'Username': username || '',
			}
		  };

		const response = await axios.request(config);
		// console.log('response from axios: ', response);
		setUserStatus(response.data.status);
	}

	function getStatusLabel() {
		if (userStatus === 'ONLINE') {
			return 'online';
		} else if (userStatus === 'OFFLINE') {
			return 'offline';
		} else if (userStatus === 'PLAYING') {
			return 'ingame';
		} else {
			return 'Unknown';
		}
	}

	let userStatusDot = getStatusLabel() as 'online' | 'offline' | 'ingame';

	const [defaultProfilePicture, setDefaultProfilePicture] = useState('');

	useEffect(() => {
		if (token !== '')
		{
			const fetchDefaultProfilePicture = async () => {
				getDefaultProfilePicture();
			};
			fetchDefaultProfilePicture();
		}
	}, [token]);

	async function getDefaultProfilePicture(): Promise<any> {
		
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/users/me/avatarurl/get', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Username': `${username}`,
				},
			});
			const data = await response.json();
			if (data)
			{
				// console.log("default : ", data.avatarUrl);
				// setDefaultProfilePicture(data.avatarUrl);
				const res = await fetch(data.avatarUrl);
				const blob = await res.blob();
				const filename = data.avatarUrl.substring(data.avatarUrl.lastIndexOf('/')+1);

				// access file here
				setProfilePicture(new File([blob], filename));
			}
		} catch (error) {
			console.log(error);
		}

	}

	return (
		<>
			<Sidebar />
			<div className='UserPage'>
				<div className='UserPage_header'>
					{imageIsLoaded ? (
						<Avatar id='UserAvatar' alt='Profile Picture'
							sx={{
								width: 150,
								height: 150,
								verticalAlign: 'middle',
								border: '#f8f8f8 4px solid',
								margin: '10px 20px 10px 10px'
							}}
							src={profilePicture ? URL.createObjectURL(profilePicture) : undefined}/>
						) : (
						<CircularProgress
							id='LoadingAvatar'
							size={150}
							thickness={2}
							sx={{color: '#f8f8f8'}}
						/>)
					}
					<div className='UserPage_info'>
						<h1 className='font-semibold text-4xl'>{username}
							<div className={`userStatus ${userStatusDot}`}></div>
						</h1>
						<div className='buttonList'>
							{ userIsMe ? (
									<button>Edit Profile</button>
								) : (
									<>
										{ !friendAdded ? (
											<button style={{
												backgroundColor: 'green',
												border: 'solid 1px black',
												borderRadius: '3px',
												padding: '0 10px',
											}} onClick={addFriend}>Add</button>
											) : (
												<button style={{
													backgroundColor: 'red',
													border: 'solid 1px black',
													borderRadius: '3px',
													padding: '0 10px',
												}} onClick={removeFriend}>Delete</button>
												)
											}
										{ !blocked ? (
											<button style={{
												backgroundColor: 'orange',
												border: 'solid 1px black',
												borderRadius: '3px',
												padding: '0 10px',
											}} onClick={blockUser}>Block</button>
											) : (
												<button style={{
													backgroundColor: '#e5e7eb',
													border: 'solid 1px black',
													color: 'black',
													borderRadius: '3px',
													padding: '0 10px',
												}} onClick={unblockUser}>Unblock</button>
												)
											}
										<button style={{
												backgroundColor: '#e5e7eb',
												border: 'solid 1px black',
												color: 'black',
												borderRadius: '3px',
												padding: '0 10px',
											}}>Fight</button>
									</>
								)
							}
							{/* <div> Status: {userStatus ? getStatusLabel() : 'Loading...'}</div> */}
						</div>
					</div>
					<Achievements data={{ hasPlayed: hasPlayed, hasWon: hasWon, hasFriend: hasFriend }} />
				</div>
				<div className='UserPage_stats'>
					<GameHistory data={gameHistoryList} />
				</div>
			</div>
		</>
	);
}

const Buttonstyles: CSS.Properties = {
	backgroundColor: '#e5e7eb',
	color: 'black',
	border: 'solid 1px black',
	borderRadius: '5px',
	padding: '0 5px',
  }