export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  browser.action.onClicked.addListener((tab) => {
    // 打开侧边栏
    browser.sidePanel.open({ windowId: tab.windowId });
  });
});
