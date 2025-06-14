"use client";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "@/app/components/ChatHeader";
import MessageInput from "@/app/components/MessageInput";
import { formatMessageTime } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { 
    authUser
  } = useAuthStore();
  const [currentEmail, setCurrentEmail] = useState(null);
  const messageEndRef = useRef(null);
  const [roleUser, setRoleUser] = useState("");
  useEffect(() => {
    const email = localStorage.getItem("email");
    setCurrentEmail(email);
    setRoleUser(authUser.role);
  }, []);

  // Lấy tin nhắn khi đã có selectedUser và email
  useEffect(() => {
    if (!selectedUser || !currentEmail) return;

    const receiverEmail = roleUser === "employee" ? selectedUser.id : selectedUser.email;

    getMessages({ sender: currentEmail, receiver: receiverEmail });
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?.email,
    currentEmail,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Tự động cuộn xuống tin nhắn mới
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${
              message.sender === currentEmail ? "justify-end" : "justify-start"
            }`}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            {/* Chat bubble container */}
            <div
              className={`flex max-w-xs md:max-w-md lg:max-w-lg ${
                message.sender === currentEmail
                  ? "flex-row-reverse"
                  : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 h-10 w-10 rounded-full border overflow-hidden">
                <img
                  src={"https://github.com/shadcn.png"}
                  alt="profile pic"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Message content */}
              <div
                className={`mx-2 flex flex-col ${
                  message.sender === currentEmail ? "items-end" : "items-start"
                }`}
              >
                <span className="text-xs text-gray-500 mb-1">
                  {formatMessageTime(
                    new Date(message.createdAt.seconds * 1000)
                  )}
                </span>

                {/* Bubble */}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender === currentEmail
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
