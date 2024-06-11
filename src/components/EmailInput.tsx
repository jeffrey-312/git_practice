"use client";
import React, { ChangeEvent } from 'react';

interface EmailInputProps {
    email: string;
    setEmail: (email: string) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({ email, setEmail }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value); // 更新Email
    };

    return (
        <div className='w-80'>
            <div className='text-left mb-1'>Email:</div>
            <input 
                className="text-xl rounded-md shadow-md w-full p-2 mb-4"
                type="email" 
                placeholder='XXX@email.com'
                value={email} 
                onChange={handleChange}
            />
        </div>
    );
};

export default EmailInput;