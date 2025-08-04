# Film 05 Vote - Group Availability Scheduler

A bilingual (Thai/English) web application for Film 05 group members to vote on their availability for meetings and events. The app features a calendar-based interface for marking availability, admin functionality for managing polls, and Firebase integration for real-time data synchronization.

## 🚀 Live Demo

**🌐 Live App**: https://pollgang.onrender.com/

**📋 Quick Access URLs**:
- Homepage: https://pollgang.onrender.com/
- Vote on Dates: https://pollgang.onrender.com/?page=availability  
- Vote on Times: https://pollgang.onrender.com/?page=time-availability
- View Results: https://pollgang.onrender.com/?page=results
- Admin Panel: https://pollgang.onrender.com/?page=admin

## Features

### Core Functionality
- **Bilingual Support**: Full Thai and English language support with instant switching
- **Calendar Availability Marking**: Interactive calendar interface to mark days as:
  - ✅ Available (Green)
  - ⚠️ Maybe (Yellow)
  - ❌ Not Available (Red)
  - ⬜ Clear/No Response (Gray)
- **Restaurant Preferences**: Users can suggest restaurant preferences along with their availability
- **Real-time Updates**: Firebase integration for instant data synchronization across all users

### Admin Features
- **Password Protected Admin Panel**: Secure access for administrators
- **Poll Management**: Create and manage multiple voting sessions
- **View All Responses**: See aggregated availability data in a table format
- **Delete Submissions**: Remove individual responses when needed
- **Statistics Dashboard**: Quick overview of responses, active months, and participation

### User Interface
- **Dark/Light Mode**: Toggle between dark and light themes
- **Mobile Responsive**: Touch-friendly interface with drag-to-select on mobile devices
- **Shareable Poll Links**: Direct URLs for specific polls
- **Copy Poll URLs**: Easy sharing with one-click copy functionality

### Crash Recovery System (v2.1)
- **Auto-Save**: Automatically saves voting progress to prevent data loss
- **Recovery Detection**: Detects unsaved data when app is reopened
- **Smart Recovery**: Recovers partial votes, names, and selections up to 24 hours old
- **Navigation-Aware Recovery**: Works with new navigation history system
- **Multi-Flow Recovery**: Supports date availability, time availability, and time poll creation flows
- **Time Poll Creation Recovery**: Saves poll titles, target dates, and creation progress
- **Warning System**: Warns users before leaving with unsaved changes
- **Bilingual Recovery**: Recovery messages in both Thai and English
- **Enhanced Recovery Types**: Separate recovery for voting vs poll creation workflows

## Technology Stack

- **Frontend**: React 18.2.0
- **Backend**: Firebase Firestore
- **Build Tool**: Webpack 5
- **Styling**: Tailwind CSS (inline styles)
- **Language**: JavaScript (JSX)
- **Package Manager**: npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ToniKroosome/LocalReviewApp-Draft-3.git
cd "40 Film 05 Vote"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Direct Page URLs

Each page now has its own unique URL for easy sharing and bookmarking:

- **Homepage**: `/` (default) or `?page=home`
- **Vote Date Availability**: `?page=availability`
- **Vote Time Availability**: `?page=time-availability`
- **View Results**: `?page=results`
- **Admin Dashboard**: `?page=admin`
- **All Polls**: `?page=polls`
- **Create New Poll**: `?page=create-poll`
- **Vote on Specific Poll**: `?page=availability&poll=POLL_ID`
- **View Specific Poll Results**: `?page=results&poll=POLL_ID`

### Example URLs:
```
https://pollgang.onrender.com/                                           # Homepage
https://pollgang.onrender.com/?page=availability                         # Vote on dates
https://pollgang.onrender.com/?page=time-availability                    # Vote on times
https://pollgang.onrender.com/?page=results                              # View all results
https://pollgang.onrender.com/?page=admin                                # Admin dashboard
https://pollgang.onrender.com/?page=availability&poll=poll_1699123456789 # Specific poll voting
https://pollgang.onrender.com/?page=results&poll=poll_1699123456789      # Specific poll results
```

## Usage

### For Regular Users

1. **Enter Your Name**: Start by entering your name on the main page
2. **Mark Availability**: 
   - Select your preferred month/year
   - Click on calendar days to mark availability:
     - Single click for available (green)
     - Use the color selector buttons to change marking mode
     - On mobile: hold and drag to select multiple days
3. **Add Restaurant Preference**: Optionally suggest a restaurant
4. **Submit**: Save your availability to share with the group

### For Administrators

