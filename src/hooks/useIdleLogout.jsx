import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useIdleLogout = (timeoutMinutes = 15) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const logoutUser = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}logout.php`, {
                method: 'POST',
                body: JSON.stringify({ id: user.id }),
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
                    'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
                }
            }).catch(err => console.error("Failed to update offline status", err));
        }

        localStorage.removeItem('user');
        alert("You have been logged out due to inactivity.");
        navigate('/login');
    };

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
    };

    useEffect(() => {
        const activeEvents = ['mousemove', 'keydown', 'wheel', 'mousedown', 'touchstart', 'touchmove'];
        
        resetTimer();
        activeEvents.forEach(event => window.addEventListener(event, resetTimer));

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            activeEvents.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, []);
};

export default useIdleLogout;