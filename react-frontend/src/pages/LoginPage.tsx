import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';

function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('role', data.role);
            
            // Navigate to home
            navigate('/');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password || !confirmPassword) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Switch to login mode after successful registration
            setMode('login');
            setError('Registration successful! Please login');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
                </div>
                {error && <div className="login-error">{error}</div>}
                {mode === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="login-form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                className="login-input"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                disabled={loading}
                            />
                        </div>
                        <div className="login-form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="login-input"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="login-button primary"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('register');
                                setError('');
                            }}
                            className="login-button secondary"
                            disabled={loading}
                        >
                            Create Account
                        </button>
                    </form>
                )}
                {mode === 'register' && (
                    <form onSubmit={handleRegister}>
                        <div className="login-form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                className="login-input"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                disabled={loading}
                            />
                        </div>
                        <div className="login-form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="login-input"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                disabled={loading}
                            />
                        </div>
                        <div className="login-form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                className="login-input"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="login-button primary"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError('');
                            }}
                            className="login-button secondary"
                            disabled={loading}
                        >
                            Back to Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default LoginPage;