"use client";

import axios from "axios";
import {Table,TableBody,TableCaption,TableCell,TableFooter,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {Dialog,DialogClose,DialogContent,DialogFooter,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import {Select,SelectContent,SelectGroup,SelectItem,SelectLabel,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [employeeData, setEmployeeData] = useState([]);
  const [employeeValue, setEmployeeValue] = useState("");
  const [title, setTitle] = useState("");
  const total = tasks.length;

  
  const fetchEmployees = async () => {
    const email = localStorage.getItem("email");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/employee/getEmployees`,
        { email }
      );
      setEmployeeData(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

 
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
    fetchEmployees();
    fetchTasks();
  }, []);
  const handleAddTask = async (e) => {
    e.preventDefault();
    const ownerEmail = localStorage.getItem("email");

    console.log("employeeEmail:", employeeValue);
    console.log("ownerEmail:", ownerEmail);
    console.log("title:", title);
    console.log("date:", date.toISOString().split("T")[0]); // format YYYY-MM-DD
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_URL_BE}/api/tasks/addTask`, {
        employeeEmail: employeeValue,
        ownerEmail,
        title,
        date: date.toISOString().split("T")[0], // format YYYY-MM-DD
      });

      if (response.data.success) {
        fetchTasks();

        // Reset form
        setEmployeeValue("");
        setTitle("");
        setDate(new Date());
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_URL_BE}/api/tasks/deleteTask`, { taskId });
      if (response.data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="w-full  mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">
          Tasks
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Add Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddTask}>
              <DialogHeader>
                <DialogTitle>Add Tasks</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="employee">Employee Email</Label>
                  <Select
                    value={employeeValue}
                    onValueChange={(value) => setEmployeeValue(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {employeeData.map((emp) => (
                          <SelectItem key={emp.email} value={emp.email}>
                            {emp.email}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table className="border border-gray-200 rounded-2xl">
        <TableCaption>List of tasks assigned to employees</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Task ID</TableHead>
            <TableHead>Employee</TableHead>
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
              <TableCell>{task.employeeEmail}</TableCell>
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

                   <Button variant="destructive"
                  onClick={() => handleDeleteTask(task.id)}
                   
                   >Destructive</Button>
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