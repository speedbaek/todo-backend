require('dotenv').config();

// MongoDB Atlas SRV 연결 시 Node.js DNS 해석 이슈 방지 (querySrv ECONNREFUSED 대응)
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB 연결 URI (필요에 따라 환경변수로 빼서 사용 가능)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo-db';
if (!process.env.MONGO_URI) {
  console.warn('MONGO_URI 환경변수가 없습니다. 로컬 기본값을 사용합니다.');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// 할 일 목록 조회
app.get('/api/todos', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const todos = await db.collection('todos').find().sort({ createdAt: -1 }).toArray();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 할 일 추가
app.post('/api/todos', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title이 필요합니다.' });
    }
    const doc = {
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
    };
    const result = await db.collection('todos').insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 할 일 수정 (완료 토글 등)
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: '잘못된 id입니다.' });
    const { completed, title } = req.body;
    const update = {};
    if (typeof completed === 'boolean') update.completed = completed;
    if (typeof title === 'string') update.title = title.trim();
    if (Object.keys(update).length === 0) return res.status(400).json({ error: '수정할 필드가 없습니다.' });
    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 할 일 삭제
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: '잘못된 id입니다.' });
    const result = await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 할 일 앱 페이지 (SPA 폴백)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

async function startServer() {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('몽고디비 연결 성공');

    const db = client.db();
    app.locals.db = db;

    app.listen(PORT, () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('몽고디비 연결 실패:', error);
    process.exit(1);
  }
}

startServer();