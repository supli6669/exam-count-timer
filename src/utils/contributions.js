export const getContributions = () => {
  try {
    const saved = localStorage.getItem('productivity_contributions');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveContributions = (contributions) => {
  try {
    localStorage.setItem('productivity_contributions', JSON.stringify(contributions));
  } catch (err) {
    console.warn('Cannot save contributions to localStorage:', err);
  }
};

export const incrementContribution = (dateStr = new Date().toISOString().split('T')[0]) => {
  const contributions = getContributions();
  contributions[dateStr] = (contributions[dateStr] || 0) + 1;
  saveContributions(contributions);
  window.dispatchEvent(new Event('contributions-updated'));
};

export const decrementContribution = (dateStr = new Date().toISOString().split('T')[0]) => {
  const contributions = getContributions();
  if (contributions[dateStr] && contributions[dateStr] > 0) {
    contributions[dateStr] -= 1;
    if (contributions[dateStr] === 0) {
      delete contributions[dateStr];
    }
    saveContributions(contributions);
    window.dispatchEvent(new Event('contributions-updated'));
  }
};
