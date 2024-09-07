class AutoStudyClass {
    constructor(options = {}) {
        this.bc = null;
        this.options = options;
        this.ratio = options.ratio || 0.05;
        this.min = options.min || 0;
        this.max = options.max || 0;
        this.all = options.all || [];
        this.NewTabsClass = null;
        this.DetailListClass = null;
        this.DetailClass = null;

        this.addTags();
        this.tabsMessage();
        this.checkParams();

        this.guide();
    }

    Sleep(time = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }

    // 生成随机数，范围 min - max
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max + 1 - min) + min);
    }

    tabsMessage() {
        this.bc = new BroadcastChannel('auto-play');
    }

    // NewTabsClass 代码字符串
    NewTabsClassCodeString(afootIndex) {
        return this.constructor.toString() + `;window.AutoStudyClassExample = new AutoStudyClass({ ratio: ${this.all.includes(afootIndex) ? 1 : this.ratio}, min: ${this.min}, max: ${this.max} });`;
    }

    // 检查参数
    checkParams() {
        if (this.ratio > 1) {
            this.ratio = 1;
        }
    }

    guide() {
        if (location.pathname.indexOf('/homePage') === 0) {
            // 首页
            this.homePage();
        } else if (location.pathname.indexOf('/myClass/fromPage') > -1) {
            //  进行中的列表
            this.AutoStudy_NewTabsClass();
        } else if (location.pathname.indexOf('/myTrainingCourseList') > -1) {
            // 详情列表页
            this.AutoStudy_DetailListClass();
        } else if (location.pathname.indexOf('/home/courseDetail') > -1) {
            // 详情页
            this.AutoStudy_DetailClass();
        }
    }

    async homePage() {
        await this.Sleep(1000);
        document.querySelector('a[href="/myClass/fromPage"] .HomePage07').click();
        await this.Sleep(1000);
        this.guide();
    }

    addTags() {
        document.body.setAttribute('__AUTO__CLASS__TAGS__','__AUTO__CLASS__TAGS__');
    }

    async AutoStudy_NewTabsClass() {
        const _this = this;

        class NewTabsClass {
            constructor() {
                this.afootLinkArray = []; // 进行中的列表 ID
                this.afootIndex = 0;
                this.detailListTabsWindow = null;
                this.bc = null;

                this.MessageEvent();
                this.syncFn();
            }

            // 标签页通讯
            MessageEvent() {
                _this.bc.addEventListener('message', (event) => {
                    if (event.data === 'detail-list-complete') {
                        // 继续播放下一个
                        ++this.afootIndex;

                        if (this.afootIndex < this.afootLinkArray.length) {
                            setTimeout(() => {
                                this.openDetailList();
                            }, 10000);
                        } else {
                            // 所有列表都播放完了
                            document.body.style.backgroundColor = 'red';
                        }
                    }
                });
            }

            // 同步环境
            async syncFn() {
                this.clickAfoot();
                await _this.Sleep(2000);
                this.listPage();
                this.openDetailList();
            }

            // 切换到进行中
            clickAfoot() {
                document.querySelectorAll('.jss1343 p')[1].click();
            }

            // 列表页
            listPage() {
                // 进行中的列表
                [].forEach.call(document.querySelectorAll('.MuiList-root .myTrainingClass-list-head a'), (element) => {
                    this.afootLinkArray.push(element.getAttribute('href').split('/')[2]);
                });
            }

            // 打开详情页列表
            openDetailList() {
                if (this.afootLinkArray.length <= 0) {
                    return (document.body.style.backgroundColor = 'lime');
                }

                const newTabsWindow = window.open('/myTrainingCourseList/' + this.afootLinkArray[this.afootIndex], '_blank');

                this.detailListTabsWindow = newTabsWindow;

                newTabsWindow.addEventListener('load', () => {
                    this.injectingCode();
                });
            }

            // 注入代码
            injectingCode() {
                const scriptElement = this.detailListTabsWindow.document.createElement('script');

                this.detailListTabsWindow.document.body.appendChild(scriptElement);

                setTimeout(() => {
                    scriptElement.appendChild(document.createTextNode(_this.NewTabsClassCodeString(this.afootIndex)));
                }, 5000);
            }
        }

        _this.NewTabsClass = new NewTabsClass();
    }

    async AutoStudy_DetailListClass() {
        const _this = this;

        class DetailListClass {
            constructor() {
                this.detailLinkArray = [];
                this.detailListIndex = 0;
                this.detailTabsWindow = null;
                this.bc = null;
                this.MessageEvent();
                this.detailList();
                this.openDetail();
            }
            /* 标签页通讯 */
            MessageEvent() {
                _this.bc.addEventListener('message', (event) => {
                    if (event.data === 'detail-complete') {
                        /* 继续播放下一个 */
                        ++this.detailListIndex;
                        if (this.detailListIndex < this.detailLinkArray.length) {
                            setTimeout(() => {
                                this.openDetail();
                            }, 8000);
                        } else {
                            /* 所有列表都播放完了 */
                            _this.bc.postMessage('detail-list-complete');
                            setTimeout(() => {
                                window.close();
                            }, 3000);
                        }
                    }
                });
            }
            /* 详情页列表 */
            detailList() {
                [].forEach.call(document.querySelectorAll('.content-container ul li a'), (element) => {
                    this.detailLinkArray.push(element.getAttribute('href'));
                });
            }
            /* 打开详情页 */
            openDetail() {
                const newTabsWindow = window.open(this.detailLinkArray[this.detailListIndex], '_blank');
                this.detailTabsWindow = newTabsWindow;
                newTabsWindow.addEventListener('load', () => {
                    this.injectingCode();
                });
            }
            /* 注入代码 */
            injectingCode() {
                const scriptElement = this.detailTabsWindow.document.createElement('script');
                this.detailTabsWindow.document.body.appendChild(scriptElement);
                setTimeout(() => {
                    scriptElement.appendChild(document.createTextNode(_this.NewTabsClassCodeString()));
                }, 5000);
            }
        }

        _this.DetailListClass = new DetailListClass();
    }

    async AutoStudy_DetailClass() {
        const _this = this;

        class DetailClass {
            constructor() {
                this.ratio = _this.ratio;

                this.init();
                this.loopPlay();
            }

            init() {
                window.onblur = () => {};
                window.onbeforeunload = () => {};
            }

            async loopPlay() {
                const loopCount = Math.ceil(this.ratio / 0.2);
                console.log('loopRatio', this.ratio);
                console.log('loopCount', loopCount);
                if (this.ratio >= 1) {
                    for (let index = 0; index < loopCount; index++) {
                        console.log('loopIndex', index);
                        await this.detail({ ratio : 0.2, count : index, isLoop : true });
                    }
                } else if (this.ratio > 0.2) {
                    for (let index = 0; index < loopCount; index++) {
                        console.log('loopIndex', index);
                        await this.detail({ ratio : 0.2, count : index, isLoop : true });
                    }
                    await this.different();
                } else {
                    await this.detail({ ratio : this.ratio, count : 0, isLoop : false });
                    await this.different();
                }

                await this.playOver();
            }

            async detail(options) {
                const VideoList = document.querySelectorAll('.palyer-course-list > div');
                for (let index01 = 0; index01 < VideoList.length; index01++) {
                    const pDom = VideoList[index01].querySelectorAll('p');
                    let itemTime = pDom[0].innerText.trim();
                    let H = (itemTime.match(/\d*时/) || ['0时'])[0].replace('时', '');
                    let M = (itemTime.match(/\d*分/) || ['0分'])[0].replace('分', '');
                    let S = (itemTime.match(/\d*秒/) || ['0秒'])[0].replace('秒', '');
                    let loadTime = 0;
                    let totalTime = Number(H) * 60 * 60 * 1000 + (Number(M) + 1) * 60 * 1000 + Number(S) * 1000;
                    if (pDom[1]) {
                        loadTime = parseInt(pDom[1].innerText.replace('完成度：', ''));
                    }
                    let sleepTime = 5000;
                    if (options.isLoop) {
                        if (options.ratio * (options.count + 1) <= loadTime / 100) {
                            sleepTime = 5000;
                        } else {
                            sleepTime = totalTime * (options.ratio + 0.01);
                        }
                    } else {
                        if (loadTime / 100 >= options.ratio) {
                            sleepTime = 5000;
                        } else {
                            sleepTime = totalTime * (options.ratio - loadTime / 100 + 0.01);
                        }
                    }
                    console.log('index', index01);
                    console.log('H', H, 'M', M, 'S', S);
                    console.log('totalTime', totalTime);
                    console.log('loadTime', loadTime);
                    console.log('sleepTime', sleepTime);
                    if (loadTime > 0) {
                        if (loadTime / (options.count + 1) / 100 >= options.ratio) {
                            console.log('continue');
                            await _this.Sleep(1000);
                            continue;
                        } else {
                            VideoList[index01].querySelector('.course-title').click();
                            await _this.Sleep(2000);
                            {
                                const videoElement = document.querySelector('video');
                                if (videoElement) {
                                    videoElement.muted = true;
                                    videoElement.play();
                                }
                            }
                        }
                    } else {
                        VideoList[index01].querySelector('.course-title').click();
                        await _this.Sleep(2000);
                        {
                            const videoElement = document.querySelector('video');
                            if (videoElement) {
                                videoElement.muted = true;
                                videoElement.play();
                            }
                        }
                    }
                    await _this.Sleep(sleepTime);
                    console.log('loop-' + index01);
                }
            }

            async different() {
                const VideoList = document.querySelectorAll('.palyer-course-list > div');
                for (let index01 = 0; index01 < VideoList.length; index01++) {
                    const pDom = VideoList[index01].querySelectorAll('p');
                    let itemTime = pDom[0].innerText.trim();
                    let H = (itemTime.match(/\d*时/) || ['0时'])[0].replace('时', '');
                    let M = (itemTime.match(/\d*分/) || ['0分'])[0].replace('分', '');
                    let S = (itemTime.match(/\d*秒/) || ['0秒'])[0].replace('秒', '');
                    let loadTime = 0;
                    let totalTime = Number(H) * 60 * 60 * 1000 + (Number(M) + 1) * 60 * 1000 + Number(S) * 1000;
                    let rNumber = _this.randomNumber(_this.min, _this.max);
                    if (pDom[1]) {
                        loadTime = parseInt(pDom[1].innerText.replace('完成度：', ''));
                    }
                    let sleepTime = 5000;
                    console.log('different-loadTime', loadTime);
                    console.log('different-random', rNumber);
                    if (loadTime / 100 >= this.ratio) {
                        console.log('different-continue');
                        continue;
                    } else {
                        sleepTime = totalTime * (rNumber / 100);

                        VideoList[index01].querySelector('.course-title').click();
                        await _this.Sleep(2000);
                        {
                            const videoElement = document.querySelector('video');
                            if (videoElement) {
                                videoElement.muted = true;
                                videoElement.play();
                            }
                        }
                    }

                    console.log('different-sleepTime', sleepTime);

                    await _this.Sleep(sleepTime);
                    console.log('different-loop-' + index01);
                }
            }

            async playOver() {
                const VideoList = document.querySelectorAll('.palyer-course-list > div');
                VideoList[0].querySelector('.course-title').click();
                console.log('playOver');
                await _this.Sleep(5000);
                _this.bc.postMessage('detail-complete');
                await _this.Sleep(2000);
                window.close();
            }
        }

        _this.DetailClass = new DetailClass();
    }
}

// window.AutoStudyClassExample = new AutoStudyClass({ ratio : 0.1, min : 0, max : 5, all : [-1] });
