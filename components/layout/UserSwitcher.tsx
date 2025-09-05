
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { ChevronDown, User as UserIcon } from 'lucide-react';

interface UserSwitcherProps {
    currentUser: User | null;
    onUserChange: (user: User) => void;
}

const UserSwitcher: React.FC<UserSwitcherProps> = ({ currentUser, onUserChange }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUsers();
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectUser = async (user: User) => {
        try {
            const response = await fetch('/api/auth/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });
            if (!response.ok) throw new Error('Failed to switch user');
            const switchedUser = await response.json();
            onUserChange(switchedUser);
            setIsOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3">
                <UserIcon size={32} className="p-1.5 bg-neutral-700 rounded-full text-neutral-300" />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-neutral-400">{currentUser.role}</p>
                </div>
                <ChevronDown size={16} className="text-neutral-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-20">
                    <ul className="py-1">
                        {users.map(user => (
                            <li key={user.id}>
                                <button
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
                                >
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-neutral-400">{user.role}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserSwitcher;
