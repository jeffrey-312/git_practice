"use client";
import { useState } from 'react';
import EmailInput from '@/components/EmailInput';
import PasswordInput from '@/components/PasswordInput';
import { useRouter } from 'next/navigation'; // 從 next/navigation 引入 useRouter

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter(); // 初始化 useRouter

    const handleLogin = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password//加hash MD5
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.msg === "success") {
                console.log("登入成功:", data);
                sessionStorage.setItem('user_id', data.user_id);
                sessionStorage.setItem('username', data.username);
                alert('登入成功');
                router.push("/main_page");
            } else {
                alert('請輸入正確的帳號密碼');
                console.log("登入失敗:", data.msg);
                // 根據 data.msg 的內容進行相應的提示或處理
            }
        } catch (error) {
            console.error("發生錯誤:", error);
        }
    };

    return (
        <div className='flex flex-col items-center bg-gray-100 pb-32 gap-2'>
            <div className='text-xl text-gray-600'>To-Do Lister</div>
            <div className='text-2xl'>Log In</div>
            <EmailInput email={email} setEmail={setEmail} />
            <PasswordInput password={password} setPassword={setPassword} />
            <button 
                className='bg-gray-600 text-white rounded-md py-2 px-4 w-80'
                onClick={handleLogin}
            >
                登入
            </button>
            
            <div className='w-80 flex justify-between'>
                <div>
                    <a href="/forgetpassword" className='text-green-800 underline'>忘記密碼?</a>
                </div>
                <div>
                    <a href="/signup" className='text-blue-600 underline '>第一次使用To-Do Lister?</a>
                </div>
                
            </div>
        </div>
    );
};

export default Login;
