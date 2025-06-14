import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,

getUsers: async ({ email, role }) => {
  try {
    
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BE}/api/messages/getSidebarUsers`,
      { email, role } 
    );
    
    set({ users: res.data });
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to load users");
  }
},

getMessages: async ({ sender, receiver } ) => {
    try {
      { sender, receiver } 
      console.log("Fetching messages for sender:", sender, "and receiver:", receiver);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_URL_BE}/api/messages/getMessage`, { sender, receiver });
      console.log("Fetched messages:", res.data);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    }
  },

// Cập nhật sendMessage

sendMessage: async (messageData) => {
  const authUser = useAuthStore.getState().authUser; 
  const socket = useAuthStore.getState().socket;

  if (!authUser) {
    toast.error("Bạn cần đăng nhập lại!");
    return;
  }
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_URL_BE}/api/messages/send`, messageData);

    if (socket?.connected) {
      socket.emit("sendMessage", {
        ...res.data,
        senderRole: authUser.role,
      });
    }
  } catch (error) {
    console.error("Send message error:", error);
    toast.error(error?.response?.data?.message || "Failed to send message");
  }
},


subscribeToMessages: () => {
  const { selectedUser } = get();
  const { socket, authUser } = useAuthStore.getState();
  
  if (!selectedUser || !socket || !authUser) {
    return () => {};
  }

const messageHandler = (newMessage) => {
  // Chỉ nhận tin nhắn đúng với cuộc chat đang mở
  if (
    (newMessage.sender === authUser.email && newMessage.receiver === selectedUser.email) ||
    (newMessage.sender === selectedUser.email && newMessage.receiver === authUser.email)
  ) {
    set((state) => {
      // Nếu đã có message này thì không thêm nữa
      if (state.messages.some((msg) => msg.id === newMessage.id)) return state;
      return { messages: [...state.messages, newMessage] };
    });
  }
};

  socket.on("newMessage", messageHandler);
  
  return () => {
    socket.off("newMessage", messageHandler);
  };
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
}));