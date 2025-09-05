
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => {
    return (
        <div className="bg-neutral-800 p-6 rounded-lg flex items-center space-x-4 border border-neutral-700 hover:border-primary-500 transition-all duration-300">
            <div className="bg-neutral-700 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-neutral-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
