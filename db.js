const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('✓ MongoDB đã kết nối');
    return true;
  } catch (error) {
    console.warn(`⚠ MongoDB chưa sẵn sàng: ${error.message}`);
    console.warn('⚠ Hệ thống chuyển sang DEMO MODE để vẫn chạy được giao diện và luồng trình diễn.');
    return false;
  }
}

module.exports = connectDatabase;
