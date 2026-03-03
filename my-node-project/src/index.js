const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB 연결 URI (필요에 따라 환경변수로 빼서 사용 가능)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo-db';

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

async function startServer() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
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