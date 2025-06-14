import db from "../config/firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { onlineUsers, ioInstance } from "../sockets/chatSocket.js";
export const getSidebarUsers = async (req, res) => {
  const { email, role } = req.body;

  try {
    if (role === "owner") {
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("owner", "==", email));
      const snapshot = await getDocs(q);

      const employees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json(employees);
    }

    if (role === "employee") {
      const employeeRef = collection(db, "employees");
      const q = query(employeeRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty)
        return res.status(404).json({ message: "Employee not found" });

      const employeeData = snapshot.docs[0].data();
      const ownerEmail = employeeData.owner;

      const ownerRef = doc(db, "owners", ownerEmail);
      const ownerSnap = await getDoc(ownerRef);

      if (!ownerSnap.exists())
        return res.status(404).json({ message: "Owner not found" });

      return res.status(200).json({ id: ownerSnap.id, ...ownerSnap.data() });
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (error) {
    console.error("Error fetching sidebar users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const chatId = [sender, receiver].sort().join("_");
    const message = {
      chatId,
      sender,
      receiver,
      text,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "messages"), message);

    // Emit qua Socket nếu receiver đang online
    const receiverSocketId = onlineUsers.get(receiver);
    const senderSocketId = onlineUsers.get(sender);
    if (receiverSocketId) {
      ioInstance.to(receiverSocketId).emit("newMessage", {
        id: docRef.id,
        ...message,
      });
    }
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      ioInstance.to(senderSocketId).emit("newMessage", {
        id: docRef.id,
        ...message,
      });
    }

    res.status(200).json({ id: docRef.id, ...message });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Missing sender or receiver" });
    }

    const chatId = [sender, receiver].sort().join("_");

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt")
    );

    const snapshot = await getDocs(q);
    const messages = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // đảm bảo là đúng cặp (sender, receiver)
      if (
        (data.sender === sender && data.receiver === receiver) ||
        (data.sender === receiver && data.receiver === sender)
      ) {
        messages.push({ id: doc.id, ...data });
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
