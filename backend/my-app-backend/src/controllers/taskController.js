import db from '../config/firebase.js';

import { collection,doc, addDoc, Timestamp ,updateDoc, getDocs, query, where,deleteDoc} from "firebase/firestore";

export const addTask = async (req, res) => {
  try {
    const {
      employeeEmail,
      ownerEmail,
      title,
      date,
    } = req.body;

    const task = {
      employeeEmail,
      ownerEmail,
      title,
      date,
      isDone: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "tasks"), task);
    res.status(200).json({ success: true, taskId: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Add task failed" });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, message: "Task ID is required" });
    }

    await deleteDoc(doc(db, "tasks", taskId));
    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Delete task failed" });
  }
};
export const markTask = async (req, res) => {
  try {
    const { taskId, isDone } = req.body;

    if (!taskId || typeof isDone !== "boolean") {
      return res.status(400).json({ success: false, message: "Missing taskId or isDone flag" });
    }

    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      isDone,
      updatedAt: Timestamp.now()
    });

    res.status(200).json({ success: true, message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: "Update task status failed" });
  }
};


export const getTask = async (req, res) => {
  const { role, email } = req.body;
 if (!email || !role) {
    return res.status(400).json({ message: "Missing email or role" });
  }
  try {
    let q;

    if (role === "employee") {
      // Nhân viên: xem task được gán cho họ
      q = query(collection(db, "tasks"), where("employeeEmail", "==", email));
    } else if (role === "owner") {
      // Chủ: xem task mà mình giao cho các nhân viên
      q = query(collection(db, "tasks"), where("ownerEmail", "==", email));
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
};