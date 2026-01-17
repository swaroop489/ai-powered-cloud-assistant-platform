import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (token) {
            // Simple decode or fetch profile. For now, assume token persists implies user is logged in
            // A real app would verify token validity or fetch /me
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/auth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            setToken(data.access_token);

            // For this simple implementation, we'll set user with email. 
            // Ideally we fetch user profile after login using the token.
            const userData = { email: email, name: email.split("@")[0] };
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const register = async (email, password, fullName) => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, full_name: fullName }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Registration failed");
            }
            return true;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
