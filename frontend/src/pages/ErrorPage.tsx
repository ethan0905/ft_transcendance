export default function NotFound() {
	return (
	<div className='404Page' style={{
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundImage: 'url(/404notfound.jpg)',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
    }}>
		<h1 style={{
			fontFamily: 'Kocak',
			color: 'white',
			textShadow: '2px 3px 5px purple',
			fontSize: '3rem',
			margin: '0',
		}}>Error 404: Page not found</h1>
	</div>
	);
}
