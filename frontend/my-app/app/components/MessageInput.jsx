"use client";
import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { selectedUser } = useChatStore();
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { 
    authUser, 
    socket, 
    connectSocket,
    isSocketConnecting 
  } = useAuthStore();

useEffect(() => {
  if (authUser) {
    // Chỉ gọi connectSocket nếu socket chưa kết nối và không đang kết nối
    if (!socket && !isSocketConnecting) {
      const initializeSocket = async () => {
        try {
          await connectSocket();
          setIsSocketReady(true);
        } catch (err) {
          console.error("Socket error:", err);
          toast.error("Lỗi kết nối chat");
        }
      };
      initializeSocket();
    } else if (socket?.connected) {
      setIsSocketReady(true);
    }
  }
}, [authUser, socket, isSocketConnecting]);
  console.log ("Auth User:", authUser);
  console.log ("Socket:", socket);
  console.log ("Is Socket Ready:", isSocketReady);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!authUser) {
      console.error("Auth user not found in store");
      return;
    }

    setIsSending(true);

    try {
      if (!socket?.connected) {
        toast.loading("Đang kết nối...");
        await connectSocket();
        toast.dismiss();
      }

      const receiver = authUser.role === "employee" 
        ? selectedUser?.id 
        : selectedUser?.email;

      if (!receiver) {
        throw new Error("Không tìm thấy người nhận");
      }

      await sendMessage({
        sender: authUser.email,
        receiver,
        text: text.trim(),
      });

      setText("");
    } catch (error) {
      console.error("Send message failed:", error);
      toast.error(error.message || "Gửi tin nhắn thất bại");
    } finally {
      setIsSending(false);
    }
  };

  // Kiểm tra điều kiện hiển thị
  const showNotLoggedInWarning = !authUser;
  const showConnectingStatus = authUser && !isSocketReady;

  return (
    <div className="p-4 w-full">
      {showNotLoggedInWarning && (
        <div className="text-red-500 mb-2 text-sm">
          Vui lòng đăng nhập để chat
        </div>
      )}

      {showConnectingStatus && (
        <div className="text-yellow-600 mb-2 text-sm flex items-center gap-2">
          <span className="loading loading-spinner loading-xs"></span>
          Đang kết nối với máy chủ chat...
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isSocketReady || isSending}
          />
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={
            !text.trim() || 
            !isSocketReady || 
            isSending || 
            !authUser ||
            !selectedUser
          }
        >
          {isSending ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;