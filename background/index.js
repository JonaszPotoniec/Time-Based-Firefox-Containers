const getCurrentContainer = async () => {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentDay = (currentDate.getDay()+6)%7;
  const containersPolicies = (await browser.storage.sync.get(
    "containersPolicies"
  ))?.containersPolicies;

  return (
    containersPolicies?.find((container) => {
      const [fromHour, fromMinute] = container.from;
      const [toHour, toMinute] = container.to;

      if (
        container.weekdays[currentDay] &&
        fromHour <= currentHour &&
        (fromHour !== currentHour || fromMinute < currentMinutes) &&
        toHour >= currentHour &&
        (toHour !== currentHour || toMinute > currentMinutes)
      )
        return true;

      return false;
    })?.containerId ??
    (await browser.storage.sync.get("defaultContainer")).defaultContainer
  );
};

browser.tabs.onCreated.addListener(async (tab) => {
  const currentContainer = await getCurrentContainer();
  if (!currentContainer) return;
  if (tab.cookieStoreId === currentContainer) return;

  if (tab.cookieStoreId === "firefox-default" ){
    let url = {};
    if(tab.url === "about:blank") url = { url: "https://"+tab.title};
    else if(!/^about:*/.test(tab.url)) url = { url: tab.url };
    
    let newParams = {
      ...url,
      index: tab.index,
      pinned: tab.pinned,
      cookieStoreId: currentContainer,
    };
    
    browser.tabs.create(newParams);
    browser.tabs.remove(tab.id);
  }
});
