# Firebase Setup Guide

This site now pulls **Contacts** (GitHub/WhatsApp/Twitter shown on the homepage
and contact page) and **Projects** from Firebase, and has an `admin.html`
panel to manage both. Follow these steps once.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com/ and click **Add project**.
2. Give it a name (e.g. `shauryababu-site`), disable Google Analytics if you
   don't need it, and click **Create project**.

## 2. Register a Web App

1. In the project overview, click the **</>** (web) icon to add a web app.
2. Give it a nickname (e.g. `portfolio`). You do **not** need Firebase Hosting.
3. Firebase will show you a `firebaseConfig` object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "shauryababu-site.firebaseapp.com",
     projectId: "shauryababu-site",
     storageBucket: "shauryababu-site.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
4. Copy these values into **`firebase-config.js`** in this repo, replacing
   the `PASTE_YOUR_...` placeholders.

> These keys are safe to be public in client-side code — they are not
> secrets. Real protection comes from the Firestore Security Rules in step 5.

## 3. Enable Firestore Database

1. In the left sidebar, go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (we'll set custom rules in step 5).
4. Pick a region close to you (e.g. `asia-south1` for India) and click **Enable**.

## 4. Enable Email/Password Authentication

1. In the left sidebar, go to **Build > Authentication**.
2. Click **Get started**.
3. Under **Sign-in method**, enable **Email/Password**.
4. Go to the **Users** tab and click **Add user**.
5. Enter:
   - Email: `babushaurya888@gmail.com`
   - Password: (choose a strong password — this is your admin login)
6. Click **Add user**.

This is the *only* account that will be allowed to write to the database —
enforced by the security rules below, not just by the login form.

## 5. Set Firestore Security Rules

1. Go to **Firestore Database > Rules** tab.
2. Replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /contacts/{docId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == "babushaurya888@gmail.com";
    }

    match /projects/{docId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == "babushaurya888@gmail.com";
    }
  }
}
```

3. Click **Publish**.

This means: anyone can *read* contacts/projects (so the public site works),
but only a signed-in user with the exact email `babushaurya888@gmail.com`
can add, edit, or delete anything.

## 6. Add your data

You don't need to manually create documents in the Firebase console —
just open `admin.html` on your live site, log in with the email/password
from step 4, and use the **Contacts** and **Projects** tabs to add entries.

- **Contacts**: Add GitHub, WhatsApp, Twitter (icon, label, display text,
  URL, and an order number — lower numbers show first).
- **Projects**: Add each project (icon, title, description, comma-separated
  tech stack, live demo URL, GitHub URL). The most recently added project
  automatically shows first on the homepage, tagged "Latest".

## 7. Push to GitHub

Once `firebase-config.js` has your real keys, commit and push everything
(including `admin.html`, `admin.js`, `site-data.js`, `firebase-config.js`)
to your GitHub repo like normal. GitHub Pages will serve it as static files;
Firebase handles the dynamic data from the browser.

## 8. Restrict admin.html from search engines (optional but recommended)

`admin.html` already has `<meta name="robots" content="noindex, nofollow">`
so search engines won't index it, but the URL itself isn't secret — anyone
who finds it will just hit the login screen, and only your one email/password
can get past it. If you want it hidden entirely, you could rename the file
to something non-obvious (e.g. `admin-sb2026.html`) before pushing.

## Troubleshooting

- **"Missing or insufficient permissions" error**: your security rules
  (step 5) probably weren't published, or you're not logged in with the
  exact admin email.
- **Nothing shows up on the site**: check the browser console (F12) for
  errors — usually a typo in `firebase-config.js`, or Firestore rules not
  published yet.
- **Login says "not authorized for admin access"**: you logged in with a
  different email than `babushaurya888@gmail.com`. Only that exact account
  works, by design.
