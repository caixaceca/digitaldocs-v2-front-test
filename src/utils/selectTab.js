export default function selectTab(tabs, currentTab) {
  let tab = tabs?.[0]?.value;
  tabs.forEach((row) => {
    const isMatched = row.value === currentTab;
    if (isMatched) {
      tab = currentTab;
    }
  });
  return tab;
}
