import React from 'react';
import Sidebar from './Sidebar';

const MainLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
