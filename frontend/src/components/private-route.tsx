import React from 'react';
import { BrowserRouter as Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from "../pages/AuthPage"

const PrivateRoute : React.FC<{children: React.ReactElement}> = ({children}) => {

	const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

    useEffect(() => {
        checkUserToken();
        checkUser2FACode();
    }, []);

    async function checkUserToken() {
        let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/auth/42/verify', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `${cookieToken}`
            },
        });
    
        if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
            navigate('/login');
            return;
        }

        const data = await response.json();
        // console.log('data: ', data);

        if (data.error) {
            // console.log('SET FALSE');
            setIsAuthenticated(false);
        }
        else {
            // console.log('SET OK');
            setIsAuthenticated(true);
        }

    }

    async function checkUser2FACode(): Promise<any> {
    
        let cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}` + '/auth/42/verify', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `${cookieToken}`
            },
        });

        const data = await response.json();
        // console.log('2fa data.email: ', data.email);
        if (data.twoFactorVerified === true)
        {
            // console.log('2fa code is false in my user.data');
            navigate('/myProfile');
        }
        if (data.twoFactorActivated === true && data.twoFactorVerified === false)
        {
            // console.log('2fa code is true in my user.data');
            navigate('/2fa/verification');
            return;
        }    
    }

    if (isAuthenticated) {
        return children;
    }
    return (
        <>
            <AuthPage />
        </>
    );
};

export default PrivateRoute;