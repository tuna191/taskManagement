"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/app/components/Sidebar";
import NoChatSelected from "@/app/components/NoChatSelected";
import ChatContainer from "@/app/components/ChatContainer";
import { useRouter } from "next/navigation";


export default function MessagePage() {

  const { selectedUser } = useChatStore();

useEffect(() => {
  const { authUser } = useAuthStore.getState();
  console.log("authUser", authUser);
  if (!authUser) return;

  // Kết nối socket nếu chưa kết nối
  if (!useAuthStore.getState().socket?.connected) {
    useAuthStore.getState().connectSocket();
  }

  const unsubscribe = useChatStore.getState().subscribeToMessages();
  
  return () => {
    unsubscribe?.();
    useChatStore.getState().unsubscribeFromMessages();
  };
}, [useChatStore.getState().selectedUser]);


  return (
      <div className="flex items-center justify-center px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
  );
}
