'use client';
import { useState } from 'react';
import React from 'react';
import axios from 'axios'; // 引入 Axios
import { useSearchParams } from 'next/navigation'; // 引入useSearchParams
import PasswordInput from '@/components/PasswordInput';
import UsernameInput from '@/components/UsernameInput';
import Title from '@/components/Title';
import { useRouter } from 'next/navigation';

// 定義 AddNewUser 組件
export default function AddNewUser() {
    const searchParams = useSearchParams(); // 使用useSearchParams來拿URL參數email
    const email = searchParams.get('email'); // 從查詢參數中獲取 email
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter(); // 初始化 useRouter

    const addUser=async()=>{
        console.log('打後端');
        if(password.length<6){
            alert("密碼不得小於六位數！");
            setPassword("");
        }else{
            try {
                const response = await axios.post('http://35.189.180.59:40000/add_new_user/', {
                    username: username ,
                    email: email ,
                    password: password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response);
                const data = response.data;
                if (data.msg === "success") {
                    console.log("註冊成功", data);
                    router.push(`/login`);
    
                } else if (data.msg === "error") {
                    console.log("註冊失敗", data);
                    alert("註冊失敗，請再試一次！");
                } 
            } catch (error) {
                console.error("註冊失敗:", error);
    
            }
        }
    }
    return (
        <div className='flex flex-col items-center bg-gray-100 pb-32 gap-2'>
            <Title></Title>
            <div className='w-80 text-left text-xl'>設定密碼、使用者名稱</div>
            <div className='w-80 text-left text-xl'>註冊的Email: {email}</div> {/* 顯示註冊的email */}
            <PasswordInput password={password} setPassword={setPassword} />
            <UsernameInput username={username} setUsername={setUsername}/>
            <button 
                className='bg-gray-600 text-white rounded-md py-2 px-4 w-80'
                onClick={addUser}
            >
                註冊
            </button>
        </div>
    );
}