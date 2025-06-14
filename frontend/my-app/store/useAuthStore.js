import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const BASE_URL = "http://localhost:4000"; // Hoặc process.env.NEXT_PUBLIC_SOCKET_URL

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Gọi sau khi đăng nhập để lưu thông tin người dùng vào store
setAuthUser: (userData) => {
  const authUser = {
    id: userData.email,
    email: userData.email,
    name: userData.name || userData.email.split('@')[0],
    role: userData.role,
    isVerified: userData.isVerified || false,
    createdAt: userData.createdAt,
    ...(userData.role === 'employee' && {
      department: userData.department,
      owner: userData.owner
    })
  };

  set({ authUser });
  get().connectSocket();

  // Lưu các thông tin cần thiết vào localStorage
  localStorage.setItem('email', userData.email);
  localStorage.setItem('role', userData.role);
  localStorage.setItem('name', authUser.name);
  localStorage.setItem('isVerified', String(authUser.isVerified));
  if (userData.createdAt) localStorage.setItem('createdAt', userData.createdAt);
  if (userData.role === 'employee') {
    localStorage.setItem('department', userData.department || '');
    localStorage.setItem('owner', userData.owner || '');
  }
},

initializeAuthUser: () => {
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  if (email && role) {
    const authUser = {
      id: email,
      email,
      name: localStorage.getItem("name") || email.split('@')[0],
      role,
      isVerified: localStorage.getItem("isVerified") === 'true',
      createdAt: localStorage.getItem("createdAt"),
      ...(role === 'employee' && {
        department: localStorage.getItem("department") || '',
        owner: localStorage.getItem("owner") || ''
      })
    };
    set({ authUser });
    get().connectSocket();
  }
},


logout: async () => {
  try {
    await axios.post("/auth/logout");
    get().disconnectSocket();
    set({ authUser: null });
    
    // Xóa tất cả localStorage items
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("isVerified");
    localStorage.removeItem("createdAt");
    localStorage.removeItem("token");
    if (get().authUser?.role === 'employee') {
      localStorage.removeItem("department");
      localStorage.removeItem("owner");
    }
    
    toast.success("Logged out successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Logout failed");
  }
},


connectSocket: () => {
  const { authUser, isSocketConnecting } = get();
  if (!authUser) {
    console.error("Socket requires authenticated user");
    return Promise.reject(new Error("Unauthenticated"));
  }
  
  if (get().socket?.connected) return Promise.resolve();
  if (isSocketConnecting) return Promise.reject(new Error("Already connecting"));

  set({ isSocketConnecting: true });
  
  return new Promise((resolve, reject) => {
    const socket = io(`${process.env.NEXT_PUBLIC_URL_BE}`, {
      // ... config
    });

    socket.on("connect", () => {
      set({ socket, isSocketConnecting: false });
      // THÊM DÒNG NÀY ĐỂ ĐĂNG KÝ USER VỚI SERVER
      socket.emit("addUser", authUser.email);
      resolve();
    });

    socket.on("connect_error", (err) => {
      set({ isSocketConnecting: false });
      reject(err);
    });
  });
},

disconnectSocket: () => {
  const { socket } = get();
  if (socket) {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("getOnlineUsers");
    socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  }
},



}));