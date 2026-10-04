const TienIch = require('../models/TienIch');
const LoaiTienIch = require('../models/LoaiTienIch');
const demoStore = require('../data-demo');

function isDemo() { return global.demoMode === true; }
function nextId(items, field) { return Math.max(0, ...items.map(x => Number(x[field]) || 0)) + 1; }

async function listUtilities({ q = '', maLoai, activeOnly = true }) {
  if (isDemo()) {
    const keyword = q.trim().toLowerCase();
    return demoStore.utilities.filter(item => (!activeOnly || item.TrangThai) && (!maLoai || item.MaLoai === Number(maLoai)) && (!keyword || `${item.TenTienIch} ${item.DiaChi} ${item.MoTa}`.toLowerCase().includes(keyword))).map(item => ({ ...item, TenLoai: demoStore.types.find(t => t.MaLoai === item.MaLoai)?.TenLoai || 'Chưa phân loại' }));
  }
  const filter = {};
  if (activeOnly) filter.TrangThai = true;
  if (maLoai) filter.MaLoai = Number(maLoai);

  if (q.trim()) {
    const keyword = q.trim();
    filter.$or = [
      { TenTienIch: { $regex: keyword, $options: 'i' } },
      { DiaChi: { $regex: keyword, $options: 'i' } },
      { MoTa: { $regex: keyword, $options: 'i' } }
    ];
  }

  const [items, types] = await Promise.all([
    TienIch.find(filter).sort({ MaTienIch: 1 }).lean(),
    LoaiTienIch.find().lean()
  ]);
  const typeMap = new Map(types.map((type) => [type.MaLoai, type.TenLoai]));

  return items.map((item) => ({ ...item, TenLoai: typeMap.get(item.MaLoai) || 'Chưa phân loại' }));
}

async function validateType(MaLoai) {
  if (isDemo()) {
    const type = demoStore.types.find(x => x.MaLoai === Number(MaLoai) && x.TrangThai);
    if (!type) throw new Error('MaLoai không tồn tại hoặc loại tiện ích đang tắt.');
    return;
  }
  const type = await LoaiTienIch.findOne({ MaLoai: Number(MaLoai), TrangThai: true });
  if (!type) throw new Error('MaLoai không tồn tại hoặc loại tiện ích đang tắt.');
}

async function createUtility(payload) {
  await validateType(payload.MaLoai);
  if (isDemo()) {
    const item = { _id: `demo-utility-${Date.now()}`, MaTienIch: nextId(demoStore.utilities, 'MaTienIch'), NgayCapNhat: new Date().toISOString(), ...payload };
    demoStore.utilities.push(item);
    return item;
  }
  const last = await TienIch.findOne().sort({ MaTienIch: -1 }).lean();
  return TienIch.create({ ...payload, MaTienIch: (last?.MaTienIch || 0) + 1, NgayCapNhat: new Date() });
}

async function updateUtility(id, payload) {
  if (payload.MaLoai !== undefined) await validateType(payload.MaLoai);
  if (isDemo()) {
    const index = demoStore.utilities.findIndex(x => x._id === id);
    if (index < 0) throw new Error('Không tìm thấy tiện ích.');
    demoStore.utilities[index] = { ...demoStore.utilities[index], ...payload, NgayCapNhat: new Date().toISOString() };
    return demoStore.utilities[index];
  }
  const item = await TienIch.findByIdAndUpdate(
    id,
    { ...payload, NgayCapNhat: new Date() },
    { new: true, runValidators: true }
  );
  if (!item) throw new Error('Không tìm thấy tiện ích.');
  return item;
}

async function deleteUtility(id) {
  if (isDemo()) {
    const index = demoStore.utilities.findIndex(x => x._id === id);
    if (index < 0) throw new Error('Không tìm thấy tiện ích.');
    return demoStore.utilities.splice(index, 1)[0];
  }
  const item = await TienIch.findByIdAndDelete(id);
  if (!item) throw new Error('Không tìm thấy tiện ích.');
  return item;
}

module.exports = { listUtilities, createUtility, updateUtility, deleteUtility };
