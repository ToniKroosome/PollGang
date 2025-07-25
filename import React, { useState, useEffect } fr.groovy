import React, { useState, useEffect } from 'react';

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
  
  const [isPainting, setIsPainting] = useState(false);
  const [paintValue, setPaintValue] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [brush, setBrush] = useState(2); // 2=green, 1=yellow, 0=red

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
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

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

  const handleSubmit = () => {
    const THEData = {
      name: THEName,
      month: selectedMonth,
      year: selectedYear,
      availability: availability,
      restaurant: preferredRestaurant
    };

    setSavedData(prev => ({
      ...prev,
      [THEName]: THEData
    }));

    setIsSubmitted(true);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

    const handleDayClick = (day, value) => {
      const key = `${selectedYear}-${selectedMonth + 1}-${day}`;
      setAvailability(prev => ({ ...prev, [key]: value }));
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

      days.push(
        <div
          key={day}
          className={`h-12 border border-gray-300 flex items-center justify-center cursor-pointer transition-colors ${bg}`}
          // start drag
          onMouseDown={() => {
            setIsPainting(true);
            handleDayClick(day, brush);
          }}
          // continue drag
          onMouseEnter={() => {
            if (isPainting) handleDayClick(day, brush);
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
          {[2,1,0].map(v=>{
            const cl = isDarkMode 
              ? (v===2?'bg-green-500':v===1?'bg-yellow-500':'bg-red-500')
              : (v===2?'bg-green-400':v===1?'bg-yellow-400':'bg-red-400');
            return (
              <button
                key={v}
                onClick={()=>setBrush(v)}
                className={`w-8 h-8 rounded ${cl} ${brush===v?'ring-2 ring-offset-1 ring-blue-600':''}`}
              />
            );
          })}
        </div>
        
        <div className={`grid grid-cols-7 gap-1`}>
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

  if (currentPage === 'view') {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const THENames = Object.keys(savedData);
    
    const relevantTHEs = THENames.filter(name => {
      const data = savedData[name];
      return data && data.month === viewMonth && data.year === viewYear;
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
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={() => setCurrentPage('main')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('backBtn')}
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

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
      </div>
    );
  }

  if (isSubmitted) {
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
              setCurrentStep(1);
              setTHEName('');
              setAvailability({});
              setPreferredRestaurant('');
              setIsSubmitted(false);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('submitAnother')}
          </button>
        </div>
      </div>
    );
  }

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
                  {t('siteTitle')}
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
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('submitBtn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default THEAvailabilityVote;


