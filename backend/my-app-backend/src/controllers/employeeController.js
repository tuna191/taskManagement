import  db  from '../config/firebase.js';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { doc, getDocs, setDoc, collection, where,query ,updateDoc} from 'firebase/firestore';
export const verifyToken = async (req, res) => {
  const {token} = req.body;

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const q = query(collection(db, 'employees'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Email not found" });
    }
    res.status(200).json({ email });
  }catch(error) {
    console.error("Token verification failed:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
}

export const completeSetup = async (req, res) => {

  const {email, password} = req.body;
  try{
    const q = query(collection(db, 'employees'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Email not found" });
    }

    const employeeDoc = querySnapshot.docs[0];
    const employeeId = employeeDoc.id;

    const employeeRef = doc(db, 'employees', employeeId);

    const hashPassword = await bcrypt.hash(password, 10);

    await updateDoc(employeeRef, {
      password: hashPassword,
      isVerified: true
    });
    res.status(200).json({ success: true, message: "Password setup successful" });
  }catch(error) {
    console.error("Setup failed:", error);
    return res.status(500).json({ message: "Setup failed" });
  }
}

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra email tồn tại
    const q = query(collection(db, 'employees'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ 
        success: false,
        message: "Email không tồn tại trong hệ thống" 
      });
    }

    const employeeDoc = querySnapshot.docs[0];
    const employeeData = employeeDoc.data();

    // Kiểm tra tài khoản đã xác thực chưa
    if (!employeeData.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: "Tài khoản chưa được xác thực. Vui lòng kích hoạt tài khoản trước khi đăng nhập." 
      });
    }

    // Kiểm tra mật khẩu (vẫn giữ bcrypt để bảo mật)
    const isPasswordValid = await bcrypt.compare(password, employeeData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Mật khẩu không chính xác" 
      });
    }

    // Trả về thông tin nhân viên mà không tạo token JWT
    const responseData = {
      success: true,
      employee: {
        id: employeeDoc.id,
        email: employeeData.email,
        name: employeeData.name,
        department: employeeData.department,
        owner: employeeData.owner,
        isVerified: employeeData.isVerified
      },
      // Thêm timestamp để client có thể validate
      loggedInAt: new Date().toISOString()
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi hệ thống khi đăng nhập" 
    });
  }
}

export const getEmployees = async (req, res) => {
  const {email} = req.body;
  try {
    const q = query(collection(db, 'employees'), where('owner', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Email not found" });
    }

    const employees = [];
    querySnapshot.forEach(doc => {
      employees.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
  
}
