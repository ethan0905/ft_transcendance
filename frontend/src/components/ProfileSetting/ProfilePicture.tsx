import React, { ChangeEventHandler, useEffect} from 'react';
import Avatar from '@mui/material/Avatar';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CircularProgress from '@mui/material/CircularProgress';

interface ProfilePictureProps {
	profilePicture: File | null;
	avatarUrl: string;
	handleUpload: ChangeEventHandler<HTMLInputElement>;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({profilePicture, handleUpload, avatarUrl }) => {
	const [imageIsLoaded, setImageIsLoaded] = React.useState(false);

	useEffect(() => {
		if (profilePicture) {
			setTimeout(() => {
				// console.log('Image avatar: ', avatarUrl);
				setImageIsLoaded(true);
			  }, 400); // 1 second delay
		}
	}, [profilePicture]);

	return (
		<div className='ProfilePicture'>
			<input type='file' id='profile-picture-upload'
				style={{ display: 'none' }}
				accept='.jpg,.jpeg,.png'
				onChange={handleUpload}
			/>
			{imageIsLoaded ? (
				<Avatar
					className='Avatar'
					alt='Profile Picture'
					sx={{
						width: 150,
						height: 150,
						verticalAlign: 'middle',
						border: '#f8f8f8 4px solid',
						margin: '10px 20px 10px 10px'
					}}
					src={profilePicture ? URL.createObjectURL(profilePicture) : avatarUrl}
				/>
			) : (
				<CircularProgress
					id='LoadingAvatar'
					size={150}
					thickness={2}
					sx={{color: '#f8f8f8'}}
		  		/>
			)}

			<AddAPhotoIcon sx={{ 
				position: 'absolute',
				right: '30px',
				bottom: '20px',
				opacity: '1',
				color: '#fefefefb',
			}}
			onClick={() => { 
				const input = document.getElementById('profile-picture-upload'); 
				if (input) { input.click(); } 
			}}
			/>
		</div>
	);
};

		
export default ProfilePicture;
