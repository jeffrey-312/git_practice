"use client"
import { useState } from 'react';
export default function Task({ content }: { content: string }){
    return(
        <div className='w-2/3 flex flex-col gap-2'>
            <div className="flex justify-between items-center rounded-md px-2 py-1 bg-gray-200 gap-2">
                <div className='flex gap-2'>
                    <input type="checkbox" />
                    <div className='text-xl'>{content}</div>{/* 印出各個訊息 */}
                </div>
                <div className="flex gap-2">
                    <button className='text-l shadow-md text-white bg-red-600 rounded-md px-1'>Delete</button>
                </div>
            </div>
        </div>
    )
}