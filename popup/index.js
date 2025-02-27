try {
    const BackgroundWidow = chrome.extension.getBackgroundPage();

    if (BackgroundWidow.extension) {
        setRadio(BackgroundWidow.extension);
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request);
        if (request.address === 'content:extensions') {
            switch (request.action) {
                case 'UI':
                    changeUI(request.url);
                    // changeUI('http://11.33.1.253/exam/examDetail');
                    // changeUI('http://11.33.1.253/homePage');
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
const buttonExam = document.querySelectorAll('.exam-button');

// changeUI('http://11.33.1.253/exam/examDetail');
// changeUI('http://11.33.1.253/homePage');

buttonStartStudy.addEventListener('click', () => {
    const selectSignup = document.querySelectorAll('.select-signup input');
    const setTarget = document.querySelectorAll('.set-target input');
    const floatRange = document.querySelectorAll('.float-range input');
    const allNumber = document.querySelectorAll('.all-number input');
    const selectVersion = document.querySelectorAll('.select-version input[name="version-radio"]:checked');

    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address       : 'extensions:content',
            action        : 'study',
            includeSignUp : selectSignup[0].checked,
            setTarget     : checkNumber(setTarget[0].value),
            floatRangeMin : checkNumber(floatRange[0].value),
            floatRangeMax : checkNumber(floatRange[1].value),
            allNumber     : checkNumber(allNumber[0].value),
            selectVersion : checkNumber(selectVersion[0].value)
        });
    });

    chrome.runtime.sendMessage({
        address       : 'extensions:background',
        action        : 'study',
        selectVersion : checkNumber(selectVersion[0].value)
    });
});

buttonExam.forEach((button) => {
    button.addEventListener('click', (event) => {
        const examScoresRadio = document.querySelectorAll('.exam-scores-radio input[name="scores-radio"]:checked');
        const text = event.target.textContent;

        chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                address         : 'extensions:content',
                action          : 'exam',
                text            : text,
                examScoresRadio : checkNumber(examScoresRadio[0].value)
            });
        });

        chrome.runtime.sendMessage({
            address         : 'extensions:background',
            action          : 'exam',
            examScoresRadio : checkNumber(examScoresRadio[0].value)
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
    const URLObject = new URL(url);
    const HrefLowercase = String(URLObject.href).toLowerCase();
    const PathnameLowercase = String(URLObject.pathname).toLowerCase();
    const PathnameTargetList = ['/homePage', '/myClass/fromPage', '/myTrainingCourseList', '/home/courseDetail', '/exam/examDetail'].map((element) => element.toLowerCase());
    const IsID = URLObject.hostname.indexOf('11.33.1.253') > -1;
    const IsHomePage = PathnameLowercase.indexOf(PathnameTargetList[0]) === 0; // 首页
    const IsFromPage = PathnameLowercase.indexOf(PathnameTargetList[1]) > -1; // 班级列表页
    const IsCourseList = PathnameLowercase.indexOf(PathnameTargetList[2]) > -1; // 课程列表页
    const IsCourseDetail = PathnameLowercase.indexOf(PathnameTargetList[3]) > -1; // 课程详情页
    const IsExamDetail = HrefLowercase.indexOf(PathnameTargetList[4]) > -1; // 考试详情页

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

function setRadio(options) {
    if (options.selectVersion > 0) {
        document.querySelector(`.select-version input[name="version-radio"][value="${options.selectVersion}"]`).checked = true;
    }
    if (options.examScoresRadio > 0) {
        document.querySelector(`.exam-scores-radio input[name="scores-radio"][value="${options.examScoresRadio}"]`).checked = true;
    }
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
