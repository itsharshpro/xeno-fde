import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-black rounded-full animate-spin`}></div>
            <p className="text-black text-sm">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
