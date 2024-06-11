"use client";
import React, { ChangeEvent } from 'react';

interface EmailInputProps {
    Vcode: string;
    setVcode: (email: string) => void;
}
//驗證碼元件
const VcodeInput: React.FC<EmailInputProps> = ({ Vcode, setVcode }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setVcode(e.target.value); // 更新驗證碼
    };

    return (
        <div className='w-80'>
            <div className='text-left mb-1'>輸入驗證碼:</div>
            <input 
                className="text-xl rounded-md shadow-md w-full p-2 mb-4"
                type="text" 
                placeholder='XXXXXX'
                value={Vcode} 
                onChange={handleChange}
            />
        </div>
    );
};

export default VcodeInput;