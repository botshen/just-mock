export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: async () => {
    // 监听来自 background script 的下载消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'downloadImage') {
        const { base64Data, filename } = message.data
        downloadBase64Image(base64Data, filename)
        sendResponse({ success: true })
      }
    })
  },
})

// 下载 base64 图片的函数
function downloadBase64Image(base64Data: string, filename: string) {
  try {
    // 创建一个隐藏的 a 元素
    const link = document.createElement('a')
    link.href = base64Data
    link.download = filename
    link.style.display = 'none'

    // 添加到 DOM，点击然后移除
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log(`图片下载完成: ${filename}`)
  }
  catch (error) {
    console.error('图片下载失败:', error)
  }
}
