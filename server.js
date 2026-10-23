const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGODB_URI);
let tasks; // collection "tasks": { _id, noi_dung, trang_thai, createdAt }

const validId = (id) => ObjectId.isValid(id);

// Xem danh sach
app.get('/api/tasks', async (req, res) => {
  const list = await tasks.find().sort({ createdAt: -1 }).toArray();
  res.json(list);
});

// Them viec
app.post('/api/tasks', async (req, res) => {
  const noi_dung = String(req.body.noi_dung || '').trim();
  if (!noi_dung) return res.status(400).json({ loi: 'Nội dung không được để trống' });
  const doc = { noi_dung, trang_thai: 'chua_xong', createdAt: new Date() };
  const r = await tasks.insertOne(doc);
  res.status(201).json({ ...doc, _id: r.insertedId });
});

// Doi trang thai (xong / chua xong)
app.patch('/api/tasks/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ loi: 'id không hợp lệ' });
  const trang_thai = req.body.trang_thai === 'da_xong' ? 'da_xong' : 'chua_xong';
  await tasks.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { trang_thai } });
  res.json({ ok: true });
});

// Xoa
app.delete('/api/tasks/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ loi: 'id không hợp lệ' });
  await tasks.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ ok: true });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('Thieu bien moi truong MONGODB_URI');
    process.exit(1);
  }
  await client.connect();
  tasks = client.db('todo_app').collection('tasks');
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Server chay o cong ' + port));
}
start();
