const service = require('../services/tienIchService');

async function getAll(req, res) {
  try {
    const items = await service.listUtilities({
      q: req.query.q || '',
      maLoai: req.query.maLoai,
      activeOnly: req.query.admin !== 'true'
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function create(req, res) {
  try {
    res.status(201).json(await service.createUtility(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    res.json(await service.updateUtility(req.params.id, req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function remove(req, res) {
  try {
    await service.deleteUtility(req.params.id);
    res.json({ message: 'Đã xóa tiện ích.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { getAll, create, update, remove };