1. **Access Admin Panel**: Click "Admin" button and enter password
2. **Create New Poll**: 
   - Navigate to dashboard
   - Click "View All Polls"
   - Click "Create New Poll"
   - Set title, month, and year
3. **Manage Polls**: 
   - View all created polls
   - See response counts
   - Copy shareable links
   - View detailed results
4. **Review Submissions**: 
   - Click "View Results" on any poll
   - See all responses in table format
   - Delete individual submissions if needed

### Navigation Structure

```
Homepage
├── Date Availability Flow:
│   Start Voting → Create Poll Form → Calendar Selection → Restaurant Preference → Submission Complete
├── Time Availability Flow:
│   Select Times → Create Time Poll Form → Name Input → Time Selection → Submission Complete
└── Admin Flow:
    Admin Access → Dashboard → 
    ├── Date Polls: Poll List → Create/View/Manage Date Polls
    └── Time Polls: Time Poll List → Create/View/Manage Time Polls
```

### Navigation Features (v2.1)
- **Smart Back Navigation**: Back buttons now properly navigate to the previous page instead of defaulting to admin login
- **Navigation History Tracking**: System tracks where users came from for proper back navigation
- **Consistent User Flow**: Both date and time availability follow the same poll-creation-first pattern
- **URL-based Routing**: Each page has its own URL for direct access and bookmarking
- **Unified Poll Management**: Separate admin interfaces for date polls and time polls
- **Poll Creation Workflow**: Structured creation process for both poll types

## Firebase Configuration

The app uses Firebase Firestore for data storage. Collections:
- `film05_submissions`: Stores user date availability data
- `film05_polls`: Stores date poll metadata
- `film05_time_availability`: Stores user time availability data
- `film05_time_polls`: Stores time poll metadata

## Build and Deployment

### Current Deployment
The app is currently deployed at: **https://pollgang.onrender.com/**

### Build for Production
```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Deployment Platforms

#### Render (Current)
- **URL**: https://pollgang.onrender.com/
- **Auto-deploy**: Enabled from GitHub main branch
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

#### Vercel (Alternative)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify (Alternative)
- Connect GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`

### Required Configuration Files
- `vercel.json` - Vercel deployment settings
- `public/_redirects` - SPA routing for Netlify/Render
- `public/.htaccess` - Apache server configuration
- `webpack.config.js` - Build configuration with correct publicPath

## Local Storage

The app uses localStorage for:
- Poll metadata (when Firebase permissions are restricted)
- User preferences (theme, language)

## Security

- Admin access is password-protected
- Firebase security rules should be configured to protect data
- No sensitive data is stored in the client code

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**ToniKroosome**

## Acknowledgments

- Film 05 group members for feedback and testing
- Firebase for real-time database services
- React community for excellent documentation

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**: Check Firebase configuration and network connection
2. **Build Errors**: Ensure all dependencies are installed with `npm install`
3. **Calendar Not Responsive**: Clear browser cache and reload
4. **Admin Password Not Working**: Default password is "MayChim"

### Development Tips

- Use `npm run dev` for hot-reload development
- Check browser console for debugging information
- Firebase data can be viewed in Firebase Console

## Recent Updates (v2.1)

### ✅ Completed
- [x] **Time slot selection** - Users can now vote on specific hours throughout the day
- [x] **Fixed navigation issues** - Back buttons now work correctly with proper history tracking
- [x] **Consistent user flows** - Both date and time voting follow the same name-input pattern
- [x] **Smart back navigation** - No more unexpected redirects to admin login
- [x] **Time Poll Management** - Complete admin interface for creating and managing time polls
- [x] **Time Poll Creation Flow** - Structured poll creation similar to date polls
- [x] **Enhanced Crash Recovery** - Supports time poll creation workflow recovery

### 🔄 Enhanced Features
- **Navigation System**: Complete overhaul with history tracking and proper back navigation
- **Time Availability**: Full implementation with poll creation → time selection → submission flow
- **Time Poll Management**: Admin interface for creating, viewing, and managing time voting sessions
- **User Experience**: Consistent patterns across all voting flows
- **Crash Recovery v2.1**: Extended support for time poll creation and enhanced recovery workflows

## Future Enhancements

- [ ] Email notifications for new polls
- [ ] Export availability data to CSV
- [ ] Integration with calendar apps
- [ ] Vote on multiple options (not just dates/times)
- [ ] Anonymous voting option
- [ ] Poll expiration dates
- [ ] Bulk user import
- [ ] Calendar integration (Google Calendar, Outlook)