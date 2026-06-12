#  RUN Med Reminder
### Patient Medication Reminder and Prescription Management System
> A Case Study of Redeemer's University Health Centre

---

## 📖 About
RUN Med Reminder is a full-stack, multi-role healthcare application developed for Redeemer's University Health Centre. It digitizes the prescription workflow from doctor consultation to patient medication adherence, replacing a fragmented paper-based process with a coordinated digital platform.

The system connects doctors, pharmacists, patients, and admins on a single unified platform, with automated medication reminders and caregiver notifications.

---

##  Features

###  Doctor Portal
- Search patients by matric number or staff ID
- Create digital prescriptions with drug selection from approved formulary
- Suggest new drugs for admin approval
- View missed dose alerts for non-adherent patients
- View all personally written prescriptions

###  Pharmacist Portal
- Process pending prescriptions in FIFO queue
- Set dosage, frequency, duration, and reminder times
- Auto-generate dose logs for each scheduled administration
- Manage patient prescription renewal requests (approve/reject)

###  Patient Mobile App
- View today's medications with taken/missed/remaining counts
- Mark doses as taken
- View full medication schedule with dose history
- Request prescription renewals
- Receive caregiver email alerts on missed doses
- View notification history

###  Admin Dashboard
- Manage all users (activate/suspend accounts)
- Approve or reject drug suggestions from doctors
- View all prescriptions and renewals platform-wide
- Monitor missed doses and system activity

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | React.js + Bootstrap 5 |
| Mobile App | React Native + Expo |
| Backend | Python + Django 5 + Django REST Framework |
| Database | SQLite (dev) |
| Authentication | JWT (djangorestframework-simplejwt) |
| Notifications | SMTP Email (Gmail) |
| Version Control | Git / GitHub |
| API Testing | Postman |

---

##  Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn
- Expo CLI

### Backend Setup
```bash
cd health_system
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup
```bash
cd frontend/frontend
npm install
npm start
```

### Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

> **Note:** Update `mobile/src/config.js` with your local IP address before running the mobile app.

---

##  Default Test Accounts

| Role | Username | Password |
|---|---|---|
| Patient | RUN/CMP/22/12937 | newpassword123 |
| Doctor | STF/DOC/001 | Smartkid2.0 |
| Pharmacist | STF/PHARM/001 | test1234 |
| Admin | admin001 | test1234 |


