# 🏏 IPL CHATTA BAZAR — Complete Setup Guide

## Project Structure
```
ipl-betting/
├── backend/         ← Spring Boot + MySQL
│   └── src/main/java/com/iplbet/
│       ├── model/          (User, Match, Bet, Transaction)
│       ├── repository/     (JPA repos)
│       ├── service/        (Business logic)
│       ├── controller/     (REST APIs)
│       ├── security/       (JWT auth)
│       ├── config/         (Security config)
│       └── dto/            (Request/Response DTOs)
└── frontend/        ← React.js
    └── src/
        ├── pages/          (Login, UserDashboard, AdminDashboard)
        ├── components/     (Sidebar)
        ├── services/       (api.js - axios)
        └── context/        (AuthContext)
```

---

## ✅ PREREQUISITES

- **Java 17+** → https://adoptium.net
- **Maven 3.8+** → https://maven.apache.org/download.cgi
- **MySQL 8.0+** → https://dev.mysql.com/downloads/mysql/
- **Node.js 18+** → https://nodejs.org
- **ngrok** (free) → https://ngrok.com

---

## 🗄️ STEP 1: MySQL Database Setup

```sql
-- Open MySQL CLI or MySQL Workbench and run:
CREATE DATABASE ipl_betting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ipluser'@'localhost' IDENTIFIED BY 'iplpass123';
GRANT ALL PRIVILEGES ON ipl_betting.* TO 'ipluser'@'localhost';
FLUSH PRIVILEGES;
```

Then update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ipl_betting?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=ipluser
spring.datasource.password=iplpass123
```

---

## ⚙️ STEP 2: Run Spring Boot Backend

```bash
cd ipl-betting/backend

# Build & Run
mvn spring-boot:run

# OR build JAR and run:
mvn clean package -DskipTests
java -jar target/ipl-betting-1.0.0.jar
```

✅ Backend starts on: `http://localhost:8080`

**Auto-created admin account:**
- Username: `admin`
- Password: `admin123`

Test it:
```bash
curl http://localhost:8080/api/auth/ping
# Should return: {"status":"IPL Betting API is running!"}
```

---

## 🎨 STEP 3: Run React Frontend

```bash
cd ipl-betting/frontend
npm install
npm start
```

✅ Frontend starts on: `http://localhost:3000`

---

## 🌐 STEP 4: Live with ngrok (FREE)

### Install ngrok:
```bash
# macOS
brew install ngrok

# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Windows - download from https://ngrok.com/download
```

### Create free ngrok account:
1. Go to https://ngrok.com → Sign Up (free)
2. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken
3. Run: `ngrok config add-authtoken YOUR_TOKEN_HERE`

### Expose BACKEND (Port 8080):
```bash
# Terminal 1 — Keep backend running
cd backend && mvn spring-boot:run

# Terminal 2 — Expose backend
ngrok http 8080
```
You'll get a URL like: `https://abc123.ngrok-free.app`

### Update Frontend API URL:
Create `frontend/.env`:
```
REACT_APP_API_URL=https://abc123.ngrok-free.app
```

### Expose FRONTEND (Port 3000):
```bash
# Terminal 3 — Keep frontend running
REACT_APP_API_URL=https://abc123.ngrok-free.app npm start

# Terminal 4 — Expose frontend
ngrok http 3000
```
You'll get frontend URL like: `https://xyz789.ngrok-free.app`

Share this frontend URL with your users! 🎉

---

## 🏆 HOW THE APP WORKS

### Admin Flow:
1. Login at `/login` → Username: `admin`, Password: `admin123`
2. **Create Users** → Users tab → "Create User" → set username + password
3. **Add Money** → Click "Add Balance" next to any user
4. **Create Match** → Matches tab → "Add Match" → select teams + date + odds
5. **Open Betting** → Click "🟢 Open Bets" on a match
6. **Declare Result** → Click "🏆 Declare Result" → select winner → bets auto-settle!

### User Flow:
1. Login with credentials given by admin
2. View balance in sidebar / wallet tab
3. Go to Matches → Click "Bet MI" or "Bet CSK"
4. Enter amount → Place Bet
5. Wait for result → balance auto-updated if won

---

## 🔑 API Endpoints Reference

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/login | Login (admin or user) |
| GET | /api/auth/ping | Health check |

### Admin (requires ADMIN JWT)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/admin/users | Get all users |
| POST | /api/admin/users/create | Create user |
| POST | /api/admin/users/add-balance | Add virtual balance |
| POST | /api/admin/users/{id}/toggle-status | Enable/disable user |
| POST | /api/admin/users/{id}/reset-password | Reset password |
| GET | /api/admin/matches | All matches |
| POST | /api/admin/matches | Create match |
| PUT | /api/admin/matches/{id} | Update match |
| POST | /api/admin/matches/declare-result | Declare winner + settle bets |
| DELETE | /api/admin/matches/{id} | Cancel + refund bets |
| GET | /api/admin/bets | All bets |

### User (requires USER JWT)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/user/wallet | Balance + transactions |
| GET | /api/user/matches | Open betting matches |
| GET | /api/user/matches/all | All matches |
| POST | /api/user/bets | Place a bet |
| GET | /api/user/bets | My bets |
| GET | /api/user/profile | My profile |

---

## 💡 PRO TIPS

1. **Multiple tunnels on ngrok free**: You can only run 1 tunnel at a time on free plan.
   - **Solution**: Run both backend and frontend behind ONE ngrok tunnel using nginx reverse proxy:
   ```nginx
   server {
     listen 80;
     location /api { proxy_pass http://localhost:8080; }
     location / { proxy_pass http://localhost:3000; }
   }
   ```
   Then: `ngrok http 80` — share ONE URL for everything!

2. **Keep ngrok alive**: Free plan sessions expire after 2 hours.
   Use `ngrok http 8080 --log=stdout` to see logs.

3. **Production build** (faster frontend):
   ```bash
   cd frontend
   npm run build
   # Serve with: npx serve -s build -l 3000
   ```

4. **Change admin password**: Login as admin → call API or add a change-password endpoint.

---

## 🔧 Troubleshooting

**CORS error?** → Make sure `application.properties` CORS origins match your ngrok URL, or use the wildcard `*` configuration (already set).

**JWT expired?** → Default is 24 hours. Change `jwt.expiration` in `application.properties`.

**MySQL connection refused?** → Ensure MySQL service is running: `sudo service mysql start`

**Port 8080 in use?** → Change `server.port=8085` in `application.properties` and update `package.json` proxy.
