import React from 'react';
import AuthCode from 'react-auth-code-input';
import {Button} from '../../components/Button/button';
import './2faVerify.css';

function Verify2FA() {
	const [twoFACode, setTwoFACode] = React.useState('');
	const handleOnChange = (code: string) => {setTwoFACode(code);};

	async function check2FACode(): Promise<any> {
		let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

		const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/auth/2fa/verify', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ twoFACode: twoFACode, token: cookieToken })
		});
		// console.log(response);
		const data = await response.json();
		if (data === true)
		{
			// console.log("SUCCESS");
			await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/auth/2fa/success', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({ token: cookieToken, status: true })
			});
			window.location.href = `${import.meta.env.VITE_FRONTEND_URL}` + "/myProfile";
		}
		return data;
	}

return (
	<div className='VerifyPage'>
		<h1>Two-Factor Authentication</h1>
		<AuthCode 
			inputClassName='Authcode' 
			allowedCharacters='numeric' 
			onChange={handleOnChange}
		/>
		<Button text="Submit" onClick={check2FACode}/>
	</div>
	);
}
	
export default Verify2FA;