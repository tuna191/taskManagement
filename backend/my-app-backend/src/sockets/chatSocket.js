// chatSocket.js
const onlineUsers = new Map();

let ioInstance = null;

export const getReceiverSocketId = (receiverEmail) => {
  return onlineUsers.get(receiverEmail);
};


const chatSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    socket.on("addUser", (email) => {
      onlineUsers.set(email, socket.id);
      console.log(`User ${email} online with socket ID ${socket.id}`);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });



    socket.on("disconnect", () => {
      for (const [email, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(email);
          console.log(`User ${email} disconnected`);
          io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
          break;
        }
      }
    });
  });
};

export { onlineUsers, ioInstance };
export default chatSocket;