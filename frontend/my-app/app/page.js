"use client";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
    const router = useRouter();
    const handleRole = (role) => {
      localStorage.setItem("selectedRole", role);
       if (role === 'owner') {

         router.push('/owner/login');
       } else if (role === 'employee') {
         router.push('/employee/login');
       }
     };
  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
         <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
           <h1 className="text-2xl font-bold text-center ">Select Your Role</h1>
           <div className="space-y-4">
            
             <Button onClick={() => handleRole('owner')} className="w-full">Admin</Button>
             <Button onClick={() => handleRole('employee')} className="w-full">Users</Button>
           </div>
         </div>
       </div>
  );
}
