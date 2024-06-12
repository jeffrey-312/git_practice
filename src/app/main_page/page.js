"use client";
import { useEffect, useState } from 'react';
import Task from '@/components_main/Maintask';
import Popup from '@/components_main/Popup';
import Popup2 from '@/components_main/Popup2';
import Dailytasks from '@/components_main/Dailytasks';
import Subtasks from '@/components_main/Subtasks';
import SearchResults from '@/components_main/SearchResult';
import { useRouter } from 'next/navigation'; // 从 next/navigation 引入 useRouter
import moment from 'moment';

export default function Maintask({ maintask }) {
    const [tasks, setTasks] = useState(maintask || []);
    const [expandedTasks, setExpandedTasks] = useState({});
    const [expandedSubtasks, setExpandedSubtasks] = useState({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPopup2Open, setIsPopup2Open] = useState(false);
    const [dailytasks, setDailytasks] = useState(maintask || []);
    const [subtasks, setSubtasks] = useState(maintask || []);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [isSearchResultOpen, setIsSearchResultOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = sessionStorage.getItem('user_id');
            if (!userId) {
                console.error('User ID not found in sessionStorage');
                alert("請先登入");
                router.push('/login');
            } else {
                setUserId(userId);
                const username = sessionStorage.getItem('username');
                setUsername(username);
            }
        }
    }, [router]);

    const handleSearch = async () => {
        const date = searchDate.trim() || 'none';
        const keyword = searchKeyword.trim() || 'none';

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search_task/`, {//反引號插入環境變數
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    date: date,
                    keyword: keyword
                })
            });
            const data = await response.json();
            if (data.msg === 'success') {
                setSearchResult(data);
                setIsSearchResultOpen(true);
            }
        } catch (error) {
            console.error('Error searching task:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            async function fetchData() {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_todolist/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            user_id: userId
                        })
                    });
                    const data = await response.json();
                    setTasks(data.maintask);
                    setDailytasks(data.dailytask);
                    setSubtasks(data.subtask);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }

            fetchData();
        }
    }, [userId]);

    const toggleTask = (name) => {
        setExpandedTasks(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const logOut = () => {//登出功能
        const confirmation = window.confirm("是否真的要登出?");
        if (confirmation) {
            sessionStorage.removeItem('user_id');
            router.push('/login');
        }
    };

    const changePassword = () => {//更改密碼
        const confirmation = window.confirm("確定要更改密碼？");
        if (confirmation) {
            router.push('/changepassword');
        }
    };

    const toggleSubtask = (parentName, name) => {
        setExpandedSubtasks(prev => ({
            ...prev,
            [parentName]: {
                ...prev[parentName],
                [name]: !prev[parentName]?.[name]
            }
        }));
    };

    const handleAddTask = async (taskData) => {//增加主任物
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add_maintask/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: taskData.name,
                    start: taskData.start.replace("T", " "),
                    end: taskData.end.replace("T", " "),
                    state: "processing",
                    description: taskData.description
                })
            });
            const data = await response.json();
            if (data.msg === 'success') {// 新增成功
                window.location.reload();
            }else if(data.msg === 'Maintask name already exists'){// 主任務已經存在
                alert("新增主任務失敗，主任務已經存在！");
            }else if(data.msg === 'invalid time'){//時間錯誤
                alert("新增主任務失敗，時間無效！");
            }else if(data.msg === 'error'){// 新增失敗
                alert("新增主任務失敗，請再試一次！");
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleAddDailyTask = async (taskData) => {//增加小任務
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add_small_task/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: taskData.name,
                    end: taskData.end.replace("T", " "),
                    state: "processing",
                    belong: taskData.belong,
                    description: taskData.description
                })
            });
            const data = await response.json();
            if (data.msg === 'dailytask add successful' || data.msg === 'subtask add successful') {// 新增小任務成功、新增子任務成功
                window.location.reload();
            }else if (data.msg === 'this daily task already exist') {// 小任務重複
                alert("新增小任務失敗，小任務重複！");
            }else if (data.msg === 'this subtask already exist') {// 子任務重複
                alert("新增子任務失敗，子任務重複！");
            }else if (data.msg === "maintask doesn't exist") {// 主任務不存在
                alert("新增子任務失敗，主任務不存在！");
            }else if (data.msg === 'invalid time') {// 時間錯誤
                alert("新增任務失敗，時間無效！");
            }else if (data.msg === 'the state of the maintask is not processing') {// 主任務已經完成或失敗
                alert("新增子任務失敗，主任務已經完成或失敗！");
            }else if (data.msg === 'error') {// 其餘錯誤
                alert("新增任務失敗，請再試一次！");
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const getTaskStyle = (endTime) => {//返回不同的樣式
        const now = moment();
        const end = moment(endTime);
        const diff = end.diff(now, 'minutes');//計算兩個時間點之間的差異

        if (diff <= 60) {
            return { color: 'red' };
        } else if (diff <= 180) {
            return { color: 'orange' };
        } else {
            return {};
        }
    };

    return (
        <div className="container bg-slate-200">
            <div className="maintask ">
                <div className='text-2xl text-gray-600'>User:{username}</div>{/* 要放入username */}
                <div className='gap-2'>
                    <button className='bg-gray-400 text-white rounded-md w-20' onClick={logOut}>登出</button>
                    <button className='bg-gray-400 text-white rounded-md w-20' onClick={changePassword}>更改密碼</button>
                </div>
                <div>----------------------</div>
                <button className='bg-gray-400 text-white rounded-md w-1/2' onClick={() => setIsPopupOpen(true)}>Add Maintask</button>
                <h1>Maintask</h1>
                {tasks && tasks.map(task => (
                    task && task.name && (
                        <div
                            key={task.name}
                            style={getTaskStyle(task.end)}//顏色判斷
                        >
                            <Task
                                task={task}
                                expandedTasks={expandedTasks}
                                toggleTask={toggleTask}
                                expandedSubtasks={expandedSubtasks}
                                toggleSubtask={toggleSubtask}
                            />
                        </div>
                    )
                ))}
                {isPopupOpen && (
                    <Popup
                        onClose={() => setIsPopupOpen(false)}
                        onSubmit={handleAddTask}
                    />
                )}
                {isPopup2Open && (
                    <Popup2
                        onClose={() => setIsPopup2Open(false)}
                        onSubmit={handleAddDailyTask}
                        tasks={tasks}
                    />
                )}
            </div>

            <div className="search bg-slate-300 py-5 pl-4">
                <h1>Search Tasks</h1>
                <input
                    type="text"
                    placeholder="Keyword"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                />
                <button className='bg-gray-400 text-white rounded-md w-1/4' onClick={handleSearch}>Search</button>
            </div>

            <div className="dailytask">
                <h1>-------Today's task-------</h1>
                <button className='bg-gray-400 text-white rounded-md w-1/2' onClick={() => setIsPopup2Open(true)}>Add Task</button>
                <h1>Dailytask</h1>
                {dailytasks && dailytasks.map(task => (
                    <div
                    key={task.name}
                    style={getTaskStyle(task.end)}//顏色判斷
                >
                    <Dailytasks
                        task={task}
                        expandedTasks={expandedTasks}
                        toggleTask={toggleTask}
                    />
                </div>
                ))}
            </div>

            <div className="subtask">
                <h1>Subtask</h1>
                {subtasks && subtasks.map(task => (
                    task && task.name && (
                        <div
                            key={task.name}
                            style={getTaskStyle(task.end)}//顏色判斷
                        >
                            <Subtasks
                                task={task}
                                expandedTasks={expandedTasks}
                                toggleTask={toggleTask}
                            />
                        </div>
                    )
                ))}
            </div>

            {isSearchResultOpen && (
                <SearchResults
                    searchResult={searchResult}
                    onClose={() => setIsSearchResultOpen(false)}
                    toggleTask={toggleTask}
                />
            )}

            <style jsx>{`
                .container {
                    display: grid;
                    grid-template-areas:
                        'maintask search search'
                        'maintask dailytask dailytask'
                        'maintask subtask subtask';
                        
                    grid-gap: 10px;
                    padding: 20px;
                }
                .maintask {
                    grid-area: maintask;
                    width: 80%;
                    gap: 16px;
                }
                .search {
                    grid-area: search;
                    width: 80%;
                }
                .dailytask {
                    grid-area: dailytask;
                    width: 80%;
                }
                .subtask {
                    grid-area: subtask;
                    width: 80%;
                }
            `}</style>
        </div>
    );
}
  