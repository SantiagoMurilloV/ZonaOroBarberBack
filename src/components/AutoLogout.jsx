import React, { useEffect } from 'react';

const AutoLogout = ({ children, onLogout, isAdmin, navigate }) => {
    let logoutTimer;

    const handleUserActivity = () => {
        if (logoutTimer) clearTimeout(logoutTimer);

        if (!isAdmin) {
            logoutTimer = setTimeout(() => {
                onLogout();
                navigate('/login'); 
            }, 1200000); 
        }
    };

    useEffect(() => {
        
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        window.addEventListener('scroll', handleUserActivity);
        window.addEventListener('mousemove', handleUserActivity);

        return () => {
            clearTimeout(logoutTimer);
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
            window.removeEventListener('mousemove', handleUserActivity);
        };
    }, []);

    return children;
};

export default AutoLogout;
