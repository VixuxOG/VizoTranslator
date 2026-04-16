chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translateSelection',
    title: 'Translate with VizoTranslator',
    contexts: ['selection'],
  })

  chrome.contextMenus.create({
    id: 'openDashboard',
    title: 'Open VizoTranslator Dashboard',
    contexts: ['page'],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translateSelection' && info.selectionText) {
    chrome.storage.local.get(['apiKey'], (result) => {
      if (result.apiKey) {
        chrome.runtime.sendMessage({
          action: 'translateSelection',
          text: info.selectionText,
        })
      } else {
        chrome.action.openPopup()
      }
    })
  } else if (info.menuItemId === 'openDashboard') {
    chrome.tabs.create({ url: 'https://vizotranslator.com/dashboard' })
  }
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-translator') {
    chrome.action.openPopup()
  } else if (command === 'translate-selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' })
    })
  }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (changes.translationHistory && areaName === 'local') {
    chrome.action.setBadgeText({
      text: changes.translationHistory.newValue?.length?.toString() || '',
    })
  }
})
