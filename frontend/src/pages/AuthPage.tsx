import { Button } from '../components/Button/button'

export default function Auth() {

	return (
	<>
		<div className='AuthPage' style={{
			width: '100%',
			height: '100vh',
			backgroundSize: 'cover',
			backgroundImage: `url(/background.jpg)`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: 'Kocak',
		}}>
			<div className='overlay' style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				<h1 style={	{
					color: '#000000',
					textShadow: '0px 1px 8px #f6d21d',
					fontSize: '50px',

				}}>Are you ready ?</h1>

				<Button 
				text="Log in with 42"
				onClick={() => {
					window.open(`${import.meta.env.VITE_API42_URL}`, "_self");
				}}
				/>
				
			</div>
		</div>
	</>
	);
}
