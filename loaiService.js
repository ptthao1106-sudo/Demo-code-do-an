const LoaiTienIch = require('../models/LoaiTienIch');
const TienIch = require('../models/TienIch');
const demoStore = require('../data-demo');

function isDemo() { return global.demoMode === true; }
function nextId(items, field) { return Math.max(0, ...items.map(x => Number(x[field]) || 0)) + 1; }

async function listTypes() {
  if (isDemo()) return demoStore.types.map(x => ({ ...x }));
  return LoaiTienIch.find().sort({ MaLoai: 1 }).lean();
}

async function createType(payload) {
  if (isDemo()) { const item = { _id: `demo-type-${Date.now()}`, MaLoai: nextId(demoStore.types, 'MaLoai'), ...payload }; demoStore.types.push(item); return item; }
  const last = await LoaiTienIch.findOne().sort({ MaLoai: -1 }).lean();
  return LoaiTienIch.create({ ...payload, MaLoai: (last?.MaLoai || 0) + 1 });
}

async function updateType(id, payload) {
  if (isDemo()) { const index = demoStore.types.findIndex(x => x._id === id); if (index < 0) throw new Error('Không tìm thấy loại tiện ích.'); demoStore.types[index] = { ...demoStore.types[index], ...payload }; return demoStore.types[index]; }
  const item = await LoaiTienIch.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!item) throw new Error('Không tìm thấy loại tiện ích.');
  return item;
}

async function deleteType(id) {
  if (isDemo()) { const type = demoStore.types.find(x => x._id === id); if (!type) throw new Error('Không tìm thấy loại tiện ích.'); if (demoStore.utilities.some(x => x.MaLoai === type.MaLoai)) throw new Error('Loại tiện ích đang được sử dụng bởi tiện ích khác.'); demoStore.types.splice(demoStore.types.indexOf(type), 1); return type; }
  const type = await LoaiTienIch.findById(id);
  if (!type) throw new Error('Không tìm thấy loại tiện ích.');
  const count = await TienIch.countDocuments({ MaLoai: type.MaLoai });
  if (count > 0) throw new Error('Loại tiện ích đang được sử dụng bởi tiện ích khác.');
  await type.deleteOne();
  return type;
}

module.exports = { listTypes, createType, updateType, deleteType };
