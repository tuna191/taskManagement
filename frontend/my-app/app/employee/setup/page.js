"use client"
import { useEffect, useState} from 'react'
import { useRouter ,useSearchParams} from 'next/navigation'
import React from 'react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios'

export default function SetupPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const router = useRouter();
    useEffect(() =>{
        const fetchEmail = async () => {
            try{
                const res = await axios.post(`${process.env.NEXT_PUBLIC_URL_BE}/api/employee/verify-token`, { token });
                setEmail(res.data.email);
            }catch (error) {
                setMessage('Cannot verify your email')
            }
        }
        if(token) fetchEmail();
    },[token])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_URL_BE}/api/employee/complete-setup`, { email, password });
            if (res.data.success) {
                setMessage('Password setup successful');
                setTimeout(() =>{
                    router.push('/employee/login');

                },2000)
            } else {
                setMessage('Failed to setup password');
            }
        } catch (error) {
            setMessage('An error occurred');
        }
    }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='bg-white p-8 rounded-lg shadow-md w-7/12 '>
            <h2 className="text-xl font-bold mb-4">Setup password for {email}</h2>
            {message && (
                <div className="mb-4 text-red-500">
                    {message}
                </div>
            )}
            <form className='space-y-4' onSubmit={handleSubmit}>
                <Input
                    type={"password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Input
                    type={"password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <Button type="submit" className="w-full">SAVE</Button>
            </form>
        </div>
    </div>
  )
}
