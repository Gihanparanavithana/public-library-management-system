# Lanka Library Network — Vanilla Frontend Conversion

This package is a React/Tailwind-free conversion of the Figma Make frontend into:

- HTML
- CSS
- Vanilla JavaScript
- PHP API structure
- MySQL schema

## Important cleanup

The original Figma Make project contained demo/fake book records, member names, dashboard numbers and client-side mock state. Those demo records are intentionally removed from this version. Catalogue/member/reservation areas show empty states until real MySQL data is added.

## Folder structure

```text
Library-System/
├── index.html
├── css/style.css
├── js/app.js
├── pages/
├── assets/
├── backend/
│   ├── config/database.php
│   ├── auth/
│   ├── books/
│   ├── members/
│   ├── reservations/
│   └── dashboard/
├── database/schema.sql
└── README.md
```

## Run with XAMPP

1. Copy the `Library-System` folder to `C:\xampp\htdocs\`.
2. Start Apache and MySQL in XAMPP.
3. Open phpMyAdmin.
4. Import `database/schema.sql`.
5. Check `backend/config/database.php` if your MySQL username/password differs from the XAMPP defaults.
6. Open:
   `http://localhost/Library-System/`

## Authentication

The login/register UI is now plain HTML/JS and calls PHP endpoints:

- `backend/auth/login.php`
- `backend/auth/register.php`
- `backend/auth/logout.php`
- `backend/auth/session.php`

Passwords must be stored with PHP `password_hash()` and checked with `password_verify()`.

## Current backend scope

Authentication is wired as the first backend layer. The book list endpoint and add-book endpoint are included as the next integration layer. Members, reservations and dashboard endpoints can be added by the corresponding group members against the same schema.

## Team modules

- Authentication: login/register/session/logout
- Books: catalogue/add/edit/delete/search
- Members: registration/list/suspend/restore
- Reservations: create/approve/decline/history
- Dashboard: statistics and integration/testing
