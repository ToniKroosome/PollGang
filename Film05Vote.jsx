import React, { useState, useEffect } from 'react';
import { film05Service } from './src/firebase.js';

// Import admin system from main project (adjust path as needed)
const getAdminStatus = async (userId) => {
  // This would normally import from your main project's admin system
  // For now, we'll create a simple check - replace with actual integration
  try {
    // Simulate checking against your main project's admin system
    const adminEmails = [
      'your-admin@email.com', // Replace with actual admin emails
      'admin@localrycommu.work'
    ];
    
    // In real implementation, this would check Firebase or your auth system
    return {
      isAdmin: adminEmails.includes(userId) || userId === 'admin',
      isPrimaryAdmin: userId === 'admin@localrycommu.work'
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, isPrimaryAdmin: false };
  }
};

const strings = {
  th: {
    siteTitle: 'เลี้ยงเอกฟิล์ม ศปก 05 ปี 2025',
    yourName: 'ชื่อของคุณ * เช่น มีเม 2 คน ก็ใส่ชื่อพ่วง เป็น เมไหน',
    enterName: 'กรอกชื่อของคุณ',
    nextBtn: 'ถัดไป',
    backBtn: '← กลับไปกรอก',
    seeAllBtn: '👥 ดูตารางทุกคน',
    markYour: 'เลือกวันที่ว่าง',
    monthYear: '{{month}} {{year}}',
    available: 'ว่าง (คลิกซ้าย)',
    maybe: 'ไม่แน่ใจ (ดับเบิลคลิก)',
    notAvail: 'ไม่ว่าง (คลิกขวา)',
    confirmBtn: 'ยืนยันและไปต่อ',
    restPref: 'ช่วยแนะนำร้านอาหาร 1 ร้าน',
    restPlaceholder: 'กรอกชื่อร้านอาหาร',
    submitBtn: 'ส่งข้อมูล',
    thankYou: 'ขอบคุณ {{name}}!',
    savedMsg: 'ข้อมูลวันว่างและร้านอาหารของคุณถูกบันทึกแล้ว',
    submitAnother: 'กรอกเพิ่มอีกคน',
    allTHEs: 'ตารางว่างของทุกคน',
    THEName: 'ชื่อ',
    noDataYet: 'ยังไม่มีใครกรอกข้อมูล {{month}} {{year}}',
    restPrefList: 'ร้านที่เลือก',
    noPref: 'ไม่ระบุ',
    legendAvailable: 'ว่าง',
    legendMaybe: 'ไม่แน่ใจ',
    legendNot: 'ไม่ว่าง',
    legendNone: 'ยังไม่เลือก'
  },
  en: {
    siteTitle: 'THE Availability Vote',
    yourName: 'Your Name *',
    enterName: 'Enter your name',
    nextBtn: 'Next',
    backBtn: '← Back to Submit',
    seeAllBtn: '👥 See Everybody\'s Availability',
    markYour: 'Mark Your Availability',
    monthYear: '{{month}} {{year}}',
    available: 'Available (left-click)',
    maybe: 'Maybe (double-click)',
    notAvail: 'Not Available (right-click)',
    confirmBtn: 'Confirm & Continue',
    restPref: 'Restaurant Preference',
    restPlaceholder: 'Enter restaurant name',
    submitBtn: 'Submit',
    thankYou: 'Thank you, {{name}}!',
    savedMsg: 'Your availability choices and restaurant preference have been saved.',
    submitAnother: 'Submit Another Response',
    allTHEs: 'All THEs\' Availability',
    THEName: 'THE Name',
    noDataYet: 'No THEs have submitted availability for {{month}} {{year}} yet.',
    restPrefList: 'Restaurant Preferences:',
    noPref: 'No preference',
    legendAvailable: 'Available',
    legendMaybe: 'Maybe',
    legendNot: 'Not Available',
    legendNone: 'No response'
  }
};

