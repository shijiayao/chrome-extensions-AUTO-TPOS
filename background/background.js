/**
 * 扩展后台脚本
 * 在扩展页面执行
 */

window.extension = {};

console.log('扩展后台脚本 background.js');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);

    if (request.address === 'extensions:background') {
        switch (request.action) {
            case 'study':
                window.extension.selectVersion = request.selectVersion;
                break;

            case 'exam':
                window.extension.examScoresRadio = request.examScoresRadio;
                break;

            default:
                break;
        }
    }
});

// https://developer.chrome.com/docs/extensions/mv2/messaging?hl=zh-cn
// https://developer.chrome.com/docs/extensions/mv2/reference?hl=zh-cn
