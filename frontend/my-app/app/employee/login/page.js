"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BE}/api/employee/login-employee`,
      { email, password }
    );
    console.log("Login response:", response.data.employee.email);
    if (response.data.success) {
      // Giải mã token để lấy thông tin user
      localStorage.setItem("selectedRole", "employee");
      localStorage.setItem("email",  response.data.employee.email);
      localStorage.setItem("name", response.data.employee.name || "");
      localStorage.setItem("department", response.data.employee.department || "");
      localStorage.setItem("owner", response.data.employee.owner || "");

      useAuthStore.getState().setAuthUser({
        email: response.data.employee.email,
        role: "employee",
        name: response.data.employee.name ,
        department: response.data.employee.department ,
        owner: response.data.employee.owner,
        isVerified: true,
      });

      useAuthStore.getState().connectSocket();

      setMessage("Đăng nhập thành công! Đang chuyển hướng...");
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/employee/dashboard").then(() => {
        window.location.reload();
      });
    }
  } catch (error) {
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          {message && (
            <div className="text-red-500 text-sm mt-2">{message}</div>
          )}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
