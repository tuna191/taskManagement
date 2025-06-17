import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  onlineUsers: [],
  socket: null,
  isSocketConnecting: false,

  // Gọi sau khi đăng nhập để lưu thông tin người dùng vào store
  setAuthUser: (userData) => {
    const authUser = {
      id: userData.email,
      email: userData.email,
      name: userData.name || userData.email.split("@")[0],
      role: userData.role,
      isVerified: userData.isVerified || false,
      createdAt: userData.createdAt,
      ...(userData.role === "employee" && {
        department: userData.department,
        owner: userData.owner,
      }),
    };

    set({ authUser });
    get().connectSocket();

    localStorage.setItem("email", userData.email);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("name", authUser.name);
    localStorage.setItem("isVerified", String(authUser.isVerified));
    if (userData.createdAt)
      localStorage.setItem("createdAt", userData.createdAt);
    if (userData.role === "employee") {
      localStorage.setItem("department", userData.department || "");
      localStorage.setItem("owner", userData.owner || "");
    }
  },

  //khôi phục trạng thái đăng nhập (authUser) sau khi reload trang
  initializeAuthUser: () => {
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (email && role) {
      const authUser = {
        id: email,
        email,
        name: localStorage.getItem("name") || email.split("@")[0],
        role,
        isVerified: localStorage.getItem("isVerified") === "true",
        createdAt: localStorage.getItem("createdAt"),
        ...(role === "employee" && {
          department: localStorage.getItem("department") || "",
          owner: localStorage.getItem("owner") || "",
        }),
      };
      set({ authUser });
      get().connectSocket();
    }
  },

  connectSocket: () => {
    const { authUser, isSocketConnecting } = get();
    if (!authUser) {
      console.error("Socket requires authenticated user");
      return Promise.reject(new Error("Unauthenticated"));
    }

    if (get().socket?.connected) return Promise.resolve();
    if (isSocketConnecting)
      return Promise.reject(new Error("Already connecting"));

    set({ isSocketConnecting: true });

    return new Promise((resolve, reject) => {
      const socket = io(`${process.env.NEXT_PUBLIC_URL_BE}`, {});

      socket.on("connect", () => {
        set({ socket, isSocketConnecting: false });
        //  ĐĂNG KÝ USER VỚI SERVER
        socket.emit("addUser", authUser.email);
        resolve();
      });
      socket.on("getOnlineUsers", (userList) => {
        console.log("List user online", userList);
        set({ onlineUsers: userList });
      });
      socket.on("connect_error", (err) => {
        set({ isSocketConnecting: false });
        reject(err);
      });
    });
  },

  logout: async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/owner/logoutOwner`
      );
      const role = get().authUser?.role; // lấy ra trước khi set null

      get().disconnectSocket();
      set({ authUser: null });

      // Xóa localStorage
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("isVerified");
      localStorage.removeItem("createdAt");
      localStorage.removeItem("token");

      if (role === "employee") {
        localStorage.removeItem("department");
        localStorage.removeItem("owner");
      }

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
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
