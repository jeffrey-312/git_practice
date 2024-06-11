"use client";
import React, { ChangeEvent } from 'react';

interface PasswordInputProps {
    password: string;
    setPassword: (password: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ password, setPassword }) => {
    //React.FunctionComponent:函数组件，React.FC會依照Props定義好的屬性型別帶入參數，有點像平時我們寫function帶入參數的概念一樣
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value); // 更新Password
    };

    return (
        <div className='w-80'>
            <div className='text-left mb-1'>Password:</div>
            <input 
                className="text-xl rounded-md shadow-md w-full p-2 mb-4"
                type="password" 
                placeholder='XXXXXX' 
                value={password} 
                onChange={handleChange}
            />
        </div>
    );
};

export default PasswordInput;