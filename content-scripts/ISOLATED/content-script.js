const LocalInjectFiles = {
    auto_example : '/injected-files/auto_example.js',
    ajax_proxy   : '/injected-files/ajax_proxy.js',
    auto_fully   : '/injected-files/auto_fully.js',
    stats_js     : '/injected-files/stats/stats.js',
    stats_css    : '/injected-files/stats/stats.css'
};

function Sleep(time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
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

            case 'auto-fully':
                InjectFilesIntoThePage({
                    stringParam : { buttonText : request.buttonText },
                    scriptFiles : [LocalInjectFiles.auto_fully, LocalInjectFiles.auto_example],
                    styleFiles  : [],
                    callback    : () => {}
                });
                break;

            case 'ViolationStatisticsMonthly':
                InjectFilesIntoThePage({
                    stringParam : { buttonTag : request.action },
                    scriptFiles : [LocalInjectFiles.auto_example],
                    styleFiles  : [],
                    callback    : () => {}
                });
                break;

            case 'ViolationStatisticsCustomize':
                InjectFilesIntoThePage({
                    stringParam : { buttonTag : request.action },
                    scriptFiles : [LocalInjectFiles.auto_example],
                    styleFiles  : [],
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
    let tags = document.body.getAttribute('__AUTO__FULLY__TAGS__');

    return tags === '__AUTO__FULLY__TAGS__';
}

function InjectParamDomIntoThePage(param) {
    let injectedScriptDOM = document.createElement('p');
    injectedScriptDOM.id = '__AUTO__FULLY__PARAM__';
    injectedScriptDOM.style = 'display: none;font-size: 0;';
    injectedScriptDOM.textContent = JSON.stringify(param);

    document.body.appendChild(injectedScriptDOM);

    return injectedScriptDOM;
}

function RuntimeGetURLInjectedFiles_Script(filePath) {
    let injectedFiles = chrome.runtime.getURL(filePath);
    let injectedScriptDOM = document.createElement('script');
    injectedScriptDOM.async = false;
    injectedScriptDOM.charset = 'utf-8';
    injectedScriptDOM.src = injectedFiles;

    document.head.appendChild(injectedScriptDOM);

    return new Promise((resolve, reject) => {
        injectedScriptDOM.addEventListener('load', resolve);
    });
}

function RuntimeGetURLInjectedFiles_Style(filePath) {
    let injectedFiles = chrome.runtime.getURL(filePath);
    let injectedLinkDOM = document.createElement('link');
    injectedLinkDOM.rel = 'stylesheet';
    injectedLinkDOM.href = injectedFiles;

    document.head.appendChild(injectedLinkDOM);

    return new Promise((resolve, reject) => {
        injectedLinkDOM.addEventListener('load', resolve);
    });
}

async function InjectFilesIntoThePage({ stringParam = {}, scriptFiles = [], styleFiles = [], callback = () => {} } = {}) {
    if (checkTags()) return;

    const PromiseArray = [];

    InjectParamDomIntoThePage(stringParam);

    await Sleep(2000);

    styleFiles.forEach((element) => {
        PromiseArray.push(RuntimeGetURLInjectedFiles_Style(element));
    });

    scriptFiles.forEach((element) => {
        PromiseArray.push(RuntimeGetURLInjectedFiles_Script(element));
    });

    Promise.all(PromiseArray).then(callback);
}
