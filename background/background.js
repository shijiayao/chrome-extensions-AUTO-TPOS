/**
 * 扩展后台脚本
 * 在扩展页面执行
 */

console.log('扩展后台脚本 background.js');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
});

// https://developer.chrome.com/docs/extensions/mv2/messaging?hl=zh-cn
// https://developer.chrome.com/docs/extensions/mv2/reference?hl=zh-cn
