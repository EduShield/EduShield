<h1 align='center'>EduShield</h1>

## 📚 Description:
**Problem Statement:**
Student Dropout Prediction & Analysis For Quality Education

**Brief Idea About The Project:**
The aim of the project is to solve the problem of school and college students being dropped out for various reasons.

It'll have an intuitive Progressive Web App where educational institutions can upload their current students data to get the dropout prediction of those current students and provide possible solutions for prevention, using a machine learning model powered by TensorFlow.

It'll also provide in depth insights for dropped-out students in terms of educational institutes, geographic area, gender, cast, age, standard, attendance, grades, family income, poverty, mental health.

## 📡 Setup Locally:
### 📝 Prerequisites:
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/download) / [GitHub CLI](https://cli.github.com/) / [GitHub Desktop](https://desktop.github.com/)

### 🚀 Getting Started:
1. Clone the repository to your local machine:
```bash
git clone https://github.com/EduShield/EduShield
```

2. Go to the project directory:
```bash
cd EduShield
```

3. Copy the `.env.example` file to `.env` file in the root project directory:
```bash
cp .env.example .env
```
Then edit the `.env` file and add the required environment variables accordingly.

4. Firebase Setup:
- Create a new project in [Firebase](https://console.firebase.google.com/), create a web app and copy the Firebase config object to `public/js/firebaseConfig.json` file accordingly.
- From the Firebase project settings, create a new service account and download the service account key file and save it as `firebaseServiceAccountKey.json` in the root project directory.
- In the Firebase Authentication, enable the `Google` sign-in method.
- In the Firebase Storage, create a Storage bucket and add the following rules:
```cel
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Create a custom docker network (for [nginx-proxy-manager](https://nginxproxymanager.com/)):
```bash
docker network create npm
```

6. Build and run the app:
```bash
docker compose up -d
```

7. Visit: <a href="http://localhost:8080/" target="_blank" rel="noopener noreferrer">http://localhost:4000</a> 🎉

<p align='center'>----</p>