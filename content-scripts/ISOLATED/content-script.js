const URLObject = new URL(location.href);
const HrefLowercase = String(URLObject.href).toLowerCase();
const PathnameLowercase = String(URLObject.pathname).toLowerCase();
const PathnameTargetList = ['/homePage', '/myClass/fromPage', '/myTrainingCourseList', '/home/courseDetail', '/exam/examDetail'].map((element) => element.toLowerCase());
const IsOnlineSchools = URLObject.hostname.indexOf('11.33.1.253') > -1; // 网校
const IsViolationStatistics = URLObject.hostname.indexOf('10.126.26.156') > -1; // 违法数据
const IsHomePage = PathnameLowercase.indexOf(PathnameTargetList[0]) === 0; // 首页
const IsFromPage = PathnameLowercase.indexOf(PathnameTargetList[1]) > -1; // 班级列表页
const IsCourseList = PathnameLowercase.indexOf(PathnameTargetList[2]) > -1; // 课程列表页
const IsCourseDetail = PathnameLowercase.indexOf(PathnameTargetList[3]) > -1; // 课程详情页
const IsExamDetail = HrefLowercase.indexOf(PathnameTargetList[4]) > -1; // 考试详情页

const LocalInjectFiles = {
    ajax_proxy   : '/injected-files/ajax_proxy.js',
    auto_exam    : '/injected-files/auto_exam.js',
    auto_example : '/injected-files/auto_example.js',
    auto_study   : '/injected-files/auto_study.js'
};

let allReadArray = []; // 全部看完的

function Sleep(time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

/**
 * 不在需要拦截请求，直接在实例中获取数据
if (IsOnlineSchools && IsExamDetail) {
    InjectFilesIntoThePage({ stringParam : [], scriptFiles : [LocalInjectFiles.ajax_proxy] });
}
 */

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
                    allReadArray = request.allNumber
                        .toString()
                        .split('')
                        .map((element) => {
                            return Number(element) - 1;
                        });
                }

                InjectFilesIntoThePage({
                    stringParam : [
                        {
                            ratio         : request.setTarget / 100,
                            min           : request.floatRangeMin,
                            max           : request.floatRangeMax,
                            includeSignUp : request.includeSignUp,
                            all           : allReadArray,
                            studyVersion  : request.studyVersion
                        }
                    ],
                    scriptFiles : [LocalInjectFiles.auto_study, LocalInjectFiles.auto_example],
                    callback    : () => {}
                });
                break;

            case 'exam':
                InjectFilesIntoThePage({
                    stringParam : [{ buttonText : request.text, examScores : request.examScores }],
                    scriptFiles : [LocalInjectFiles.auto_exam, LocalInjectFiles.auto_example],
                    callback    : () => {}
                });
                break;

            case 'ViolationStatistics':
                InjectFilesIntoThePage({
                    stringParam : [{}],
                    scriptFiles : [LocalInjectFiles.auto_example],
                    callback    : () => {}
                });
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

function InjectParamDomIntoThePage(param) {
    let injectedScriptDOM = document.createElement('p');
    injectedScriptDOM.id = '__AUTO__CLASS__PARAM__';
    injectedScriptDOM.style = 'display: none;font-size: 0;';
    injectedScriptDOM.textContent = JSON.stringify(param);

    document.body.appendChild(injectedScriptDOM);

    return injectedScriptDOM;
}

function RuntimeGetURLInjectedFiles(filePath) {
    let injectedFiles = chrome.runtime.getURL(filePath);
    let injectedScriptDOM = document.createElement('script');
    injectedScriptDOM.async = false;
    injectedScriptDOM.src = injectedFiles;

    document.head.appendChild(injectedScriptDOM);

    return new Promise((resolve, reject) => {
        injectedScriptDOM.addEventListener('load', resolve);
    });
}

async function InjectFilesIntoThePage({ stringParam = [], scriptFiles = [], callback = () => {} } = {}) {
    if (checkTags()) return;

    const PromiseArray = [];

    stringParam.forEach((element) => {
        InjectParamDomIntoThePage(element);
    });

    await Sleep(2000);

    scriptFiles.forEach((element) => {
        PromiseArray.push(RuntimeGetURLInjectedFiles(element));
    });

    Promise.all(PromiseArray).then(callback);
}
