try {
    const BackgroundWidow = chrome.extension.getBackgroundPage();

    if (BackgroundWidow.extension && BackgroundWidow.extension.passwordKeyVerdict) {
        verifyPasswordKey();
    }

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
} catch (error) {
    console.log(error);
}

const buttonStartStudy = document.getElementById('start-study');
const buttonPasswordKey = document.getElementById('password-key');
const buttonMockExam = document.getElementById('mock-exam');
const buttonStartExam = document.getElementById('start-exam');

buttonStartStudy.addEventListener('click', () => {
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

buttonPasswordKey.addEventListener('click', () => {
    const passwordKeyInput = document.querySelector('.auto-exam .verify-box .input-box input');

    const verdict = String(passwordKeyInput.value).slice(0, 10) === timestampSerialize(new Date()).join('').slice(0, 10);

    if (verdict) {
        verifyPasswordKey();

        chrome.runtime.sendMessage({
            address : 'extensions:background',
            action  : 'password-key'
        });
    }
});

buttonMockExam.addEventListener('click', (event) => {
    const text = event.target.textContent;

    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address : 'extensions:content',
            action  : 'exam',
            text    : text
        });
    });
});

buttonStartExam.addEventListener('click', (event) => {
    const text = event.target.textContent;

    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address : 'extensions:content',
            action  : 'exam',
            text    : text
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

function verifyPasswordKey() {
    const verifyBox = document.querySelector('.auto-exam .verify-box');
    const selectButtonBox = document.querySelector('.auto-exam .select-button-box');

    verifyBox.style.display = 'none';
    selectButtonBox.style.display = 'initial';
}

function timestampSerialize(timestamp) {
    let dateNum = 0;
    let dateNumLength = 0;

    if (!isNaN(new Date(timestamp).getTime())) {
        // 字符串日期 或者 数字时间戳
        dateNum = new Date(timestamp).getTime();
    } else if (!isNaN(new Date(Number(timestamp)).getTime())) {
        // 字符串时间戳
        dateNum = new Date(Number(timestamp)).getTime();
    } else {
        return timestamp;
    }

    dateNumLength = String(dateNum).length;

    if (dateNumLength < 10) {
        // 小于 10 位数，默认不是时间戳
        return timestamp;
    } else if (dateNumLength < 13) {
        // 补齐时间戳位数
        dateNum = Number(dateNum) * Math.pow(10, 13 - dateNumLength);
    }

    let D = new Date(dateNum);

    let year = D.getFullYear();
    let month = D.getMonth() + 1;
    let day = D.getDate();
    let hour = D.getHours();
    let minute = D.getMinutes();
    let second = D.getSeconds();

    let dateArr = [year, month, day];
    let timeArr = [hour, minute, second];

    for (let a = 1; a < dateArr.length; a++) {
        dateArr[a] = String(dateArr[a])[1] ? String(dateArr[a]) : '0' + String(dateArr[a]);
    }

    for (let b = 0; b < timeArr.length; b++) {
        timeArr[b] = String(timeArr[b])[1] ? String(timeArr[b]) : '0' + String(timeArr[b]);
    }

    return [].concat(dateArr, timeArr);
}
