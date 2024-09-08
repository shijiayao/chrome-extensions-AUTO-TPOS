chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    if (request.address === 'content:extensions') {
        switch (request.action) {
            case 'UI':
                changeUI(request.url);
                break;

            default:
                break;
        }
    }
});

chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
        address : 'extensions:content',
        action  : 'query-url'
    });
});

const buttonStudy = document.getElementById('start-study');
const buttonExam = document.getElementById('start-exam');

buttonStudy.addEventListener('click', () => {
    const selectSignup = document.querySelectorAll('.select-signup input');
    const setTarget = document.querySelectorAll('.set-target input');
    const floatRange = document.querySelectorAll('.float-range input');
    const allNumber = document.querySelectorAll('.all-number input');

    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address       : 'extensions:content',
            action        : 'study',
            includeSignUp : selectSignup[0].checked,
            setTarget     : checkNumber(setTarget[0].value),
            floatRangeMin : checkNumber(floatRange[0].value),
            floatRangeMax : checkNumber(floatRange[1].value),
            allNumber     : checkNumber(allNumber[0].value)
        });
    });
});

buttonExam.addEventListener('click', () => {
    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address : 'extensions:content',
            action  : 'exam'
        });
    });
});

function checkNumber(value) {
    let tempValue = Number(value);
    if (isNaN(value)) {
        tempValue = 0;
    } else if (tempValue < 0) {
        tempValue = 0;
    }
    return tempValue;
}

function changeUI(url) {
    const urlObject = new URL(url);
    const IsID = urlObject.hostname.indexOf('11.33.1.253') > -1;
    const IsHomePage = urlObject.pathname.indexOf('/homePage') === 0; // 首页
    const IsFromPage = urlObject.pathname.indexOf('/myClass/fromPage') > -1; // 班级列表页
    const IsCourseList = urlObject.pathname.indexOf('/myTrainingCourseList') > -1; // 课程列表页
    const IsCourseDetail = urlObject.pathname.indexOf('/home/courseDetail') > -1; // 课程详情页
    const IsExamDetail = urlObject.href.indexOf('/exam/examDetail') > -1; // 考试详情页

    const tabsDiv = document.querySelectorAll('.tabs-div');

    if (IsID) {
        if (IsHomePage || IsFromPage || IsCourseList || IsCourseDetail) {
            tabsDiv[0].style.display = 'none';
            tabsDiv[1].style.display = 'initial';
            tabsDiv[2].style.display = 'none';
        } else if (IsExamDetail) {
            tabsDiv[0].style.display = 'none';
            tabsDiv[1].style.display = 'none';
            tabsDiv[2].style.display = 'initial';
        }
    } else {
        tabsDiv[0].style.display = 'initial';
        tabsDiv[1].style.display = 'none';
        tabsDiv[2].style.display = 'none';
    }
}
