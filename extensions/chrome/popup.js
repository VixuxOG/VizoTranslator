document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey')
  const sourceLang = document.getElementById('sourceLang')
  const targetLang = document.getElementById('targetLang')
  const sourceText = document.getElementById('sourceText')
  const translateBtn = document.getElementById('translateBtn')
  const resultDiv = document.getElementById('result')

  const stored = await chrome.storage.local.get(['apiKey', 'sourceLang', 'targetLang'])
  if (stored.apiKey) apiKeyInput.value = stored.apiKey
  if (stored.sourceLang) sourceLang.value = stored.sourceLang
  if (stored.targetLang) targetLang.value = stored.targetLang

  apiKeyInput.addEventListener('change', () => {
    chrome.storage.local.set({ apiKey: apiKeyInput.value })
  })

  sourceLang.addEventListener('change', () => {
    chrome.storage.local.set({ sourceLang: sourceLang.value })
  })

  targetLang.addEventListener('change', () => {
    chrome.storage.local.set({ targetLang: targetLang.value })
  })

  translateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value
    if (!apiKey) {
      alert('Please enter your API key')
      return
    }

    const text = sourceText.value.trim()
    if (!text) {
      alert('Please enter text to translate')
      return
    }

    translateBtn.disabled = true
    translateBtn.innerHTML = '<span class="loading"></span> Translating...'

    try {
      const response = await fetch('https://api.vizotranslator.com/api/v1/translate/translate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source: sourceLang.value,
          target: targetLang.value,
        }),
      })

      if (!response.ok) throw new Error('Translation failed')

      const data = await response.json()
      resultDiv.style.display = 'block'
      resultDiv.textContent = data.translation

      chrome.storage.local.get(['translationHistory'], (result) => {
        const history = result.translationHistory || []
        history.unshift({
          source: text,
          target: data.translation,
          from: sourceLang.value,
          to: targetLang.value,
          timestamp: Date.now(),
        })
        chrome.storage.local.set({ translationHistory: history.slice(0, 50) })
      })
    } catch (error) {
      resultDiv.style.display = 'block'
      resultDiv.textContent = 'Error: ' + error.message
    } finally {
      translateBtn.disabled = false
      translateBtn.textContent = 'Translate'
    }
  })

  sourceText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      translateBtn.click()
    }
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translateSelection') {
    document.getElementById('sourceText').value = request.text
    document.getElementById('translateBtn').click()
  }
})
