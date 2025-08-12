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
  const [currentRoute, setCurrentRoute] = useState('home'); // 'home', 'admin-main', 'poll-list', 'create-poll', 'availability', 'time-availability', 'time-poll-list', 'create-time-poll'
  const [navigationHistory, setNavigationHistory] = useState(['home']); // Track navigation history for proper back navigation
  const [currentPage, setCurrentPage] = useState('main');
  const [currentStep, setCurrentStep] = useState(1);
  const [lang, setLang] = useState('th');
  const t = useT(lang);
  const [THEName, setTHEName] = useState('');
  
  // Crash Recovery System
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  
  // Helper function to update URL
  const updateURL = (page, params = {}) => {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    
    // Remove old params
    url.searchParams.delete('poll');
    
    // Add new params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    window.history.pushState({}, '', url);
  };

  // Helper function to navigate with history tracking
  const navigateToRoute = (newRoute, urlPage = null, params = {}) => {
    setNavigationHistory(prev => [...prev, currentRoute]);
    setCurrentRoute(newRoute);
    if (urlPage) {
      updateURL(urlPage, params);
    }
  };

  // Helper function to go back to previous route
  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const previousRoute = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentRoute(previousRoute);
      
      // Update URL based on the route we're going back to
      switch(previousRoute) {
        case 'home':
          updateURL('home');
          break;
        case 'admin-main':
          updateURL('admin');
          break;
        case 'availability':
          updateURL('availability');
          break;
        case 'time-availability':
          updateURL('time-availability');
          break;
        default:
          updateURL('home');
          break;
      }
    } else {
      // Fallback to home if no history
      setCurrentRoute('home');
      updateURL('home');
    }
  };

  // Crash Recovery Functions
  const saveToRecovery = (data, type) => {
    try {
      const recoveryKey = `film05_recovery_${type}`;
      const recoveryData = {
        data,
        timestamp: new Date().toISOString(),
        type,
        route: currentRoute,
        step: currentStep,
        navigationHistory, // Include navigation history
        currentPage,
        currentTimePage // Include time page state
      };
      localStorage.setItem(recoveryKey, JSON.stringify(recoveryData));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving recovery data:', error);
    }
  };

  const checkForRecovery = () => {
    try {
      const availabilityRecovery = localStorage.getItem('film05_recovery_availability');
      const timeRecovery = localStorage.getItem('film05_recovery_time');
      const timePollCreationRecovery = localStorage.getItem('film05_recovery_time-poll-creation');
      
      if (availabilityRecovery) {
        const data = JSON.parse(availabilityRecovery);
        const timeDiff = new Date() - new Date(data.timestamp);
        // Show recovery if data is less than 24 hours old
        if (timeDiff < 24 * 60 * 60 * 1000) {
          setRecoveryData(data);
          setShowRecoveryModal(true);
          return;
        }
      }
      
      if (timeRecovery) {
        const data = JSON.parse(timeRecovery);
        const timeDiff = new Date() - new Date(data.timestamp);
        if (timeDiff < 24 * 60 * 60 * 1000) {
          setRecoveryData(data);
          setShowRecoveryModal(true);
          return;
        }
      }

      if (timePollCreationRecovery) {
        const data = JSON.parse(timePollCreationRecovery);
        const timeDiff = new Date() - new Date(data.timestamp);
        if (timeDiff < 24 * 60 * 60 * 1000) {
          setRecoveryData(data);
          setShowRecoveryModal(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking recovery data:', error);
    }
  };

  const recoverData = () => {
    if (!recoveryData) return;
    
    try {
      if (recoveryData.type === 'availability') {
        setTHEName(recoveryData.data.name || '');
        setAvailability(recoveryData.data.availability || {});
        setSelectedMonth(recoveryData.data.month || 7);
        setSelectedYear(recoveryData.data.year || 2025);
        setPreferredRestaurant(recoveryData.data.restaurant || '');
        setCurrentRoute('availability');
        setCurrentStep(recoveryData.step || 1);
        setCurrentPage(recoveryData.currentPage || 'main');
      } else if (recoveryData.type === 'time') {
        setTimeUserName(recoveryData.data.name || '');
        setTimeAvailability(recoveryData.data.timeAvailability || {});
        setSelectedTimeDate(new Date(recoveryData.data.selectedDate || new Date()));
        setCurrentRoute('time-availability');
        setCurrentTimePage(recoveryData.currentTimePage || 'main');
      } else if (recoveryData.type === 'time-poll-creation') {
        setNewTimePollTitle(recoveryData.data.timePollTitle || '');
        setSelectedTimeDate(new Date(recoveryData.data.selectedTimeDate || new Date()));
        setCurrentTimePollId(recoveryData.data.currentTimePollId || null);
        setCurrentRoute('create-time-poll');
      }
      
      // Restore navigation history if available
      if (recoveryData.navigationHistory && Array.isArray(recoveryData.navigationHistory)) {
        setNavigationHistory(recoveryData.navigationHistory);
      }
      
      // Clear recovery data
      localStorage.removeItem(`film05_recovery_${recoveryData.type}`);
      setShowRecoveryModal(false);
      setRecoveryData(null);
      
      alert(lang === 'th' ? 'ข้อมูลถูกกู้คืนแล้ว!' : 'Data recovered successfully!');
    } catch (error) {
      console.error('Error recovering data:', error);
    }
  };

  const clearRecovery = () => {
    if (recoveryData) {
      localStorage.removeItem(`film05_recovery_${recoveryData.type}`);
    }
    setShowRecoveryModal(false);
    setRecoveryData(null);
  };
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
  
  // Time poll states
  const [timePolls, setTimePolls] = useState({});
  const [newTimePollTitle, setNewTimePollTitle] = useState('');
  const [currentTimePollId, setCurrentTimePollId] = useState(null);
  
  // Time availability states
  const [timeAvailability, setTimeAvailability] = useState({});
  const [selectedTimeDate, setSelectedTimeDate] = useState(new Date());
  const [timeSubmissions, setTimeSubmissions] = useState({});
  const [timeUserName, setTimeUserName] = useState('');
  const [currentTimePage, setCurrentTimePage] = useState('main');
  const [firstClickMode, setFirstClickMode] = useState('available'); // 'available', 'maybe', 'not-available', 'none'

  useEffect(() => {
    if (THEName && savedData[THEName]) {
      const data = savedData[THEName];
      setSelectedMonth(data.month);
      setSelectedYear(data.year);
      setAvailability(data.availability);
      setPreferredRestaurant(data.restaurant);
    }
  }, [THEName, savedData]);

  // Load existing time availability when user name changes
  useEffect(() => {
    if (timeUserName && timeSubmissions[timeUserName]) {
      const userData = timeSubmissions[timeUserName];
      const existingAvailability = userData.timeAvailability || {};
      setTimeAvailability(existingAvailability);
    } else {
      setTimeAvailability({});
    }
  }, [timeUserName, timeSubmissions]);

  // Check for crash recovery on mount
  useEffect(() => {
    checkForRecovery();
  }, []);

  // Auto-save availability data
  useEffect(() => {
    if (THEName && Object.keys(availability).length > 0) {
      const saveData = {
        name: THEName,
        availability,
        month: selectedMonth,
        year: selectedYear,
        restaurant: preferredRestaurant
      };
      saveToRecovery(saveData, 'availability');
      setHasUnsavedChanges(true);
    }
  }, [THEName, availability, selectedMonth, selectedYear, preferredRestaurant]);

  // Auto-save time availability data
  useEffect(() => {
    if (timeUserName && Object.keys(timeAvailability).length > 0) {
      const saveData = {
        name: timeUserName,
        timeAvailability,
        selectedDate: selectedTimeDate.toISOString()
      };
      saveToRecovery(saveData, 'time');
      setHasUnsavedChanges(true);
    }
  }, [timeUserName, timeAvailability, selectedTimeDate]);

  // Auto-save time poll creation data
  useEffect(() => {
    if (newTimePollTitle.trim()) {
      const saveData = {
        timePollTitle: newTimePollTitle,
        selectedTimeDate: selectedTimeDate.toISOString(),
        currentTimePollId
      };
      saveToRecovery(saveData, 'time-poll-creation');
      setHasUnsavedChanges(true);
    }
  }, [newTimePollTitle, selectedTimeDate, currentTimePollId]);

  // Load time polls from localStorage on mount
  useEffect(() => {
    const storedTimePolls = localStorage.getItem('film05_time_polls');
    if (storedTimePolls) {
      try {
        setTimePolls(JSON.parse(storedTimePolls));
      } catch (error) {
        console.error('Error loading time polls:', error);
      }
    }
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        const message = lang === 'th' ? 'คุณมีข้อมูลที่ยังไม่ได้บันทึก' : 'You have unsaved changes';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, lang]);

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

  // Check URL for routing on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const pollIdFromUrl = urlParams.get('poll');
    
    // Route based on page parameter
    if (page) {
      switch(page) {
        case 'home':
          setCurrentRoute('home');
          break;
        case 'admin':
          setCurrentRoute('admin-main');
          break;
        case 'polls':
          setCurrentRoute('poll-list');
          break;
        case 'create-poll':
          setCurrentRoute('create-poll');
          break;
        case 'time-polls':
          setCurrentRoute('time-poll-list');
          break;
        case 'create-time-poll':
          setCurrentRoute('create-time-poll');
          break;
        case 'time-availability':
          // If no poll ID is provided, redirect to time poll creation
          if (!pollIdFromUrl) {
            setCurrentRoute('create-time-poll');
            updateURL('create-time-poll');
            break;
          }
          setCurrentRoute('time-availability');
          setCurrentTimePage('main');
          // Load time poll from URL if poll ID is provided
          if (pollIdFromUrl) {
            setCurrentTimePollId(pollIdFromUrl);
            // Try to load time poll data from multiple sources
            let timePoll = null;
            
            // First try from timePolls state
            if (timePolls[pollIdFromUrl]) {
              timePoll = timePolls[pollIdFromUrl];
            }
            // Then try localStorage
            else {
              const timePollData = localStorage.getItem(pollIdFromUrl);
              if (timePollData) {
                try {
                  timePoll = JSON.parse(timePollData);
                } catch (error) {
                  console.error('Error parsing time poll from localStorage:', error);
                }
              }
            }
            
            // Sync the target date if we found the poll
            if (timePoll && timePoll.targetDate) {
              setSelectedTimeDate(new Date(timePoll.targetDate));
              console.log('🔄 Synced time poll date for voting:', timePoll.targetDate);
            }
          }
          break;
        case 'time-results':
          setCurrentRoute('time-availability');
          setCurrentTimePage('view');
          // Load time poll from URL if poll ID is provided
          if (pollIdFromUrl) {
            setCurrentTimePollId(pollIdFromUrl);
            // Try to load time poll data from multiple sources
            let timePoll = null;
            
            // First try from timePolls state
            if (timePolls[pollIdFromUrl]) {
              timePoll = timePolls[pollIdFromUrl];
            }
            // Then try localStorage
            else {
              const timePollData = localStorage.getItem(pollIdFromUrl);
              if (timePollData) {
                try {
                  timePoll = JSON.parse(timePollData);
                } catch (error) {
                  console.error('Error parsing time poll from localStorage:', error);
                }
              }
            }
            
            // Sync the target date if we found the poll
            if (timePoll && timePoll.targetDate) {
              setSelectedTimeDate(new Date(timePoll.targetDate));
              console.log('🔄 Synced time poll date for results:', timePoll.targetDate);
            }
          }
          break;
        case 'availability':
          setCurrentRoute('availability');
          setCurrentPage('main');
          break;
        case 'results':
          setCurrentRoute('availability');
          setCurrentPage('view');
          break;
        default:
          setCurrentRoute('home');
      }
    } else if (pollIdFromUrl) {
      // Legacy support for direct poll links
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
      
      // Load time availability data from Firebase
      const timeResult = await film05Service.loadTimeAvailability();
      if (timeResult.success) {
        setTimeSubmissions(timeResult.data);
      } else {
        console.error('Failed to load time availability:', timeResult.error);
      }
      
      setIsLoading(false);
    };

    loadData();

    // Set up real-time listener for submissions
    const unsubscribeSubmissions = film05Service.subscribeToSubmissions((submissions) => {
      setSavedData(submissions);
    });

    // Set up real-time listener for time availability
    const unsubscribeTimeAvailability = film05Service.subscribeToTimeAvailability((timeData) => {
      setTimeSubmissions(timeData);
    });

    return () => {
      unsubscribeSubmissions();
      unsubscribeTimeAvailability();
    };
  }, []);

  // Sync selectedTimeDate when timePolls or currentTimePollId changes
  useEffect(() => {
    if (currentTimePollId && timePolls[currentTimePollId]) {
      const timePoll = timePolls[currentTimePollId];
      if (timePoll.targetDate) {
        const targetDate = new Date(timePoll.targetDate);
        setSelectedTimeDate(targetDate);
        console.log('🔄 Auto-synced time poll date from state:', timePoll.targetDate);
      }
    }
  }, [currentTimePollId, timePolls]);

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

  // Public Homepage
  if (currentRoute === 'home') {
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
          <div className={`rounded-xl shadow-lg p-8 text-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="mb-8">
              <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {lang === 'th' ? 'เลี้ยงเอกฟิล์ม ศปก 05 ปี 2025' : 'Film 05 Graduation Event 2025'}
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {lang === 'th' ? 'ระบบโหวตความสะดวกสำหรับงานเลี้ยงเอกฟิล์ม ศปก 05' : 'Availability voting system for Film 05 graduation event'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Vote on Date Availability */}
              <div className={`p-6 rounded-lg border-2 border-dashed hover:border-solid transition-all ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                <div className="text-4xl mb-4">📅</div>
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {lang === 'th' ? 'โหวตวันที่ว่าง' : 'Vote Date Availability'}
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {lang === 'th' ? 'เลือกวันที่ที่คุณสะดวกเข้าร่วมงาน' : 'Select dates when you are available to attend'}
                </p>
                <button
                  onClick={() => {
                    navigateToRoute('availability', 'availability');
                    setCurrentPage('main');
                    setCurrentStep(1);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full"
                >
                  {lang === 'th' ? 'เริ่มโหวต' : 'Start Voting'}
                </button>
              </div>

              {/* Vote on Time Availability */}
              <div className={`p-6 rounded-lg border-2 border-dashed hover:border-solid transition-all ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                <div className="text-4xl mb-4">🕐</div>
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {lang === 'th' ? 'โหวตเวลาที่สะดวก' : 'Vote Time Availability'}
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {lang === 'th' ? 'เลือกช่วงเวลาที่คุณสะดวกในแต่ละวัน' : 'Select available hours throughout the day'}
                </p>
                <button
                  onClick={() => {
                    navigateToRoute('create-time-poll', 'create-time-poll');
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold w-full"
                >
                  {lang === 'th' ? 'เลือกเวลา' : 'Select Times'}
                </button>
              </div>
            </div>

            {/* Admin access */}
            <div className="pt-6 border-t border-gray-300">
              <button
                onClick={() => {
                  navigateToRoute('admin-main', 'admin');
                }}
                className={`text-sm px-4 py-2 rounded transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                {lang === 'th' ? '🔐 เข้าสู่ระบบผู้ดูแล' : '🔐 Admin Access'}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          {(Object.keys(savedData).length > 0 || Object.keys(timeSubmissions).length > 0) && (
            <div className={`rounded-xl shadow-lg p-6 mt-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {lang === 'th' ? 'สถิติการโหวต' : 'Voting Statistics'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {Object.keys(savedData).length}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lang === 'th' ? 'โหวตวันที่' : 'Date Votes'}
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {Object.keys(timeSubmissions).length}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lang === 'th' ? 'โหวตเวลา' : 'Time Votes'}
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {Object.values(savedData || {}).filter(d => d && d.restaurant).length}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lang === 'th' ? 'แนะนำร้าน' : 'Restaurant Suggestions'}
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {new Set([...Object.keys(savedData), ...Object.keys(timeSubmissions)]).size}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lang === 'th' ? 'ผู้เข้าร่วม' : 'Participants'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                onClick={() => {
                  setCurrentRoute('admin-main');
                  updateURL('admin');
                }}
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
    Object.values(pollsData || {}).forEach(poll => {
      const submissionsForPoll = Object.values(savedData || {}).filter(submission => 
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
    Object.values(savedData || {}).forEach(submission => {
      const key = `${submission.month}-${submission.year}`;
      const hasExistingPoll = Object.values(pollsData || {}).some(poll => 
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
    Object.values(submissionGroups || {}).forEach(group => {
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
                onClick={() => {
                  setCurrentRoute('admin-main');
                  updateURL('admin');
                }}
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
                          {(poll.submissions || []).filter(s => s && s.restaurant).length}
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
                            updateURL('results', { poll: poll.id });
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
                            updateURL('availability', { poll: poll.id });
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
                  updateURL('create-poll');
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


  // Time Poll List Page
  if (currentRoute === 'time-poll-list') {

    // Convert timePolls object to array and sort by date
    const timePollsList = Object.values(timePolls || {}).map(poll => {
      // Count responses for this poll
      const responses = Object.entries(timeSubmissions || {}).filter(([userName, userData]) => {
        if (userData && userData.pollId === poll.id) {
          return true;
        }
        return false;
      });
      
      return {
        ...poll,
        responses,
        totalResponses: responses.length
      };
    });

    // Sort by creation date (newest first)
    const sortedTimePolls = timePollsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
                  {lang === 'th' ? 'การจัดการเวลา' : 'Time Availability Management'}
                </h1>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {lang === 'th' ? 'จัดการการโหวตเวลาทั้งหมด' : 'Manage all time availability voting sessions'}
                </p>
              </div>
              <button
                onClick={navigateBack}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← {lang === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">{lang === 'th' ? 'กำลังโหลด...' : 'Loading time polls...'}</p>
              </div>
            ) : sortedTimePolls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🕐</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {lang === 'th' ? 'ยังไม่มีการโหวตเวลา' : 'No Time Voting Sessions Yet'}
                </h3>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {lang === 'th' ? 'เริ่มต้นการโหวตเวลาครั้งแรกของคุณ' : 'Start your first time voting session'}
                </p>
                <button
                  onClick={() => {
                    navigateToRoute('time-availability', 'time-availability');
                    setCurrentTimePage('main');
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  {lang === 'th' ? 'เริ่มโหวตเวลา' : 'Start Time Voting'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTimePolls.map(timePoll => (
                  <div key={timePoll.id} className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {timePoll.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(timePoll.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${timePoll.totalResponses > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {timePoll.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className={`space-y-2 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="text-sm">
                        <strong>{lang === 'th' ? 'ผู้ตอบกลับ:' : 'Responses:'}</strong> {timePoll.totalResponses}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentTimePollId(timePoll.id);
                          setSelectedTimeDate(new Date(timePoll.targetDate));
                          setCurrentRoute('time-availability');
                          setCurrentTimePage('view');
                          updateURL('time-results', { poll: timePoll.id });
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        {lang === 'th' ? 'ดูผล' : 'View Results'}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTimePollId(timePoll.id);
                          setSelectedTimeDate(new Date(timePoll.targetDate));
                          navigateToRoute('time-availability', 'time-availability', { poll: timePoll.id });
                          setCurrentTimePage('main');
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        {lang === 'th' ? 'เพิ่มการตอบกลับ' : 'Add Response'}
                      </button>
                    </div>
                    
                    {/* Copy Link Button */}
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/?page=time-availability&poll=${timePoll.id}`;
                          navigator.clipboard.writeText(shareUrl);
                          alert(lang === 'th' ? 'คัดลอกลิงก์แล้ว!' : 'Link copied to clipboard!');
                        }}
                        className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        📋 {lang === 'th' ? 'คัดลอกลิงก์โหวต' : 'Copy Voting Link'}
                      </button>
                    </div>

                    {/* Recent Responses */}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {lang === 'th' ? 'การตอบกลับล่าสุด:' : 'Recent Responses:'}
                      </h4>
                      <div className="space-y-1">
                        {timePoll.responses.slice(0, 3).map(([userName, userData], index) => (
                          <div key={index} className={`text-xs flex justify-between ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span>{userName}</span>
                            <span>{Object.values(userData.timeAvailability || {}).filter(status => status > 0).length} slots</span>
                          </div>
                        ))}
                        {timePoll.responses.length > 3 && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            +{timePoll.responses.length - 3} {lang === 'th' ? 'เพิ่มเติม...' : 'more...'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  navigateToRoute('create-time-poll', 'create-time-poll');
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                + {lang === 'th' ? 'สร้างโพลเวลาใหม่' : 'Create New Time Poll'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Time Poll Page  
  if (currentRoute === 'create-time-poll') {
    const handleCreateTimePoll = async () => {
      if (!newTimePollTitle.trim()) {
        alert(lang === 'th' ? 'กรุณาใส่ชื่อโพลเวลา' : 'Please enter a time poll title');
        return;
      }
      
      setIsSaving(true);
      
      try {
        // For time polls, we'll use a simpler approach - just set up the context and go to time voting
        const timestamp = Date.now();
        const timePollKey = `time_poll_${timestamp}`;
        const timePollData = {
          title: newTimePollTitle.trim(),
          targetDate: selectedTimeDate.toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'admin',
          id: timePollKey
        };
        
        // Store in timePolls state and localStorage
        setTimePolls(prev => ({
          ...prev,
          [timePollKey]: timePollData
        }));
        
        // Save to localStorage for URL sharing
        localStorage.setItem(timePollKey, JSON.stringify(timePollData));
        localStorage.setItem('film05_time_polls', JSON.stringify({
          ...timePolls,
          [timePollKey]: timePollData
        }));
        
        // Set current context and navigate to time voting interface
        setCurrentTimePollId(timePollKey);
        setCurrentRoute('time-availability');
        setCurrentTimePage('main');
        
        // Update URL with poll ID
        updateURL('time-availability', { poll: timePollKey });
        
        // Reset form
        setNewTimePollTitle('');
        setSelectedTimeDate(new Date());
        
      } catch (error) {
        alert('Failed to create time poll: ' + error.message);
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
                  {lang === 'th' ? 'สร้างโพลเวลาใหม่' : 'Create New Time Poll'}
                </h1>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {lang === 'th' ? 'ตั้งค่าการโหวตเวลาใหม่' : 'Set up a new time availability voting session'}
                </p>
              </div>
              <button
                onClick={navigateBack}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← {lang === 'th' ? 'กลับ' : 'Back'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {lang === 'th' ? 'ชื่อโพลเวลา *' : 'Time Poll Title *'}
                </label>
                <input
                  type="text"
                  value={newTimePollTitle}
                  onChange={(e) => setNewTimePollTitle(e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น "เวลาเลี้ยงเอกฟิล์ม วันที่ 15 ส.ค. 2025"' : 'e.g. "Film 05 Dinner Time - Aug 15, 2025"'}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {lang === 'th' ? 'วันที่สำหรับโหวตเวลา *' : 'Target Date for Time Voting *'}
                </label>
                <input
                  type="date"
                  value={selectedTimeDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedTimeDate(new Date(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                />
              </div>

              {/* Preview */}
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {lang === 'th' ? 'ตัวอย่าง' : 'Preview'}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>{lang === 'th' ? 'ชื่อ:' : 'Title:'}</strong> {newTimePollTitle || (lang === 'th' ? 'โพลเวลาใหม่' : 'New Time Poll')}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>{lang === 'th' ? 'วันที่:' : 'Date:'}</strong> {selectedTimeDate.toLocaleDateString()}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>URL:</strong> /time-availability
                </p>
              </div>

              {/* How it works */}
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-blue-600 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                <h3 className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  📋 {lang === 'th' ? 'วิธีการทำงาน:' : 'How it works:'}
                </h3>
                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  <li>• {lang === 'th' ? `โพลจะถูกสร้างสำหรับวันที่ ${selectedTimeDate.toLocaleDateString()}` : `Time poll will be created for ${selectedTimeDate.toLocaleDateString()}`}</li>
                  <li>• {lang === 'th' ? 'ผู้ใช้สามารถโหวตช่วงเวลาที่สะดวกในวันนั้น' : 'Users can vote on their available hours for that day'}</li>
                  <li>• {lang === 'th' ? 'ผลจะแสดงในแดชบอร์ดแอดมิน' : 'Results will be visible in the admin dashboard'}</li>
                  <li>• {lang === 'th' ? 'คุณสามารถแชร์ลิงก์โหวตกับผู้เข้าร่วม' : 'You can share the voting link with participants'}</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => navigateBack()}
                className={`px-6 py-3 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                onClick={handleCreateTimePoll}
                disabled={!newTimePollTitle.trim() || isSaving}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isSaving ? (lang === 'th' ? 'กำลังสร้างโพล...' : 'Creating Poll...') : (lang === 'th' ? 'สร้างโพลและเริ่มโหวต' : 'Create Poll & Start Voting')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Time Availability Page - View Mode (Results)
  if (currentRoute === 'time-availability' && currentTimePage === 'view') {
    // Filter timeSubmissions for current poll only
    const filteredTimeSubmissions = currentTimePollId 
      ? Object.fromEntries(
          Object.entries(timeSubmissions || {}).filter(([userName, userData]) => {
            // Check if this user's data is for the current poll
            return userData && userData.pollId === currentTimePollId;
          })
        )
      : (timeSubmissions || {});
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

        <div className="max-w-7xl mx-auto pt-16">
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {lang === 'th' ? 'ตารางเวลาว่างของทุกคน' : 'Everyone\'s Time Availability'}
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
                  onClick={() => {
                    setCurrentTimePage('main');
                    updateURL('time-availability');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ← {lang === 'th' ? 'กลับไปโหวต' : 'Back to Voting'}
                </button>
                <button
                  onClick={() => {
                    setCurrentRoute('home');
                    updateURL('home');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🏠 {lang === 'th' ? 'หน้าแรก' : 'Home'}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">{lang === 'th' ? 'กำลังโหลด...' : 'Loading time availability...'}</p>
              </div>
            ) : Object.keys(filteredTimeSubmissions).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🕐</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {lang === 'th' ? 'ยังไม่มีการโหวตเวลา' : 'No Time Votes Yet'}
                </h3>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {lang === 'th' ? 'ยังไม่มีใครโหวตเวลาที่สะดวก' : 'No one has voted on time availability yet'}
                </p>
                
                {/* Debug Info */}
                <div className={`mb-4 p-3 rounded text-xs ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                  <strong>Debug Info:</strong><br/>
                  filteredTimeSubmissions keys: {Object.keys(filteredTimeSubmissions).length}<br/>
                  currentTimePollId: {currentTimePollId}<br/>
                  filteredTimeSubmissions: {JSON.stringify(filteredTimeSubmissions, null, 2)}
                </div>
                
                <button
                  onClick={async () => {
                    console.log('🔍 Debug: Reloading time submissions...');
                    const result = await film05Service.loadTimeAvailability();
                    console.log('🔍 Debug: LoadTimeAvailability result:', result);
                    if (result.success) {
                      setTimeSubmissions(result.data);
                      console.log('🔍 Debug: Updated timeSubmissions:', result.data);
                    }
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm mr-4"
                >
                  🔍 Debug: Reload Data
                </button>
                
                <button
                  onClick={() => {
                    setCurrentTimePage('main');
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  {lang === 'th' ? 'เริ่มโหวตเวลา' : 'Start Time Voting'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {Object.keys(filteredTimeSubmissions).length}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {lang === 'th' ? 'ผู้โหวต' : 'Voters'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {Object.values(filteredTimeSubmissions).reduce((total, user) => 
                        total + Object.keys(user.timeAvailability || {}).length, 0
                      )}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {lang === 'th' ? 'วันที่มีข้อมูล' : 'Days with Data'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {Object.values(filteredTimeSubmissions).reduce((total, user) => {
                        return total + Object.values(user.timeAvailability || {}).reduce((dayTotal, dayHours) => 
                          dayTotal + Object.values(dayHours).filter(status => status > 0).length, 0
                        );
                      }, 0)}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {lang === 'th' ? 'ช่วงเวลารวม' : 'Total Time Slots'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {Math.round(
                        Object.values(filteredTimeSubmissions).reduce((total, user) => {
                          return total + Object.values(user.timeAvailability || {}).reduce((dayTotal, dayHours) => 
                            dayTotal + Object.values(dayHours).filter(status => status > 0).length, 0
                          );
                        }, 0) / Math.max(Object.keys(filteredTimeSubmissions).length, 1)
                      )}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {lang === 'th' ? 'เฉลี่ย/คน' : 'Avg per Person'}
                    </div>
                  </div>
                </div>

                {/* Time Availability Table */}
                <div className="space-y-4">
                  {Object.entries(filteredTimeSubmissions).map(([userName, userData]) => {
                    const timeAvailability = userData.timeAvailability || {};
                    
                    return (
                      <div key={userName} className={`rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex justify-between items-center p-4 border-b border-gray-300">
                          <h3 className="text-lg font-semibold">{userName}</h3>
                          {isAdmin && (
                            <button
                              onClick={async () => {
                                if (confirm(`Delete time availability for ${userName}?`)) {
                                  const result = await film05Service.deleteTimeAvailability(userName);
                                  if (!result.success) {
                                    alert('Failed to delete: ' + result.error);
                                  }
                                }
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                              title={`Delete ${userName}'s time availability`}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                        
                        <div className="p-4">
                          {Object.keys(timeAvailability).length === 0 ? (
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {lang === 'th' ? 'ยังไม่มีข้อมูลเวลา' : 'No time data available'}
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {Object.entries(timeAvailability || {}).map(([date, hours]) => {
                                const hasHours = Object.values(hours || {}).some(v => v);
                                if (!hasHours) return null;
                                
                                return (
                                  <div key={date} className={`p-3 rounded border ${isDarkMode ? 'border-gray-500 bg-gray-600' : 'border-gray-300 bg-white'}`}>
                                    <h4 className="font-medium mb-2 text-sm">{date}</h4>
                                    <div className="grid grid-cols-12 gap-1">
                                      {Array.from({ length: 24 }, (_, hour) => {
                                        const hourStatus = hours[hour] || 0; // 0=none, 1=available, 2=maybe, 3=not available
                                        const timeString = `${hour.toString().padStart(2, '0')}:00`;
                                        
                                        return (
                                          <div
                                            key={hour}
                                            className={`text-xs p-1 rounded text-center ${
                                              hourStatus === 1 
                                                ? 'bg-green-500 text-white' 
                                                : hourStatus === 2
                                                  ? 'bg-yellow-500 text-white'
                                                  : hourStatus === 3
                                                    ? 'bg-red-500 text-white'
                                                    : isDarkMode 
                                                      ? 'bg-gray-500 text-gray-300' 
                                                      : 'bg-gray-200 text-gray-600'
                                            }`}
                                            title={`${timeString} - ${
                                              hourStatus === 1 ? 'Available' : 
                                              hourStatus === 2 ? 'Maybe' : 
                                              hourStatus === 3 ? 'Not Available' : 
                                              'No response'
                                            }`}
                                          >
                                            {hourStatus === 1 ? '✅' : hourStatus === 2 ? '⚠️' : hourStatus === 3 ? '❌' : hour}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Time Availability Page - Main Mode (Voting)
  if (currentRoute === 'time-availability' && currentTimePage === 'main') {
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
        
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className={`rounded-xl shadow-lg p-8 max-w-md w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {lang === 'th' ? 'เลือกเวลาว่าง' : 'Time Availability'}
                </h1>
                {currentTimePollId && timePolls[currentTimePollId] && (
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    📅 {lang === 'th' ? 'วันที่โหวต:' : 'Target Date:'} {new Date(timePolls[currentTimePollId].targetDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
            
            <div className="mb-6 mt-4">
              <button
                onClick={() => setCurrentTimePage('view')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                👥 {lang === 'th' ? 'ดูตารางเวลาของทุกคน' : 'See Everyone\'s Time Availability'}
              </button>
            </div>
            
            <div className="mb-6">
              <button
                onClick={navigateBack}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                ← {lang === 'th' ? 'กลับ' : 'Back'}
              </button>
            </div>
            
            <div className="space-y-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {lang === 'th' ? 'ชื่อของคุณ *' : 'Your Name *'}
              </label>
              <input
                type="text"
                value={timeUserName}
                onChange={(e) => setTimeUserName(e.target.value)}
                placeholder={lang === 'th' ? 'กรอกชื่อของคุณ' : 'Enter your name'}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white'}`}
                onKeyPress={(e) => e.key === 'Enter' && timeUserName.trim() && setCurrentTimePage('select')}
              />
              <button
                onClick={() => setCurrentTimePage('select')}
                disabled={!timeUserName.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {lang === 'th' ? 'ถัดไป' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Time Availability Page - Time Selection Mode
  if (currentRoute === 'time-availability' && currentTimePage === 'select') {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dateKey = `${selectedTimeDate.getFullYear()}-${selectedTimeDate.getMonth() + 1}-${selectedTimeDate.getDate()}`;
    const currentDateAvailability = timeAvailability[dateKey] || {};
    
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
                  {lang === 'th' ? 'เวลาที่สะดวกในการโหวต' : 'Vote Time Availability'}
                </h1>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {lang === 'th' ? 'เลือกช่วงเวลาที่คุณสะดวกในแต่ละวัน' : 'Select your available hours for each day'}
                </p>
                {currentTimePollId && timePolls[currentTimePollId] && (
                  <p className={`text-sm mt-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    📅 {lang === 'th' ? 'วันที่โหวต:' : 'Target Date:'} {new Date(timePolls[currentTimePollId].targetDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}
                  </p>
                )}
              </div>
              <button
                onClick={navigateBack}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← {lang === 'th' ? 'กลับ' : 'Back'}
              </button>
            </div>

            {/* Name input */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {lang === 'th' ? 'ชื่อของคุณ *' : 'Your Name *'}
              </label>
              <input
                type="text"
                value={timeUserName}
                onChange={(e) => setTimeUserName(e.target.value)}
                placeholder={lang === 'th' ? 'กรอกชื่อของคุณ' : 'Enter your name'}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white'}`}
              />
            </div>

            {/* Date selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {lang === 'th' ? 'เลือกวันที่' : 'Select Date'}
              </label>
              <input
                type="date"
                value={selectedTimeDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedTimeDate(new Date(e.target.value))}
                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
              />
            </div>

            {/* Time grid */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {lang === 'th' ? 'เลือกเวลาที่สะดวก (คลิกเพื่อสลับสถานะ)' : 'Select Available Hours (click to cycle status)'}
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {firstClickMode === 'available' 
                  ? (lang === 'th' ? 'ลำดับ: เปล่า → ว่าง → อาจได้ → ไม่ว่าง → เปล่า' : 'Order: None → Available → Maybe → Not Available → None')
                  : (lang === 'th' ? 'ลำดับ: เปล่า → ไม่ว่าง → ว่าง → อาจได้ → เปล่า' : 'Order: None → Not Available → Available → Maybe → None')
                }
              </p>
              
              {/* Color Legend */}
              <div className="mb-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500 rounded border"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    ✅ {lang === 'th' ? 'ว่าง' : 'Available'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    ⚠️ {lang === 'th' ? 'อาจได้' : 'Maybe'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-500 rounded border"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    ❌ {lang === 'th' ? 'ไม่ว่าง' : 'Not Available'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-4 h-4 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {lang === 'th' ? 'ไม่ระบุ' : 'None'}
                  </span>
                </div>
              </div>
              
              {/* First Click Mode Toggle */}
              <div className="mb-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {lang === 'th' ? 'โหมดคลิกครั้งแรก:' : 'First Click Mode:'}
                </span>
                <button
                  onClick={() => {
                    setFirstClickMode(prev => {
                      if (prev === 'available') return 'maybe';
                      if (prev === 'maybe') return 'not-available';
                      if (prev === 'not-available') return 'none';
                      return 'available';
                    });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    firstClickMode === 'available' 
                      ? isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                      : firstClickMode === 'maybe'
                        ? isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                        : firstClickMode === 'not-available'
                          ? isDarkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                          : isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {firstClickMode === 'available' 
                    ? (lang === 'th' ? '✅ ว่าง (1 คลิก)' : '✅ Available (1 click)')
                    : firstClickMode === 'maybe'
                      ? (lang === 'th' ? '⚠️ อาจได้ (1 คลิก)' : '⚠️ Maybe (1 click)')
                      : firstClickMode === 'not-available'
                        ? (lang === 'th' ? '❌ ไม่ว่าง (1 คลิก)' : '❌ Not Available (1 click)')
                        : (lang === 'th' ? '⬜ ล้าง (1 คลิก)' : '⬜ Clear (1 click)')
                  }
                </button>
              </div>
              
              <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                {hours.map(hour => {
                  const hourStatus = currentDateAvailability[hour] || 0; // 0=none, 1=available, 2=maybe, 3=not available
                  const timeString = `${hour.toString().padStart(2, '0')}:00`;
                  
                  return (
                    <button
                      key={hour}
                      onClick={() => {
                        let nextStatus;
                        if (firstClickMode === 'available') {
                          // Available first: 0 -> 1 -> 2 -> 3 -> 0 (None -> Green -> Yellow -> Red -> None)
                          nextStatus = (hourStatus + 1) % 4;
                        } else if (firstClickMode === 'maybe') {
                          // Maybe first: 0 -> 2 -> 1 -> 3 -> 0 (None -> Yellow -> Green -> Red -> None)
                          if (hourStatus === 0) {
                            nextStatus = 2; // None -> Yellow
                          } else if (hourStatus === 2) {
                            nextStatus = 1; // Yellow -> Green
                          } else if (hourStatus === 1) {
                            nextStatus = 3; // Green -> Red
                          } else if (hourStatus === 3) {
                            nextStatus = 0; // Red -> None
                          }
                        } else if (firstClickMode === 'not-available') {
                          // Not-available first: 0 -> 3 -> 1 -> 2 -> 0 (None -> Red -> Green -> Yellow -> None)
                          if (hourStatus === 0) {
                            nextStatus = 3; // None -> Red
                          } else if (hourStatus === 3) {
                            nextStatus = 1; // Red -> Green
                          } else if (hourStatus === 1) {
                            nextStatus = 2; // Green -> Yellow
                          } else if (hourStatus === 2) {
                            nextStatus = 0; // Yellow -> None
                          }
                        } else if (firstClickMode === 'none') {
                          // Clear first: 0 -> 0 -> 1 -> 2 -> 3 (None -> None -> Green -> Yellow -> Red)
                          if (hourStatus === 0) {
                            nextStatus = 0; // None -> None (stays clear)
                          } else {
                            nextStatus = (hourStatus + 1) % 4; // Continue normal cycle
                          }
                        }
                        
                        setTimeAvailability(prev => ({
                          ...prev,
                          [dateKey]: {
                            ...prev[dateKey],
                            [hour]: nextStatus === 0 ? undefined : nextStatus
                          }
                        }));
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        hourStatus === 1 
                          ? 'bg-green-500 border-green-600 text-white transform scale-105' 
                          : hourStatus === 2
                            ? 'bg-yellow-500 border-yellow-600 text-white transform scale-105'
                            : hourStatus === 3
                              ? 'bg-red-500 border-red-600 text-white transform scale-105'
                              : isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-sm font-semibold">{timeString}</div>
                      <div className="text-xs mt-1">
                        {hourStatus === 1 ? '✅' : hourStatus === 2 ? '⚠️' : hourStatus === 3 ? '❌' : (hour < 12 ? 'AM' : 'PM')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick select buttons */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {lang === 'th' ? 'เลือกด่วน:' : 'Quick Select:'}
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    // Morning hours (6-12) - set as available (1)
                    const morning = {};
                    for (let h = 6; h < 12; h++) morning[h] = 1;
                    setTimeAvailability(prev => ({
                      ...prev,
                      [dateKey]: { ...prev[dateKey], ...morning }
                    }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {lang === 'th' ? '✅ เช้า (6:00-12:00)' : '✅ Morning (6:00-12:00)'}
                </button>
                <button
                  onClick={() => {
                    // Afternoon hours (12-18) - set as available (1)
                    const afternoon = {};
                    for (let h = 12; h < 18; h++) afternoon[h] = 1;
                    setTimeAvailability(prev => ({
                      ...prev,
                      [dateKey]: { ...prev[dateKey], ...afternoon }
                    }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {lang === 'th' ? '✅ บ่าย (12:00-18:00)' : '✅ Afternoon (12:00-18:00)'}
                </button>
                <button
                  onClick={() => {
                    // Evening hours (18-24) - set as available (1)
                    const evening = {};
                    for (let h = 18; h < 24; h++) evening[h] = 1;
                    setTimeAvailability(prev => ({
                      ...prev,
                      [dateKey]: { ...prev[dateKey], ...evening }
                    }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {lang === 'th' ? '✅ เย็น (18:00-24:00)' : '✅ Evening (18:00-24:00)'}
                </button>
                <button
                  onClick={() => {
                    // Clear all
                    setTimeAvailability(prev => ({
                      ...prev,
                      [dateKey]: {}
                    }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                >
                  {lang === 'th' ? 'ล้างทั้งหมด' : 'Clear All'}
                </button>
              </div>
            </div>

            {/* Selected times summary */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {lang === 'th' ? 'เวลาที่เลือก:' : 'Selected Times:'}
              </h4>
              <div className="text-sm">
                {Object.keys(currentDateAvailability).length === 0 ? (
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {lang === 'th' ? 'ยังไม่ได้เลือกเวลา' : 'No times selected'}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(currentDateAvailability)
                      .filter(hour => currentDateAvailability[hour])
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .map(hour => (
                        <span key={hour} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {hour.padStart(2, '0')}:00
                        </span>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  console.log('🔍 Debug: Save button clicked');
                  console.log('🔍 Debug: timeUserName:', `"${timeUserName}"`);
                  console.log('🔍 Debug: timeUserName.trim():', `"${timeUserName.trim()}"`);
                  
                  if (!timeUserName.trim()) {
                    alert(lang === 'th' ? 'กรุณากรอกชื่อของคุณ' : 'Please enter your name');
                    return;
                  }
                  
                  setIsSaving(true);
                  try {
                    // Prepare data for Firebase - combine all time availability for this user
                    const userData = timeSubmissions[timeUserName] || {};
                    const updatedAvailability = {
                      ...userData.timeAvailability,
                      [dateKey]: currentDateAvailability
                    };
                    
                    const timeData = {
                      name: timeUserName.trim(),
                      timeAvailability: updatedAvailability,
                      pollId: currentTimePollId,
                      selectedDate: selectedTimeDate.toISOString()
                    };
                    
                    console.log('🔍 Debug: Final timeData being sent to Firebase:', timeData);
                    
                    const result = await film05Service.saveTimeAvailability(timeData);
                    
                    if (result.success) {
                      alert(lang === 'th' ? 'บันทึกเวลาเรียบร้อยแล้ว!' : 'Time availability saved!');
                      // Clear current selection after saving
                      setTimeAvailability(prev => ({
                        ...prev,
                        [dateKey]: {}
                      }));
                    } else {
                      alert('Error saving time availability: ' + result.error);
                    }
                  } catch (error) {
                    alert('Error saving time availability: ' + error.message);
                  }
                  setIsSaving(false);
                }}
                disabled={isSaving || !timeUserName.trim() || Object.keys(currentDateAvailability).length === 0}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isSaving ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') : (lang === 'th' ? 'บันทึกเวลา' : 'Save Times')}
              </button>
            </div>
          </div>

          {/* View all submissions */}
          <div className={`rounded-xl shadow-lg p-8 mt-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {lang === 'th' ? 'เวลาที่บันทึกไว้ทั้งหมด' : 'All Saved Time Slots'}
            </h2>
            
            <div className="space-y-4">
              {(() => {
                // Debug: Log filtering information
                console.log('🔍 All Saved Time Slots Debug:');
                console.log('  currentTimePollId:', currentTimePollId);
                console.log('  timeSubmissions keys:', Object.keys(timeSubmissions || {}));
                console.log('  timeSubmissions data:', timeSubmissions);
                
                // Filter timeSubmissions for current poll only
                const filteredTimeSubmissions = currentTimePollId 
                  ? Object.fromEntries(
                      Object.entries(timeSubmissions || {}).filter(([userName, userData]) => {
                        const shouldInclude = userData && userData.pollId === currentTimePollId;
                        console.log(`  ${userName}: pollId=${userData?.pollId}, shouldInclude=${shouldInclude}`);
                        return shouldInclude;
                      })
                    )
                  : (timeSubmissions || {});
                
                console.log('  filteredTimeSubmissions keys:', Object.keys(filteredTimeSubmissions));
                
                return Object.keys(filteredTimeSubmissions).length === 0 ? (
                  <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {lang === 'th' ? 'ยังไม่มีข้อมูลเวลาที่บันทึก' : 'No saved time data yet'}
                  </p>
                ) : (
                  Object.entries(filteredTimeSubmissions).map(([userName, userData]) => {
                  const timeAvailability = userData.timeAvailability || {};
                  
                  return (
                    <div key={userName} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg">{userName}</h3>
                        {isAdmin && (
                          <button
                            onClick={async () => {
                              if (confirm(`Delete time availability for ${userName}?`)) {
                                const result = await film05Service.deleteTimeAvailability(userName);
                                if (!result.success) {
                                  alert('Failed to delete: ' + result.error);
                                }
                              }
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                            title={`Delete ${userName}'s time availability`}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {Object.keys(timeAvailability).length === 0 ? (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {lang === 'th' ? 'ยังไม่มีข้อมูลเวลา' : 'No time data'}
                          </p>
                        ) : (
                          Object.entries(timeAvailability || {}).map(([date, hours]) => {
                            const hasHours = Object.values(hours || {}).some(v => v);
                            if (!hasHours) return null;
                            
                            return (
                              <div key={date} className={`p-3 rounded border ${isDarkMode ? 'border-gray-500 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                                <h4 className="font-medium mb-2">{date}</h4>
                                <div className="flex flex-wrap gap-1">
                                  {Object.keys(hours)
                                    .filter(hour => hours[hour] > 0) // Show any status > 0
                                    .sort((a, b) => parseInt(a) - parseInt(b))
                                    .map(hour => {
                                      const status = hours[hour];
                                      return (
                                        <span 
                                          key={hour} 
                                          className={`px-2 py-1 rounded text-xs ${
                                            status === 1 ? 'bg-green-100 text-green-800' :
                                            status === 2 ? 'bg-yellow-100 text-yellow-800' :
                                            status === 3 ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          {status === 1 ? '✅' : status === 2 ? '⚠️' : status === 3 ? '❌' : ''} {hour.padStart(2, '0')}:00
                                        </span>
                                      );
                                    })
                                  }
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                  })
                );
              })()}
            </div>
            
            {/* View Results Button */}
            {(() => {
              const filteredTimeSubmissions = currentTimePollId 
                ? Object.fromEntries(
                    Object.entries(timeSubmissions || {}).filter(([userName, userData]) => {
                      return userData && userData.pollId === currentTimePollId;
                    })
                  )
                : (timeSubmissions || {});
              
              return Object.keys(filteredTimeSubmissions).length > 0;
            })() && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setCurrentTimePage('view');
                    updateURL('time-results');
                  }}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                >
                  👥 {lang === 'th' ? 'ตารางเวลาว่างของทุกคน' : 'See Everyone\'s Time Availability'}
                </button>
              </div>
            )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* All Polls box */}
                <div className={`p-6 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {lang === 'th' ? 'โพลทั้งหมด' : 'All Polls'}
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lang === 'th' ? 'ดูและจัดการโพลและการโหวตทั้งหมด' : 'View and manage all created polls and voting sessions'}
                  </p>
                  <button
                    onClick={() => {
                      navigateToRoute('poll-list', 'polls');
                    }}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold w-full"
                  >
                    {lang === 'th' ? 'ดูโพลทั้งหมด' : 'View All Polls'}
                  </button>
                </div>

                {/* Time Availability box */}
                <div className={`p-6 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="text-4xl mb-4">🕐</div>
                  <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {lang === 'th' ? 'เวลาที่สะดวก' : 'Time Availability'}
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lang === 'th' ? 'จัดการเวลาที่สะดวกในการโหวตตลอด 24 ชั่วโมง' : 'Manage voting availability throughout 24 hours'}
                  </p>
                  <button
                    onClick={() => {
                      navigateToRoute('time-poll-list', 'time-polls');
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full"
                  >
                    {lang === 'th' ? 'จัดการเวลา' : 'Manage Times'}
                  </button>
                </div>
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
                      {new Set(Object.values(savedData || {}).filter(d => d).map(d => `${d.month}-${d.year}`)).size}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Active Months
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {Object.values(savedData || {}).filter(d => d && d.restaurant).length}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Restaurant Prefs
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {Math.round(Object.values(savedData || {}).filter(d => d).reduce((sum, d) => sum + Object.keys(d.availability || {}).length, 0) / Math.max(Object.keys(savedData || {}).length, 1))}
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
                  onClick={navigateBack}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ← {lang === 'th' ? 'กลับ' : 'Back'}
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
                  onClick={navigateBack}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  ← {lang === 'th' ? 'กลับ' : 'Back'}
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

  // Crash Recovery Modal
  if (showRecoveryModal && recoveryData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-lg font-bold mb-4">
              {lang === 'th' ? 'พบข้อมูลที่ยังไม่ได้บันทึก' : 'Unsaved Data Found'}
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {lang === 'th' 
                ? `พบข้อมูล${
                    recoveryData.type === 'time' ? 'การโหวตเวลา' : 
                    recoveryData.type === 'time-poll-creation' ? 'การสร้างโพลเวลา' : 
                    'การโหวตวันที่'
                  }ที่ยังไม่ได้บันทึกจาก ${new Date(recoveryData.timestamp).toLocaleString()} คุณต้องการกู้คืนข้อมูลหรือไม่?`
                : `Found unsaved ${
                    recoveryData.type === 'time' ? 'time voting' : 
                    recoveryData.type === 'time-poll-creation' ? 'time poll creation' : 
                    'date voting'
                  } data from ${new Date(recoveryData.timestamp).toLocaleString()}. Would you like to recover it?`
              }
            </p>
            <div className="space-y-2">
              <button
                onClick={recoverData}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                {lang === 'th' ? '✅ กู้คืนข้อมูล' : '✅ Recover Data'}
              </button>
              <button
                onClick={clearRecovery}
                className={`w-full py-2 px-4 rounded transition-colors ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {lang === 'th' ? '❌ ลบข้อมูล' : '❌ Discard Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback - shouldn't reach here
  return null;
};

export default THEAvailabilityVote;