//使用user id來改密碼

//輸入原密碼
//輸入新密碼
//change(BTU)
'use client';
import { useState } from 'react';
import React from 'react';
import axios from 'axios'; // 引入 Axios
import { useSearchParams } from 'next/navigation'; // 引入useSearchParams
import PasswordInput from '@/components/PasswordInput';
import Title from '@/components/Title';
import { useRouter } from 'next/navigation';

// 定義 resetpassword 組件
export default function resetpassword() {
    const searchParams = useSearchParams(); // 使用useSearchParams來拿URL參數email
    // const email = searchParams.get('email'); // 從查詢參數中獲取 email
    const [password, setPassword] = useState("");
    const router = useRouter(); // 初始化 useRouter
    const user_id=sessionStorage.getItem('user_id');
    const changepassword=async()=>{
        console.log('打後端');
        if(password.length<6){
            alert("密碼不得小於六位數！");
            setPassword("");
        }else{
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/change_password/`, {
                    user_id : user_id,    
                    email: "none" ,
                    new_password: password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response);
                const data = response.data;
                if (data.msg === "success") {
                    console.log("更改成功", data);
                    alert("更改成功！請重新登入~");
                    router.push(`/login`);
                } else if (data.msg === "error") {
                    console.log("更改失敗", data);
                    alert("更改失敗，請再試一次！");
                } 
            } catch (error) {
                console.error("更改失敗:", error);
    
            }
        }
    }
    return (
        <div className='flex flex-col items-center bg-gray-100 pb-32 gap-2'>
            <Title></Title>
            <div className='w-80 text-left text-xl'>更改密碼</div>
            
            <PasswordInput password={password} setPassword={setPassword} />
            <button 
                className='bg-gray-600 text-white rounded-md py-2 px-4 w-80'
                onClick={changepassword}
            >
                重設密碼
            </button>
        </div>
    );
}