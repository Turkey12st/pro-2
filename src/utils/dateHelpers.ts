
// مساعدات التاريخ الهجري والميلادي
export const formatGregorianDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatHijriDate = (date: Date = new Date()): string => {
  try {
    return date.toLocaleDateString('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    // fallback for browsers that don't support Islamic calendar
    return `${date.getFullYear()} هـ`;
  }
};

export const formatTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const getCurrentDates = () => {
  const now = new Date();
  return {
    gregorian: formatGregorianDate(now),
    hijri: formatHijriDate(now),
    time: formatTime(now)
  };
};
