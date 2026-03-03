# Render 배포 가이드 (백엔드)

## 1. Render 가입 및 저장소 연결

1. [https://render.com](https://render.com) 접속 후 **Get Started** → GitHub으로 로그인
2. **Dashboard** → **New +** → **Web Service**
3. **Connect a repository**에서 `speedbaek/todo-backend` 연결 (이미 GitHub에 올려둔 경우 목록에 표시됨)

## 2. Web Service 설정

| 항목 | 값 |
|------|-----|
| **Name** | `todo-backend` (원하는 이름) |
| **Region** | Singapore (또는 가까운 지역) |
| **Branch** | `main` |
| **Root Directory** | `my-node-project` ← **반드시 입력** |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

## 3. 환경 변수 (필수)

**Environment Variables** 섹션에서 **Add Environment Variable** 클릭 후:

- **Key**: `MONGO_URI`
- **Value**: MongoDB Atlas 연결 문자열 (로컬 `.env`의 `MONGO_URI` 값 그대로 복사)

예시 형식:
```
mongodb+srv://사용자:비밀번호@클러스터주소.mongodb.net/todo-db
```
(비밀번호에 `!` 등 특수문자 있으면 Atlas에서 복사한 그대로 사용)

## 4. 배포

- **Create Web Service** 클릭
- 빌드·배포가 끝나면 상단에 **URL** 표시 (예: `https://todo-backend-xxxx.onrender.com`)

## 5. 확인

- 해당 URL 접속 → 할 일 목록 테스트 화면이 보이면 성공
- MongoDB Atlas의 **Network Access**에서 **0.0.0.0/0** 허용되어 있어야 함

---

**Blueprint 사용 시:** 저장소에 `render.yaml`이 있으면 **New Blueprint**로 동일 저장소를 연결한 뒤, 대시보드에서 `MONGO_URI`만 입력하면 서비스가 생성됩니다.
