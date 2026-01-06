import { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';
import api from '../lib/api';


// Configure axios to send cookies with every request
api.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Assumes an endpoint that returns the user if a session is active
                const { data } = await api.get('/api/auth/me');
                setUser(data.user);

                console.log("user is ", user);
            } catch (error) {
                // No active session or an error occurred
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        setUser(data.user);
    };

    const register = async (email, password, name) => {
        await api.post('/api/auth/register', { email, password, name });
    };

    const logout = async () => {
        await api.post('/api/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
