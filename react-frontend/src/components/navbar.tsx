import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Nav.css';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <a href="/" className="navbar-logo">
                    📋 Task Management
                </a>

                <button className="navbar-toggle" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-nav ${isMenuOpen ? 'show' : ''}`}>
                    <li>
                        <a href="/" className={isActive('/')}>
                            Tasks
                        </a>
                    </li>
                    <li>
                        <a href="/calendar" className={isActive('/calendar')}>
                            Calendar
                        </a>
                    </li>
                    
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;