const useT = (lang) => (key, params = {}) => {
  let str = strings[lang][key] || strings.en[key] || key;
  Object.keys(params).forEach(k => {
    str = str.replace(`{{${k}}}`, params[k]);
  });
  return str;
};

const THEAvailabilityVote = () => {
  // Route management
  const [currentRoute, setCurrentRoute] = useState('admin-main'); // 'admin-main', 'poll-list', 'create-poll', or 'availability'
  const [currentPage, setCurrentPage] = useState('main');
  const [currentStep, setCurrentStep] = useState(1);
  const [lang, setLang] = useState('th');
  const t = useT(lang);
  const [THEName, setTHEName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(7);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [availability, setAvailability] = useState({});
  const [preferredRestaurant, setPreferredRestaurant] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [viewMonth, setViewMonth] = useState(7);
  const [viewYear, setViewYear] = useState(2025);
  const [savedData, setSavedData] = useState({});
  const [pollsData, setPollsData] = useState({});
  
  const [isPainting, setIsPainting] = useState(false);
  const [paintValue, setPaintValue] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [brush, setBrush] = useState(2); // 2=green, 1=yellow, 0=red, -1=clear/untoggle
  
  // Mobile touch support
  const [touchStarted, setTouchStarted] = useState(false);
  const [lastTouchedDay, setLastTouchedDay] = useState(null);
  
  // Admin system integration
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Poll creation states
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollMonth, setNewPollMonth] = useState(7); // Default July
  const [newPollYear, setNewPollYear] = useState(2025);
  const [currentPollId, setCurrentPollId] = useState(null);

  useEffect(() => {
    if (THEName && savedData[THEName]) {
      const data = savedData[THEName];
      setSelectedMonth(data.month);
      setSelectedYear(data.year);
      setAvailability(data.availability);
      setPreferredRestaurant(data.restaurant);
    }
  }, [THEName, savedData]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPainting(false);
      setPaintValue(null);
    };
    
    const handleGlobalTouchEnd = () => {
      setTouchStarted(false);
      setLastTouchedDay(null);
      setIsPainting(false);
      setPaintValue(null);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, []);

  // Check URL for poll ID on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pollIdFromUrl = urlParams.get('poll');
    
    if (pollIdFromUrl) {
      // Load the specific poll from URL
      const pollData = localStorage.getItem(pollIdFromUrl);
      if (pollData) {
        try {
          const poll = JSON.parse(pollData);
          setCurrentPollId(pollIdFromUrl);
          setSelectedMonth(poll.month);
          setSelectedYear(poll.year);
          setCurrentRoute('availability');
          setCurrentPage('main');
        } catch (error) {
          console.error('Error loading poll from URL:', error);
        }
      }
    }
  }, []);

  // Load submissions and polls from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load submissions
      const submissionsResult = await film05Service.loadSubmissions();
      if (submissionsResult.success) {
        setSavedData(submissionsResult.data);
      } else {
        console.error('Failed to load submissions:', submissionsResult.error);
      }
      
      // Load polls from localStorage (since Firebase permissions don't allow new collections)
      const loadLocalPolls = () => {
        const polls = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('poll_')) {
            try {
              const pollData = JSON.parse(localStorage.getItem(key));
              polls[key] = { ...pollData, id: key };
            } catch (error) {
              console.error('Error loading poll from localStorage:', key, error);
            }
          }
        }
        return polls;
      };
      
      const localPolls = loadLocalPolls();
      setPollsData(localPolls);
      
      setIsLoading(false);
    };

    loadData();

    // Set up real-time listener for submissions
    const unsubscribeSubmissions = film05Service.subscribeToSubmissions((submissions) => {
      setSavedData(submissions);
    });

    return () => {
      unsubscribeSubmissions();
    };
  }, []);

  // Admin login function
  const handleAdminLogin = async () => {
    // Simple password check - replace with your main project's auth integration
    if (adminPassword === 'MayChim') {
      setIsAdmin(true);
      setCurrentUser('admin');
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Invalid admin password');
    }
  };

  // Delete submission function
  const deleteSubmission = async (submissionName) => {
    if (isAdmin && confirm(`Delete submission from ${submissionName}?`)) {
      const result = await film05Service.deleteSubmission(submissionName);
      if (result.success) {
        // Data will be updated via real-time listener
        console.log('Submission deleted successfully');
      } else {
        alert('Failed to delete submission: ' + result.error);
      }
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsTH = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const getMonthName = (index) => {
    return lang === 'th' ? monthsTH[index] : months[index];
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getStatusColor = (status) => {
    if (isDarkMode) {
      if (status === 2) return 'bg-green-500';
      if (status === 1) return 'bg-yellow-500';
      if (status === 0) return 'bg-red-500';
      return 'bg-gray-700 hover:bg-gray-600';
    } else {
      if (status === 2) return 'bg-green-400';
      if (status === 1) return 'bg-yellow-400';
      if (status === 0) return 'bg-red-400';
      return 'bg-gray-100 hover:bg-gray-200';
    }
  };

  const getStatusText = (status) => {
    if (status === 2) return t('legendAvailable');
    if (status === 1) return t('legendMaybe');
    if (status === 0) return t('legendNot');
    return t('legendNone');
  };

  const handleNameSubmit = () => {
    if (THEName.trim()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    // Use the current poll ID if available, otherwise create a legacy format for old submissions
    const pollId = currentPollId || null; // Don't auto-create poll IDs for legacy submissions
    
    const THEData = {
      name: THEName,
      month: selectedMonth,
      year: selectedYear,
      availability: availability,
      restaurant: preferredRestaurant
    };
    
    // Only add pollId if we have a specific poll context
    if (pollId) {
      THEData.pollId = pollId;
    }

    const result = await film05Service.saveSubmission(THEData);
    
    if (result.success) {
      // Data will be updated via real-time listener
      setIsSubmitted(true);
    } else {
      alert('Failed to save submission: ' + result.error);
    }
    
    setIsSaving(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

    const handleDayClick = (day, value) => {
      const key = `${selectedYear}-${selectedMonth + 1}-${day}`;
      if (value === -1) {
        // Clear/untoggle - remove the key entirely
        setAvailability(prev => {
          const newAvailability = { ...prev };
          delete newAvailability[key];
          return newAvailability;
        });
      } else {
        setAvailability(prev => ({ ...prev, [key]: value }));
      }
    };

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${selectedYear}-${selectedMonth + 1}-${day}`;
      const status = availability[key];
      let bg = isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200';
      if (status === 2) bg = isDarkMode ? 'bg-green-500' : 'bg-green-400';
      else if (status === 1) bg = isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400';
      else if (status === 0) bg = isDarkMode ? 'bg-red-500' : 'bg-red-400';

      const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent scrolling
        setTouchStarted(true);
        setIsPainting(true);
        setLastTouchedDay(day);
        handleDayClick(day, brush);
      };

      const handleTouchMove = (e) => {
        if (!touchStarted) return;
        
        e.preventDefault(); // Prevent scrolling
        
        // Get the element under the touch point
        const touch = e.touches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (elementBelow && elementBelow.dataset.day) {
          const touchedDay = parseInt(elementBelow.dataset.day);
          if (touchedDay !== lastTouchedDay) {
            setLastTouchedDay(touchedDay);
            handleDayClick(touchedDay, brush);
          }
        }
      };

      days.push(
        <div
          key={day}
          data-day={day}
          className={`h-12 border border-gray-300 flex items-center justify-center cursor-pointer transition-colors select-none ${bg}`}
          // Mouse events (desktop)
          onMouseDown={() => {
            setIsPainting(true);
            handleDayClick(day, brush);
          }}
          onMouseEnter={() => {
            if (isPainting) handleDayClick(day, brush);
          }}
          // Touch events (mobile)
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ 
            touchAction: 'none', // Prevent default touch behaviors
            userSelect: 'none',  // Prevent text selection
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          }}
        >
          {day}
        </div>
      );
    }

    const dayHeaders = lang === 'th' 
      ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className={`max-w-md mx-auto ${isDarkMode ? 'text-white' : ''}`}>
        {/* Brush selector */}
        <div className="flex justify-center gap-2 mb-3">
          {[2,1,0,-1].map(v=>{
            let cl, icon = '';
            if (v === 2) {
              cl = isDarkMode ? 'bg-green-500' : 'bg-green-400';
            } else if (v === 1) {
              cl = isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400';
            } else if (v === 0) {
              cl = isDarkMode ? 'bg-red-500' : 'bg-red-400';
            } else if (v === -1) {
              cl = isDarkMode ? 'bg-gray-600 border-2 border-gray-400' : 'bg-gray-200 border-2 border-gray-400';
              icon = '✕';
            }
            
            return (
              <button
                key={v}
                onClick={()=>setBrush(v)}
                className={`w-10 h-10 rounded-lg ${cl} ${brush===v?'ring-2 ring-offset-1 ring-blue-600':''} touch-manipulation flex items-center justify-center text-white font-bold`}
                style={{ touchAction: 'manipulation' }}
                title={v === -1 ? (lang === 'th' ? 'ลบการเลือก' : 'Clear selection') : ''}
              >
                {icon}
              </button>
            );
          })}
        </div>
        
        <div 
          className={`grid grid-cols-7 gap-1 touch-none`}
          style={{ 
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          {dayHeaders.map(day => (
            <div key={day} className={`h-10 flex items-center justify-center font-semibold ${isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'}`}>
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const hasAvailabilitySelected = Object.keys(availability).length > 0;

  // Create Poll Page
  if (currentRoute === 'create-poll') {
    const handleCreatePoll = async () => {
      if (!newPollTitle.trim()) {
        alert('Please enter a poll title');
        return;
      }
      
      setIsSaving(true);
      
      try {
        // Store poll metadata in localStorage with unique timestamp ID
        const timestamp = Date.now();
        const pollKey = `poll_${timestamp}`;
        const pollData = {
          title: newPollTitle.trim(),
          month: newPollMonth,
          year: newPollYear,
          createdAt: new Date().toISOString(),
          createdBy: 'admin',
          id: pollKey
        };
        
        // Save to localStorage
        localStorage.setItem(pollKey, JSON.stringify(pollData));
        
        // Update polls data in state
        setPollsData(prev => ({
          ...prev,
          [pollKey]: pollData
        }));
        
        // Set the current poll ID and poll data, then navigate to voting interface
        setCurrentPollId(pollKey);
        setSelectedMonth(newPollMonth);
        setSelectedYear(newPollYear);
        setCurrentRoute('availability');
        setCurrentPage('main');
        setCurrentStep(1);
        
        // Update URL to include poll ID
        const newUrl = `${window.location.origin}${window.location.pathname}?poll=${pollKey}`;
        window.history.pushState({ pollId: pollKey }, '', newUrl);
        
        // Reset form
        setNewPollTitle('');
        setNewPollMonth(7);
        setNewPollYear(2025);
        
      } catch (error) {
        alert('Failed to create poll: ' + error.message);
      }
      
      setIsSaving(false);
    };

    return (
      <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative`}>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            className={`px-3 py-1 border rounded text-sm shadow ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="max-w-2xl mx-auto pt-16">
          <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Create New Poll
                </h1>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Set up a new availability voting session
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('admin-main')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Dashboard
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Poll Title *
                </label>
                <input
                  type="text"
                  value={newPollTitle}
                  onChange={(e) => setNewPollTitle(e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น "เลี้ยงเอกฟิล์ม ศปก 05 ปี 2025"' : 'e.g. "Film 05 Graduation Dinner 2025"'}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white'}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Default Month *
                  </label>
                  <select
                    value={newPollMonth}
                    onChange={(e) => setNewPollMonth(parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{getMonthName(index)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Year *
                  </label>
                  <select
                    value={newPollYear}
                    onChange={(e) => setNewPollYear(parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  >
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Preview
                </h3>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div><strong>Title:</strong> {newPollTitle || 'Untitled Poll'}</div>
                  <div><strong>Period:</strong> {getMonthName(newPollMonth)} {newPollYear}</div>
                  <div><strong>URL:</strong> /availability</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-0.5">ℹ️</div>
                  <div className="text-sm">
                    <div className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      How it works:
                    </div>
                    <ul className={`mt-1 space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                      <li>• Poll will be created for {getMonthName(newPollMonth)} {newPollYear}</li>
                      <li>• Users can vote on their availability for each day</li>
                      <li>• Results will be visible in the admin dashboard</li>
                      <li>• You can share the voting link with participants</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentRoute('admin-main')}
                className={`px-6 py-3 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePoll}
                disabled={!newPollTitle.trim() || isSaving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isSaving ? 'Creating Poll...' : 'Create Poll & Start Voting'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Poll List Page
  if (currentRoute === 'poll-list') {
    // Combine actual polls with submission data
    const pollsList = [];
    
    // Add created polls from pollsData
    Object.values(pollsData).forEach(poll => {
      const submissionsForPoll = Object.values(savedData).filter(submission => 
        submission.pollId === poll.id || 
        (submission.month === poll.month && submission.year === poll.year && !submission.pollId)
      );
      
      pollsList.push({
        id: poll.id,
        title: poll.title,
        month: poll.month,
        year: poll.year,
        createdAt: poll.createdAt,
        submissions: submissionsForPoll,
        totalResponses: submissionsForPoll.length,
        isCreatedPoll: true
      });
    });
    
    // Also check for orphaned submissions (submissions without a poll and no pollId)
    const submissionGroups = {};
    Object.values(savedData).forEach(submission => {
      const key = `${submission.month}-${submission.year}`;
      const hasExistingPoll = Object.values(pollsData).some(poll => 
        poll.month === submission.month && poll.year === submission.year
      );
      
      // Only include submissions that don't have a pollId and don't match any existing poll
      if (!hasExistingPoll && !submission.pollId) {
        if (!submissionGroups[key]) {
          submissionGroups[key] = {
            month: submission.month,
            year: submission.year,
            submissions: [],
            totalResponses: 0,
            isCreatedPoll: false
          };
        }
        submissionGroups[key].submissions.push(submission);
        submissionGroups[key].totalResponses++;
      }
    });
    
    // Add orphaned submission groups
    Object.values(submissionGroups).forEach(group => {
      pollsList.push({
        title: `${getMonthName(group.month)} ${group.year} (Auto-created)`,
        ...group
      });
    });

    const polls = pollsList.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    return (
      <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative`}>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            className={`px-3 py-1 border rounded text-sm shadow ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="max-w-6xl mx-auto pt-16">
          <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  All Polls
                </h1>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage all Film 05 voting sessions
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('admin-main')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Dashboard
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading polls...</p>
              </div>
            ) : polls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No Polls Created Yet
                </h3>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Create your first poll to get started
                </p>
                <button
                  onClick={() => {
                    setCurrentPollId(null); // Clear previous poll context
                    setCurrentRoute('create-poll');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Create First Poll
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map(poll => (
                  <div key={poll.id || `${poll.month}-${poll.year}`} className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {poll.title || `${getMonthName(poll.month)} ${poll.year}`}
                        </h3>
                        {poll.title && (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getMonthName(poll.month)} {poll.year}
                          </p>
                        )}
                        {poll.createdAt && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Created: {new Date(poll.createdAt).toLocaleDateString()} {new Date(poll.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${poll.totalResponses > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {poll.totalResponses > 0 ? 'Active' : 'Empty'}
                        </span>
                        {poll.isCreatedPoll && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            Created
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Responses:</span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{poll.totalResponses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Restaurant Prefs:</span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {poll.submissions.filter(s => s.restaurant).length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentPollId(poll.id || null);
                            setViewMonth(poll.month);
                            setViewYear(poll.year);
                            setCurrentRoute('availability');
                            setCurrentPage('view');
                          }}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => {
                            setCurrentPollId(poll.id || null);
                            setSelectedMonth(poll.month);
                            setSelectedYear(poll.year);
                            setCurrentRoute('availability');
                            setCurrentPage('main');
                            setCurrentStep(1);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Add Response
                        </button>
                      </div>
                      
                      {poll.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const pollUrl = `${window.location.origin}${window.location.pathname}?poll=${poll.id}`;
                              navigator.clipboard.writeText(pollUrl);
                              // Show temporary feedback
                              const button = event.target;
                              const originalText = button.textContent;
                              button.textContent = 'Copied!';
                              button.className = button.className.replace('bg-purple-600 hover:bg-purple-700', 'bg-green-600');
                              setTimeout(() => {
                                button.textContent = originalText;
                                button.className = button.className.replace('bg-green-600', 'bg-purple-600 hover:bg-purple-700');
                              }, 2000);
                            }}
                            className="flex-1 bg-purple-600 text-white py-1 px-2 rounded text-xs hover:bg-purple-700 transition-colors"
                            title="Copy shareable link for this poll"
                          >
                            📋 Copy Link
                          </button>
                          <button
                            onClick={() => {
                              const pollUrl = `${window.location.origin}${window.location.pathname}?poll=${poll.id}`;
                              window.open(pollUrl, '_blank');
                            }}
                            className="flex-1 bg-gray-600 text-white py-1 px-2 rounded text-xs hover:bg-gray-700 transition-colors"
                            title="Open poll in new tab"
                          >
                            🔗 Open
                          </button>
                        </div>
                      )}
                    </div>

                    {poll.totalResponses > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Recent Responses:
                        </h4>
                        <div className="space-y-1">
                          {poll.submissions.slice(0, 3).map(submission => (
                            <div key={submission.name} className="text-xs flex justify-between">
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{submission.name}</span>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {Object.keys(submission.availability || {}).length} days
                              </span>
                            </div>
                          ))}
                          {poll.totalResponses > 3 && (
                            <div className="text-xs text-blue-600">
                              +{poll.totalResponses - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  setCurrentPollId(null); // Clear previous poll context
                  setCurrentRoute('create-poll');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                + Create New Poll
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Main Page (Login or Dashboard)
  if (currentRoute === 'admin-main') {
    if (!isAdmin) {
      // Non-admin: Show only login
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative`}>
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
              className={`px-3 py-1 border rounded text-sm shadow ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
            >
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
          </div>

          <div className={`rounded-xl shadow-lg p-8 max-w-md w-full text-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-8">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Film 05 Vote Admin
              </h1>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>

            <div className="text-4xl mb-6">🔐</div>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Admin access required to manage Film 05 voting system
            </p>
            
            <input
              type="password"
              placeholder="Admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Admin Login
            </button>
          </div>
        </div>
      );
    } else {
      // Admin: Show dashboard
      return (
        <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative`}>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
              className={`px-3 py-1 border rounded text-sm shadow ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
            >
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="max-w-4xl mx-auto pt-16">
            <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Film 05 Vote Dashboard
                  </h1>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Manage availability voting system
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    👨‍💼 Admin Mode
                  </span>
                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setCurrentUser(null);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                {/* Commented out left box - Create New Vote */}
                {/*
                <div className={`p-6 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Create New Vote
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Set up a new availability voting session for Film 05 events
                  </p>
                  <button
                    onClick={() => {
                      setCurrentPollId(null); // Clear previous poll context
                      setCurrentRoute('create-poll');
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full"
                  >
                    Create Vote
                  </button>
                </div>
                */}

                {/* Center box - All Polls (Only visible one) */}
                <div className={`p-6 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} max-w-md`}>
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    All Polls
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    View and manage all created polls and voting sessions
                  </p>
                  <button
                    onClick={() => setCurrentRoute('poll-list')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold w-full"
                  >
                    View All Polls
                  </button>
                </div>

                {/* Commented out right box - View Results */}
                {/*
                <div className={`p-6 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    View Results
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Review all submitted availability responses and preferences
                  </p>
                  <button
                    onClick={() => {
                      setCurrentRoute('availability');
                      setCurrentPage('view');
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold w-full"
                  >
                    View Results
                  </button>
                </div>
                */}
              </div>

              <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {Object.keys(savedData).length}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Total Responses
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {new Set(Object.values(savedData).map(d => `${d.month}-${d.year}`)).size}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Active Months
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {Object.values(savedData).filter(d => d.restaurant).length}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Restaurant Prefs
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {Math.round(Object.values(savedData).reduce((sum, d) => sum + Object.keys(d.availability || {}).length, 0) / Math.max(Object.keys(savedData).length, 1))}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Avg Days/Person
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Availability Voting Interface (moved from main)
  if (currentRoute === 'availability' && currentPage === 'view') {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const THENames = Object.keys(savedData);
    
    // Filter submissions based on current poll context
    const relevantTHEs = THENames.filter(name => {
      const data = savedData[name];
      if (!data || data.month !== viewMonth || data.year !== viewYear) {
        return false;
      }
      
      // If we're viewing a specific poll, only show submissions for that poll
      if (currentPollId) {
        return data.pollId === currentPollId;
      }
      
      // If no specific poll context, show submissions without pollId (legacy)
      return !data.pollId;
    });

    return (
      <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative`}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            className={`px-3 py-1 border rounded text-sm shadow ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('allTHEs')}
              </h1>
              <div className="flex gap-3 items-center">
                {!isAdmin && (
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Admin
                  </button>
                )}
                {isAdmin && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    👨‍💼 Admin Mode
                  </span>
                )}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={() => setCurrentRoute('admin-main')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ← Dashboard
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value))}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{getMonthName(index)}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value))}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <h2 className={`text-xl font-semibold text-center mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('monthYear', { month: getMonthName(viewMonth), year: viewYear })}
            </h2>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading submissions...</p>
              </div>
            ) : (
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={`border p-2 text-left font-semibold min-w-32 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                      {t('THEName')}
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <th key={i + 1} className={`border p-1 text-center text-sm w-6 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        {i + 1}
                      </th>
                    ))}
                    {isAdmin && (
                      <th className={`border p-2 text-center font-semibold w-20 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {relevantTHEs.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth + 1} className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('noDataYet', { month: getMonthName(viewMonth), year: viewYear })}
                      </td>
                    </tr>
                  ) : (
                    relevantTHEs.map(THEName => {
                      const THEData = savedData[THEName];
                      return (
                        <tr key={THEName}>
                          <td className={`border p-2 font-medium ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                            {THEName}
                          </td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const key = `${viewYear}-${viewMonth + 1}-${day}`;
                            const status = THEData.availability[key];
                            const colorClass = getStatusColor(status);
                            const statusText = getStatusText(status);
                            
                            return (
                              <td
                                key={day}
                                className={`border p-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                                title={`${THEName}: ${statusText} on ${getMonthName(viewMonth)} ${day}`}
                              >
                                <div className={`w-6 h-6 ${colorClass} cursor-help`}></div>
                              </td>
                            );
                          })}
                          {isAdmin && (
                            <td className={`border p-2 text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                              <button
                                onClick={() => deleteSubmission(THEName)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                title={`Delete ${THEName}'s submission`}
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-green-500' : 'bg-green-400'}`}></div>
                <span>{t('legendAvailable')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'}`}></div>
                <span>{t('legendMaybe')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-red-500' : 'bg-red-400'}`}></div>
                <span>{t('legendNot')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}></div>
                <span>{t('legendNone')}</span>
              </div>
            </div>

            {relevantTHEs.length > 0 && (
              <div className={`mt-8 rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('restPrefList')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {relevantTHEs.map(THEName => {
                    const restaurant = savedData[THEName].restaurant;
                    return (
                      <div key={THEName} className="text-sm">
                        <span className="font-medium">{THEName}:</span> {restaurant || t('noPref')}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 max-w-sm w-full mx-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <h3 className="text-lg font-bold mb-4">Admin Login</h3>
              <input
                type="password"
                placeholder="Admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  className={`flex-1 py-2 rounded transition-colors ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  if (currentRoute === 'availability' && isSubmitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative`}>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            className={`px-3 py-1 border rounded text-sm shadow ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>

        <div className={`rounded-xl shadow-lg p-8 max-w-md w-full text-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {t('thankYou', { name: THEName })}
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('savedMsg')}
          </p>
          <button
            onClick={() => {
              // Redirect to results view for the current poll
              setViewMonth(selectedMonth);
              setViewYear(selectedYear);
              setCurrentRoute('availability');
              setCurrentPage('view');
              setIsSubmitted(false);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {lang === 'th' ? 'ดูผลการลงคะแนน' : 'View Results'}
          </button>
        </div>
      </div>
    );
  }

  // Availability voting interface (when currentRoute === 'availability' and not view or submitted)
  if (currentRoute === 'availability') {
    return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative`}>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
          className={`px-3 py-1 border rounded text-sm shadow ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
        >
          {lang === 'th' ? 'EN' : 'TH'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        
        {currentStep === 1 && (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className={`rounded-xl shadow-lg p-8 max-w-md w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-8">
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {currentPollId && pollsData[currentPollId] ? pollsData[currentPollId].title : t('siteTitle')}
                </h1>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
              </div>
              
              <div className="mb-6">
                <button
                  onClick={() => setCurrentPage('view')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  {t('seeAllBtn')}
                </button>
              </div>
              
              <div className="mb-6">
                <button
                  onClick={() => setCurrentRoute('admin-main')}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  ← Back to Dashboard
                </button>
              </div>
              
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('yourName')}
                </label>
                <input
                  type="text"
                  value={THEName}
                  onChange={(e) => setTHEName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white'}`}
                  placeholder={t('enterName')}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
                <button
                  onClick={handleNameSubmit}
                  disabled={!THEName.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {t('nextBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('markYour')}
              </h2>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{getMonthName(index)}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <h2 className={`text-xl font-semibold text-center mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('monthYear', { month: getMonthName(selectedMonth), year: selectedYear })}
            </h2>

            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-green-500' : 'bg-green-400'}`}></div>
                  <span>{t('available')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'}`}></div>
                  <span>{t('maybe')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-red-500' : 'bg-red-400'}`}></div>
                  <span>{t('notAvail')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border-2 ${isDarkMode ? 'bg-gray-600 border-gray-400' : 'bg-gray-200 border-gray-400'} flex items-center justify-center text-xs`}>✕</div>
                  <span>{lang === 'th' ? 'ลบการเลือก' : 'Clear selection'}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-300">
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <span>📱</span>
                    <span>{lang === 'th' ? 'บนมือถือ: กดค้างและลากเพื่อเลือกหลายวัน' : 'Mobile: Hold & drag to select multiple days'}</span>
                  </div>
                </div>
              </div>
            </div>

            {renderCalendar()}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className={`px-6 py-2 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {t('backBtn')}
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!hasAvailabilitySelected}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {t('confirmBtn')}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('restPref')}
              </h2>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
            
            <div className="space-y-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('restPref')}
              </label>
              <input
                type="text"
                value={preferredRestaurant}
                onChange={(e) => setPreferredRestaurant(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white'}`}
                placeholder={t('restPlaceholder')}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className={`px-6 py-2 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {t('backBtn')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isSaving ? 'Saving...' : t('submitBtn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  }

  // Default fallback - shouldn't reach here
  return null;
};

export default THEAvailabilityVote;