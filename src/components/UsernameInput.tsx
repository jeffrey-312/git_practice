"use client";
import React, { ChangeEvent } from 'react';

interface UsernameInputProps {
    username: string;
    setUsername: (password: string) => void;
}
const UsernameInput: React.FC<UsernameInputProps> = ({ username, setUsername }) => {
    //React.FunctionComponent:函数组件，React.FC會依照Props定義好的屬性型別帶入參數，有點像平時我們寫function帶入參數的概念一樣
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value); // 更新Password
    };

return (
    <div className='w-80'>
        <div className='text-left mb-1'>Username:</div>
        <input 
            className="text-xl rounded-md shadow-md w-full p-2 mb-4"
            type="text" 
            placeholder='Yourname' 
            value={username} 
            onChange={handleChange}
        />
    </div>
);
}

    


export default UsernameInput;
