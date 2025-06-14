"use client";

import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";


export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const total = tasks.length;

   
  const fetchTasks = async () => {
    const role = localStorage.getItem("selectedRole");
    const email = localStorage.getItem("email");
    console.log("Fetching tasks for role:", role, "and email:", email);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/tasks/getTask`,
        { role,email }
      );
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
   useEffect(() => {
    fetchTasks();
  }, []);

  const handleDone = async (taskId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/tasks/markTask`,
        { taskId, isDone: true }
      );
      if (response.data.success) {
        console.log("Task marked as done:", taskId);
        fetchTasks(); // Refresh tasks after marking one as done
      } else {
        console.error("Failed to mark task as done:", response.data.message);
      }
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  }


  return (
    <div className="w-full  mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">
          Tasks List
        </h2>
      </div>

      <Table className="border border-gray-200 rounded-2xl">
        <TableCaption>List of tasks of employees</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Task ID</TableHead>
            <TableHead>Owner Email</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead >Date</TableHead>
            <TableHead className="text-right">Action</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.id}</TableCell>
              <TableCell>{task.ownerEmail}</TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                {task.isDone ? (
                  <span className="text-green-600 font-semibold">Done</span>
                ) : (
                  <span className="text-yellow-500 font-semibold">Pending</span>
                )}
              </TableCell>
              <TableCell>{task.date}</TableCell>
              <TableCell className="text-right">

             <Button onClick={() => handleDone(task.id)}>Done</Button>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total tasks</TableCell>
            <TableCell className="text-right">{total}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}