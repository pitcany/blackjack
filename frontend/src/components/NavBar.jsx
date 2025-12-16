import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../lib/store';

export default function NavBar() {
    const { logout, user } = useStore();
    
    return (
        <nav className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-8">
                <div className="text-emerald-500 font-bold text-xl tracking-tight">Blackjack Trainer</div>
                <div className="hidden md:flex space-x-1">
                    <NavItem to="/" label="Play" />
                    <NavItem to="/learn" label="Learn" />
                    <NavItem to="/drills" label="Drills" />
                    <NavItem to="/review" label="Review" />
                </div>
            </div>
            
            <div className="flex items-center space-x-4">
                {user && (
                    <div className="hidden md:block text-sm text-neutral-400">
                        <span className="text-emerald-400">${user.bankroll?.toFixed(0)}</span>
                    </div>
                )}
                <button 
                    onClick={logout} 
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
}

function NavItem({ to, label }) {
    return (
        <NavLink 
            to={to} 
            className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`
            }
        >
            {label}
        </NavLink>
    );
}
