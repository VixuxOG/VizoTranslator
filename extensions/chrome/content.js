;(function () {
  let popup = null

  function createPopup(selection, x, y) {
    removePopup()

    popup = document.createElement('div')
    popup.className = 'vizo-translate-popup'
    popup.innerHTML = `
      <div class="vizo-translate-header">
        <span class="vizo-translate-title">🔤 VizoTranslator</span>
        <span class="vizo-translate-close">&times;</span>
      </div>
      <div class="vizo-original-text">${escapeHtml(selection)}</div>
      <div class="vizo-loading">Loading translation...</div>
    `

    document.body.appendChild(popup)

    const closeBtn = popup.querySelector('.vizo-translate-close')
    closeBtn.addEventListener('click', removePopup)

    const rect = popup.getBoundingClientRect()
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - 10
    }
    if (y + rect.height > window.innerHeight) {
      y = y - rect.height - 10
    }

    popup.style.left = x + 'px'
    popup.style.top = y + 'px'

    translateText(selection)
  }

  function removePopup() {
    if (popup) {
      popup.remove()
      popup = null
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  async function translateText(text) {
    const loadingDiv = popup.querySelector('.vizo-loading')

    try {
      const apiKey = await new Promise((resolve) => {
        chrome.storage.local.get(['apiKey'], (result) => resolve(result.apiKey))
      })

      if (!apiKey) {
        loadingDiv.textContent = 'Please set API key in extension popup'
        return
      }

      const response = await fetch('https://api.vizotranslator.com/api/v1/translate/translate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source: 'auto',
          target: 'en',
        }),
      })

      if (!response.ok) throw new Error('Translation failed')

      const data = await response.json()
      const translatedDiv = document.createElement('div')
      translatedDiv.className = 'vizo-translated-text'
      translatedDiv.textContent = data.translation
      loadingDiv.replaceWith(translatedDiv)
    } catch (error) {
      loadingDiv.textContent = 'Error: ' + error.message
    }
  }

  document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection().toString().trim()
    if (selection.length > 0 && selection.length < 5000) {
      setTimeout(() => {
        const selection2 = window.getSelection().toString().trim()
        if (selection2.length > 0) {
          const range = window.getSelection().getRangeAt(0)
          const rect = range.getBoundingClientRect()
          createPopup(selection2, rect.left + window.scrollX, rect.bottom + window.scrollY + 5)
        }
      }, 300)
    }
  })

  document.addEventListener('mousedown', (e) => {
    if (popup && !popup.contains(e.target)) {
      removePopup()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removePopup()
    }
  })

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelection') {
      const selection = window.getSelection().toString().trim()
      sendResponse({ text: selection })
    }
  })
})()
