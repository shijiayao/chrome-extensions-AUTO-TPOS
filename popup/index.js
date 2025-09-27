try {
    /**
     * 查询当前页面 URL
     */
    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        const activeTab = tabs[0];
        const activeTabUrl = activeTab.url;

        changeUI(activeTabUrl);
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request);

        if (request.address === 'content:extensions') {
            switch (request.action) {
                case 'UI':
                    // 内容脚本（content script）查询到当前页面 URL
                    changeUI(request.url);
                    break;

                default:
                    break;
            }
        }
    });

    /**
     * 发消息通知内容脚本（content script）查询当前页面 URL
     */
    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address : 'extensions:content',
            action  : 'query-url'
        });
    });
} catch (error) {
    console.log(error);
}

const ButtonStartAutoFully = document.getElementById('start-auto-fully');
const ButtonMockExam = document.getElementById('mock-exam');
const ButtonViolationStatisticsMonthly = document.getElementById('violation-statistics-button-monthly');
const ButtonViolationStatisticsCustomize = document.getElementById('violation-statistics-button-customize');

ButtonStartAutoFully?.addEventListener('click', () => {
    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address : 'extensions:content',
            action  : 'auto-fully'
        });
    });

    chrome.runtime.sendMessage({
        address : 'extensions:background/service_worker',
        action  : 'auto-fully'
    });
});

ButtonMockExam?.addEventListener('click', () => {
    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address    : 'extensions:content',
            action     : 'auto-fully',
            buttonText : '模拟考试'
        });
    });

    chrome.runtime.sendMessage({
        address    : 'extensions:background/service_worker',
        action     : 'auto-fully',
        buttonText : '模拟考试'
    });
});

ButtonViolationStatisticsMonthly?.addEventListener('click', () => {
    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address : 'extensions:content',
            action  : 'ViolationStatisticsMonthly'
        });
    });

    chrome.runtime.sendMessage({
        address : 'extensions:background/service_worker',
        action  : 'ViolationStatisticsMonthly'
    });
});

ButtonViolationStatisticsCustomize?.addEventListener('click', () => {
    chrome.tabs.query({ active : true, currentWindow : true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            address : 'extensions:content',
            action  : 'ViolationStatisticsCustomize'
        });
    });

    chrome.runtime.sendMessage({
        address : 'extensions:background/service_worker',
        action  : 'ViolationStatisticsCustomize'
    });
});

function changeUI(url) {
    const URLObject = new URL(url);
    const HrefLowercase = String(URLObject.href).toLowerCase();
    const PathnameLowercase = String(URLObject.pathname).toLowerCase();
    const PathnameTargetList = ['/homePage', '/myClass/fromPage', '/myTrainingCourseList', '/home/courseDetail', '/myExam/fromPage', '/exam/examDetail', '/rmweb/punishment'].map((element) => element.toLowerCase());
    const IsOnlineSchools = URLObject.hostname.indexOf('11.33.1.253') > -1;
    const IsHomePage = PathnameLowercase.indexOf(PathnameTargetList[0]) === 0; // 首页
    const IsStudyListLevelOne = PathnameLowercase.indexOf(PathnameTargetList[1]) > -1; // 学习一级列表页
    const IsStudyListLevelTwo = PathnameLowercase.indexOf(PathnameTargetList[2]) > -1; // 学习二级列表页
    const IsStudyDetail = PathnameLowercase.indexOf(PathnameTargetList[3]) > -1; // 学习课程详情页
    const IsExamListLevelOne = PathnameLowercase.indexOf(PathnameTargetList[4]) > -1; // 考试一级列表页
    const IsExamDetail = HrefLowercase.indexOf(PathnameTargetList[5]) > -1; // 考试详情页
    const IsViolationStatistics = PathnameLowercase.indexOf(PathnameTargetList[6]) > -1; // 违法数据

    const tabsDiv = document.querySelectorAll('.tabs-div');

    tabsDiv.forEach((element, index) => {
        element.style.display = 'none';
    });

    if (IsViolationStatistics) {
        tabsDiv[2].style.display = 'block';
    } else if (IsOnlineSchools) {
        if (IsHomePage) {
            tabsDiv[1].style.display = 'block';
        } else if (IsStudyListLevelOne || IsStudyListLevelTwo || IsStudyDetail) {
            tabsDiv[1].querySelectorAll('div.button-box button')[1].textContent = '一键开始（学习）';
            tabsDiv[1].style.display = 'block';
        } else if (IsExamListLevelOne || IsExamDetail) {
            tabsDiv[1].querySelectorAll('div.button-box button')[1].textContent = '一键开始（考试）';
            tabsDiv[1].style.display = 'block';

            if (IsExamDetail) {
                tabsDiv[1].querySelectorAll('div.button-box')[0].style.display = 'block';
            }
        }
    } else {
        tabsDiv[0].style.display = 'block';
    }
}
