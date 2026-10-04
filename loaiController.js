const service = require('../services/loaiService');

async function getAll(req, res) {
  try { res.json(await service.listTypes()); }
  catch (error) { res.status(500).json({ message: error.message }); }
}

async function create(req, res) {
  try { res.status(201).json(await service.createType(req.body)); }
  catch (error) { res.status(400).json({ message: error.message }); }
}

async function update(req, res) {
  try { res.json(await service.updateType(req.params.id, req.body)); }
  catch (error) { res.status(400).json({ message: error.message }); }
}

async function remove(req, res) {
  try {
    await service.deleteType(req.params.id);
    res.json({ message: 'Đã xóa loại tiện ích.' });
  } catch (error) { res.status(400).json({ message: error.message }); }
}

module.exports = { getAll, create, update, remove };
