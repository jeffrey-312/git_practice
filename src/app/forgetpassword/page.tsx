"use client";
import { useState } from 'react';
import axios from 'axios'; // 引入 Axios
import EmailInput from '@/components/EmailInput';
import VcodeInput from '@/components/VcodeInput';
import { useRouter } from 'next/navigation'; // 從 next/navigation 引入 useRouter

//Vcode就是驗證碼

const Signup: React.FC = () =>{
    const [email, setEmail] = useState("");
    const [Vcode, setVcode] = useState("");
    const [key, setKey] = useState(""); // 用於儲存返回的 key
    const router = useRouter(); // 初始化 useRouter

    const sentEmail = async () => { // 按下傳送驗證碼要做的動作
        console.log('打後端');
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forget_send/`, {
                email: email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);
            const data = response.data;
            if (data.msg === "success") {
                // console.log("驗證碼發送成功:", data);
                console.log("驗證碼發送成功");
                alert("已經發送驗證碼至信箱");
                setKey(data.key); // 儲存返回的 key
                console.log(key);
            } else if (data.msg === "email error") {
                console.log("無效的 email:", data);
                alert("無效的email");
                // setMessa ge("無效的 email");
                setKey(""); // 清空 key
            } else if (data.msg === "this email has not registered yet") {
                console.log("該email尚未註冊", data);
                alert("該email尚未註冊");
                setKey(""); // 清空 key
            }
        } catch (error) {
            console.error("發送驗證碼失敗:", error);
            setKey(""); // 清空 key
        }
    };

    const sentVCode = async () => { // 驗證驗證碼的動作
        console.log('驗證驗整碼');
        
        if(Vcode==key){
            //轉跳到頁面/resetpassword/
            // 如果密碼正確，導航到resetpassword並附加email作為查詢參數
            console.log("驗證碼正確");
            alert("驗證碼正確！")
            router.push(`/resetpassword?email=${encodeURIComponent(email)}`);
        }else if(Vcode==null){
            alert("請輸入驗證碼！");
        }else{
            alert("驗證碼錯誤！");
            setVcode("");
        }
        ////
    };

    return(
        <div className='flex flex-col items-center bg-gray-100 pb-32 gap-2'>
            <div className='text-xl text-gray-600'>To-Do Lister</div>
            <div className='text-2xl'>重設密碼</div>
            <EmailInput email={email} setEmail={setEmail} />
            <button 
                className='bg-gray-400 text-white rounded-md py-2 px-4 w-80'
                onClick={sentEmail}
            >
                獲取驗證碼
            </button>
            <VcodeInput Vcode={Vcode} setVcode={setVcode} />

            <button 
                className='bg-gray-600 text-white rounded-md py-2 px-4 w-80'
                onClick={sentVCode}
            >
                驗證
            </button>
            <div className='w-80 text-right'>
                <a href="/login" className='text-blue-600 underline'>已經有帳號了?</a>
            </div>
        </div>
    );
};

export default Signup;