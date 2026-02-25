import { useState, useCallback } from 'react';

export function useTabsSync(tabs, initialValue = '', itemLocalStorage = '') {
  const [currentTab, setCurrentTab] = useState(() => {
    const stored = itemLocalStorage ? localStorage.getItem(itemLocalStorage) : null;
    return stored || initialValue;
  });

  const isTabValid = tabs.some((tab) => tab.value === currentTab);

  let activeTab = currentTab;

  if (!isTabValid && tabs.length > 0) {
    activeTab = tabs[0].value;
    setCurrentTab(activeTab);
    if (itemLocalStorage) {
      localStorage.setItem(itemLocalStorage, activeTab);
    }
  }

  const changeTab = useCallback(
    (event, newValue) => {
      setCurrentTab(newValue);
      if (itemLocalStorage) {
        localStorage.setItem(itemLocalStorage, newValue);
      }
    },
    [itemLocalStorage]
  );

  return [activeTab, changeTab];
}
