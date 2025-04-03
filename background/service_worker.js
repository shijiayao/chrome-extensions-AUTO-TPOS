/**
 * 扩展后台脚本
 */

console.log('扩展后台脚本 background/service_worker.js');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);

    if (request.address === 'extensions:background/service_worker') {
        switch (request.action) {
            case 'study':
                console.log(request.studyVersion);
                break;

            case 'exam':
                console.log(request.examScores);
                break;

            default:
                break;
        }
    }
});
