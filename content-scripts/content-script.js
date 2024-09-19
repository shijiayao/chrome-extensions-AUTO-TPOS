const urlObject = new URL(location.href);
const IsID = urlObject.hostname.indexOf('11.33.1.253') > -1;
const IsHomePage = urlObject.pathname.indexOf('/homePage') === 0; // 首页
const IsFromPage = urlObject.pathname.indexOf('/myClass/fromPage') > -1; // 班级列表页
const IsCourseList = urlObject.pathname.indexOf('/myTrainingCourseList') > -1; // 课程列表页
const IsCourseDetail = urlObject.pathname.indexOf('/home/courseDetail') > -1; // 课程详情页
const IsExamDetail = urlObject.href.indexOf('/exam/examDetail') > -1; // 考试详情页

let allReadArray = []; // 全部看完的

function Sleep(time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

if (IsID && IsExamDetail) {
    ajaxProxyPublic();
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    console.log(request);

    if (request.address === 'extensions:content') {
        switch (request.action) {
            case 'query-url':
                sendMessage({
                    address : 'content:extensions',
                    action  : 'UI',
                    url     : location.href
                });
                break;

            case 'study':
                allReadArray = [-1];

                if (request.allNumber > 0) {
                    allReadArray = request.allNumber.toString().split('').map((element) => {
                        return Number(element) - 1;
                    });
                }

                autoStudyClass(
                    injectedJavaScriptCode(
                        `window.AutoStudyClassExample = new AutoStudyClass({ ratio : ${request.setTarget / 100}, min : ${request.floatRangeMin}, max : ${request.floatRangeMax}, includeSignUp : ${
                            request.includeSignUp
                        }, all : [${allReadArray}] });`
                    )
                );

                break;

            case 'exam':
                autoExamClass(injectedJavaScriptCode(`new AutoExam({ buttonText: '${request.text}' });`));
                break;

            default:
                break;
        }
    }
});

function sendMessage(param) {
    chrome.runtime.sendMessage(param);
}

function checkTags() {
    let tags = document.body.getAttribute('__AUTO__CLASS__TAGS__');

    return tags === '__AUTO__CLASS__TAGS__';
}

function autoStudyClass(callback) {
    if (checkTags()) return;

    let injectedFiles = chrome.runtime.getURL('/injected-files/auto_study.js');
    let injectedScriptDOM = document.createElement('script');
    injectedScriptDOM.src = injectedFiles;

    document.head.appendChild(injectedScriptDOM);

    injectedScriptDOM.addEventListener('load', callback);
}

function autoExamClass(callback) {
    if (checkTags()) return;

    let injectedFiles = chrome.runtime.getURL('/injected-files/auto_exam.js');
    let injectedScriptDOM = document.createElement('script');
    injectedScriptDOM.src = injectedFiles;

    document.head.appendChild(injectedScriptDOM);

    injectedScriptDOM.addEventListener('load', callback);
}

function ajaxProxyPublic(callback) {
    if (checkTags()) return;

    let injectedFiles = chrome.runtime.getURL('/injected-files/ajax_proxy.js');
    let injectedScriptDOM = document.createElement('script');
    injectedScriptDOM.src = injectedFiles;

    document.head.appendChild(injectedScriptDOM);

    injectedScriptDOM.addEventListener('load', callback);
}

async function injectedJavaScriptCode(JavaScriptCode, callback = () => {}) {
    if (checkTags()) return;

    await Sleep(2000);

    let injectedScriptDOM = document.createElement('script');
    injectedScriptDOM.textContent = JavaScriptCode;

    document.body.appendChild(injectedScriptDOM);

    injectedScriptDOM.addEventListener('load', callback);
}
