"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/owner/create-access-code`,
        { email }
      );
      console.log("Access code sent to email:", email);
      setMessage("sended to email!");
      setStep(2);
    } catch (error) {
      setMessage("error sending access code. Please try again.");
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/owner/validate-access-code`,
        { email, accessCode }
      );
      if (response.data.success) {

        useAuthStore.getState().setAuthUser({
          email: response.data.owner.email,
          role: "owner",
          name: response.data.owner.name,
          isVerified: true,
        });

        localStorage.setItem("selectedRole", "owner");
        localStorage.setItem("email", email);

        useAuthStore.getState().connectSocket();
      console.log("Response from server:", response.data.owner.email);

        setMessage("Successfull, redirecting ...");
        router.push("/owner/dashboard")
      }
    } catch (error) {
      setMessage("Mã truy cập không hợp lệ. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <p className="text-center text-sm text-gray-600">
          {step === 1
            ? "Please enter your email to sign in"
            : "Enter the verification code sent to your email"}
        </p>

        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@gmail.com"
              required
            />
            <Button type="submit" className="w-full">
              Send code
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <Input
              type="text"
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Verification code"
              required
            />
            <Button type="submit" className="w-full">
              Verify code
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="w-full mt-2"
            >
              Back
            </Button>
          </form>
        )}

        {message && (
          <p className="text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}
