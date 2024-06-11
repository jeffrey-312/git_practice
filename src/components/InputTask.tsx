"use client";
import React, { ChangeEvent, KeyboardEvent } from 'react';

// 定義 InputTask 元件的 props 類型
interface InputTaskProps {
    inputText: string;
    setInputText: (text: string) => void;//接收string當參數，並改寫任務的array
    addTask: () => void;//不接收參數且沒有返回值的函數
}
//React.FC泛型接口、指定 props 的類型為 InputTaskProps
const InputTask: React.FC<InputTaskProps> = ({ inputText, setInputText, addTask }) => {
    // 處理輸入框內容變更
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value); // 更新輸入框內容
    };

    return (
        <div className='flex gap-2'>
            <input 
                type="text" 
                value={inputText} // 綁定輸入框內容
                onChange={handleInputChange} // 綁定內容變更事件
                className='input-class' // 添加樣式類別
                placeholder='輸入任務' // 輸入框提示文字
            />
            <button 
                className='text-l shadow-md text-white bg-blue-600 rounded-md px-3 py-1'
                onClick={addTask} // 綁定點擊事件處理器
            >
                ADD
            </button>
            {/* <button className='text-l shadow-md text-white bg-orange-600 rounded-md px-3 py-1'>Clear</button> */}
        </div>
    );
};

export default InputTask;