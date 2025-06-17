"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
  if (!token) {
    router.push("/owner/login");
    return;
  }
   
    
  },);

  if (loading) {
    return <div className="text-center p-4">Checking login.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Wellcome to Admin Dashboard</h1>
    </div>
  );
}