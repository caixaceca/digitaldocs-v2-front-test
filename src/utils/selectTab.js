export default function selectTab(tabs, currentTab) {
  let tab = null;
  tabs.forEach((row) => {
    const isMatched = row.value === currentTab;
    if (isMatched) {
      tab = currentTab;
    }
  });
  return tab;
}
