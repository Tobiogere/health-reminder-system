---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn
- Expo CLI
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Tobiogere/health-reminder-system.git
cd health-reminder-system
```

### 2. Backend Setup
```bash
cd health_system
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 3. Web Frontend Setup
```bash
cd frontend/frontend
npm install
npm start
```

### 4. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

> ⚠️ **Important:** Before running the mobile app, update the API base URL in `mobile/src/config.js` with your machine's local IP address. Run `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows) to find it.

---

## 🔑 Test Accounts

| Role | Username | Password |
|---|---|---|
| Patient | RUN/CMP/22/12937 | newpassword123 |
| Doctor | STF/DOC/001 | Smartkid2.0 |
| Pharmacist | STF/PHARM/001 | test1234 |
| Admin | admin001 | test1234 |

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/login | Authenticate user, return JWT token |
| POST | /auth/register | Register a new user |
| POST | /prescriptions/ | Doctor creates a prescription |
| GET | /prescriptions/queue | Pharmacist retrieves pending prescriptions |
| PATCH | /prescriptions/{id}/dosage | Pharmacist adds dosage and generates schedule |
| GET | /patients/{id}/medications/today | Patient retrieves today's medications |
| PATCH | /medications/{id}/taken | Patient marks a dose as taken |
| POST | /patients/{id}/renewals | Patient submits a renewal request |
| PATCH | /renewals/{id}/approve | Pharmacist approves a renewal request |
| GET | /notifications/ | Retrieve user notifications |
| PATCH | /notifications/read-all | Mark all notifications as read |
| GET | /schedules/missed-doses/ | Doctor views missed doses by patient |
| GET | /drugs/ | Retrieve approved drug formulary |
| POST | /drugs/suggest | Doctor suggests a new drug |
| PATCH | /drugs/{id}/approve | Admin approves a drug suggestion |

---

## ⚙️ Email Configuration (Caregiver Alerts)

To enable caregiver email notifications for missed doses, add the following to `health_system/settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'RUN Med Reminder <your-email@gmail.com>'
```

> Use a Gmail App Password (not your regular password). Enable 2-Step Verification on your Google account first, then generate an App Password under Security settings.

To manually trigger missed dose checks:
```bash
python manage.py check_missed_doses
```

---

## 📊 Usability Testing Results

The system was evaluated using the **System Usability Scale (SUS)** with **32 participants** drawn from all three user categories.

| Metric | Result |
|---|---|
| Total Participants | 32 |
| Average SUS Score | **79.8 / 100** |
| Grade | **B — Good** |
| Participants scoring 90+ (Excellent) | 43.8% (14/32) |
| Accepted usability threshold | 68 |
| Doctor average | 90.0 |
| Pharmacist average | 90.0 |
| Student patient average | 79.2 |

---

## 🔐 Security

- JWT-based authentication on all protected endpoints
- Role-Based Access Control (RBAC) — each user only accesses role-appropriate data
- Doctors can only view prescriptions they personally created for a patient
- Password hashing using Django's built-in PBKDF2 algorithm
- CSRF protection and SQL injection prevention via Django ORM
- Input validation on both frontend and backend

---

## 🖥️ System Requirements

### Software
| Platform | Requirement |
|---|---|
| Desktop OS | Windows 10+, macOS, or Linux |
| Mobile OS | Android 9+ or iOS 13+ |
| Browser | Chrome, Firefox, Safari, Edge (latest) |

### Hardware
| Component | Minimum |
|---|---|
| Desktop CPU | Intel Core i3 or equivalent |
| Mobile CPU | Quad-core smartphone processor |
| RAM (Desktop) | 4 GB or more |
| RAM (Mobile) | 2 GB or more |
| Storage (Server) | At least 20 GB free |
| Internet | 10 Mbps or faster |

---

## 👥 Team — Group 2

| Name | Matric Number |
|---|---|
| Babatope Ayomide Victor | RUN/CMP/22/12871 |
| Ogereka Oluwatobiloba Evelyn | RUN/CMP/22/12957 |
| Adeboye Tobiloba Jeremiah | RUN/CMP/22/12796 |
| Moradeyo Peter Ayoade | RUN/CMP/22/12937 |
| Odebode Elijah Oluwatobi | RUN/CMP/22/12948 |

**Supervisor:** Dr. T. A. Olowookere
**Institution:** Redeemer's University, Ede, Osun State, Nigeria
**Department:** Computer Science, Faculty of Computing and Digital Technologies
**Year:** 2026

---

## 📄 License
This project was developed as a final year project for academic purposes at Redeemer's University. All rights reserved.