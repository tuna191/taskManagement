"use client";
import React from "react";
import {Table,TableBody,TableCaption,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
function ManageEmployee() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filterId, setFilterId] = useState("");
  const [filteredEmployee, setFilteredEmployee] = useState(null);

const fetchEmployees = async () => {
  const email = localStorage.getItem("email");

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BE}/api/employee/getEmployees`,  
      { email }  
    );
    setEmployees(response.data.employees || []);
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

  useEffect(() => {

      fetchEmployees();
      setLoading(false);
    
  }, [router]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const department = form.department.value;
    const owner = localStorage.getItem("email");

    console.log("Creating employee:", { name, email, department, owner });
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/owner/create-employee`,
        { name, email, department, owner }
      );
      if (response.data.success) {
        alert("Employee created successfully!");
      }
      e.target.reset();
      await fetchEmployees();
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BE}/api/owner/delete-employee`,
        { employeeId }
      );
      if (response.data.success) {
        alert("Employee deleted successfully!");
        await fetchEmployees();
      }
    } catch (error) {
      console.error("Error deleted employee:", error);
    }
  };
const handleSearchById = async () => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_URL_BE}/api/owner/get-employee`,
      { employeeId: filterId } 
    );
    if (res.data) {
      setFilteredEmployee(res.data);
    } else {
      setFilteredEmployee(null);
    }
  } catch (error) {
    console.error("Employee not found", error);
    setFilteredEmployee(null);
  }
};
  return (
    <div>
      <h2 className="text-2xl p-2 font-bold">Manage Employee</h2>
      <div>
        <div className="flex items-center justify-between p-4 bg-white text-black">
          <h3>{employees.length} Employees</h3>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white text-blue-400 border-blue-400"
                >
                  + Create Employee
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Employee</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateEmployee}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" required />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" name="department" required />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Input
              placeholder="filter"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchById();
                }
              }}
            />
          </div>
        </div>
      </div>
      <Table className="p-2 border ">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.id}</TableCell>

              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Active
                </span>
              </TableCell>
              <TableCell className="text-right gap-2 flex items-center justify-end">
                <Button
                  variant="outline"
                  className="bg-blue-500 text-white p-2 pr-2"
                >
                  + Edit
                </Button>
                <Button
                  className="bg-red-600 text-white p-2"
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredEmployee && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p>
            <strong>ID:</strong> {filteredEmployee.id}
          </p>
          <p>
            <strong>Name:</strong> {filteredEmployee.name}
          </p>
          <p>
            <strong>Email:</strong> {filteredEmployee.email}
          </p>
          <p>
            <strong>Department:</strong> {filteredEmployee.department}
          </p>
        </div>
      )}
    </div>
  );
}

export default ManageEmployee;
