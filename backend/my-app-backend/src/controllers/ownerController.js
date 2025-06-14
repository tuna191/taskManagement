import db from '../config/firebase.js';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
} from 'firebase/firestore';
import { sendVerificationEmail, sendSetupEmail } from '../utils/emailSender.js';
import jwt from "jsonwebtoken";

export const createAccessCode = async (req, res) => {
  const { email } = req.body;
  
 
  try {
    // Tạo các giá trị mới
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Số ngẫu nhiên 4 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ownerData = {
      name: `owner${randomSuffix}`, // Tên dạng "owner1234"
      code,
      createdAt: new Date().toISOString(),
      isVerified: false
    };

    const ownerRef = doc(db, 'owners', email);
    await setDoc(ownerRef, ownerData, { merge: true });

    // Gửi email xác thực
    await sendVerificationEmail(email, code);

    console.log(`Created owner ${email} with code: ${code}`);
    res.json({ 
      success: true, 
      message: 'Mã xác thực đã được gửi qua email',
      tempName: ownerData.name // Trả về tên tạm để hiển thị UI
    });

  } catch (error) {
    console.error('Error creating access code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi hệ thống khi tạo mã truy cập'
    });
  }
};

export const testconnectFirebase = async (req, res) => {
  try {
    console.log('Connecting to Firebase...');
    const testRef = doc(db, 'testCollection', 'testDoc');
    await setDoc(testRef, { status: 'connected', timestamp: new Date().toISOString() });

    const docSnap = await getDoc(testRef);

    if (docSnap.exists()) {
      res.status(200).json({ success: true, data: docSnap.data() });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



export const validateAccessCode = async (req, res) => {
  const { email, accessCode } = req.body;

  try {
    const ownerRef = doc(db, 'owners', email);
    const docSnap = await getDoc(ownerRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ success: false, error: 'Owner không tồn tại' });
    }

    const ownerData = docSnap.data();
    
    if (ownerData.code !== accessCode) {
      return res.status(400).json({ success: false, error: 'Mã xác thực không đúng' });
    }

    // Cập nhật document với đầy đủ fields
    await updateDoc(ownerRef, {
      email, // Thêm email vào document data
      isVerified: true,
      lastVerifiedAt: new Date().toISOString() // Thêm trường mới
    });

    res.json({
      success: true,
      owner: {
        ...ownerData,
        email,
        isVerified: true,
        lastVerifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi hệ thống',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createEmployee = async (req, res) => {
  const { name, email, department, owner } = req.body;
  console.log('Creating employee:', { name, email, department, owner });
  try {
    const ref = await addDoc(collection(db, 'employees'), {
      name,
      email,
      department,
      owner,
      isVerified: false,
    });
    // generate token for employee
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    // send mail setup
    await sendSetupEmail(email, token);
    res.json({ success: true, employeeId: ref.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getEmployee = async (req, res) => {
  const { employeeId } = req.body;
  console.log('Fetching employee with ID:', employeeId);
  try {
    const docRef = doc(db, 'employees', employeeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return res.status(404).json({});

    res.json(docSnap.data());
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.body;

  try {
    const docRef = doc(db, 'employees', employeeId);
    await deleteDoc(docRef);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

