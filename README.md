# PollGang - Group Availability Scheduler

A comprehensive poll management system with admin controls, supporting multiple polls with unique shareable links.

## Features

- 🔐 **Admin Controls**: Only admins can create and manage polls
- 📊 **Multiple Polls**: Create unlimited polls with unique IDs
- 🔗 **Shareable Links**: Each poll gets its own URL (`?poll=poll_123`)
- 🌐 **Bilingual**: Thai/English interface
- 📱 **Responsive**: Works on all devices
- 💾 **Data Storage**: Firebase for submissions, localStorage for poll metadata

## Quick Deploy

### Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Deploy with default settings
4. Your poll system will be live!

### Manual Deployment
```bash
npm install
npm run build
# Upload dist/ folder to your web server
```

## Usage

1. Visit your deployed URL
2. Admin interface loads by default
3. Create new polls with custom month/year
4. Share poll URLs with participants
5. View results in real-time

## Admin Access

Default admin access is configured for demonstration. Update the admin emails in `Film05Vote.jsx`:

```javascript
const adminEmails = [
  'your-admin@email.com',
  'admin@yoursite.com'
];
```

## Poll URLs

Each poll gets a unique URL format:
- Main admin: `https://yoursite.com`
- Individual poll: `https://yoursite.com?poll=poll_1234567890`

## Tech Stack

- React 18
- Firebase
- Webpack
- CSS3

Built with ❤️ by ToniKroosome