"use client";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();
  const [role, setRole] = useState("");

  useEffect(() => {
    const detectedRole =  localStorage.getItem("selectedRole");
    const email = authUser?.email || localStorage.getItem("email");

    setRole(detectedRole);
    getUsers( {email:email, role:detectedRole} );
  }, [getUsers, authUser]);




  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {role === "employee" ? (
          <button
            key={users.id}
            onClick={() => setSelectedUser(users)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?.id === users.id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={"https://github.com/shadcn.png"}
                alt="owner"
                className="size-12 object-cover rounded-full"
              />
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{"Owner"}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(users.id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ) : (
          Array.isArray(users) && users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${
                  selectedUser?.id === user.id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={"https://github.com/shadcn.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user.id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.name}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user.id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;