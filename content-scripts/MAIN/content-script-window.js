/**
 * "ISOLATED" 指定隔离世界，即此扩展程序所独有的执行环境。
 * "MAIN" 指定 DOM 的主域，也就是与托管页面的 JavaScript 共享的执行环境。
 * manifest.json 文件 content_scripts 配置字段 world 为 MAIN 的文件
 * 此文件运行在页面的环境中，可以直接访问页面上的 javascript 的环境上下文
 * 由于是运行在页面上的环境中，所以无法再访问 chrome 扩展提供的 API
 * 例如 chrome.runtime、chrome.extension 等
 */

// console.log('content-script.start-world-MAIN.js');
// console.log(window);
