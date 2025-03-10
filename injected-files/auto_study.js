class AutoStudyClass {
    constructor(options = {}) {
        this.bc = null;
        this.options = options;
        this.ratio = options.ratio || 0.05;
        this.min = options.min || 0;
        this.max = options.max || 0;
        this.all = options.all || [];
        this.studyVersion = options.studyVersion;
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
        return this.constructor.toString() + `;window.AutoStudyClassExample = new AutoStudyClass({ ratio: ${this.all.includes(afootIndex) ? 1 : this.ratio}, min: ${this.min}, max: ${this.max}, studyVersion: ${this.studyVersion} });`;
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
        document.body.setAttribute('__AUTO__CLASS__TAGS__', '__AUTO__CLASS__TAGS__');
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
                if (_this.options.includeSignUp) {
                    this.listPage();
                    await _this.Sleep(1500);
                }
                this.clickAfoot();
                await _this.Sleep(1500);
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
                this.detailListIndex = -1;
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
                        setTimeout(() => {
                            this.openDetail();
                        }, 8000);
                    }
                });
            }
            /* 详情页列表 */
            detailList() {
                [].forEach.call(document.querySelectorAll('.content-container ul li a'), (element) => {
                    this.detailLinkArray.push({ url : element.getAttribute('href'), status : element.querySelector('.status').textContent });
                });
            }
            /* 打开详情页 */
            openDetail() {
                ++this.detailListIndex;

                /* 所有列表都播放完了 */
                if (this.detailListIndex >= this.detailLinkArray.length) {
                    _this.bc.postMessage('detail-list-complete');
                    setTimeout(() => {
                        window.close();
                    }, 3000);

                    return;
                }

                const newTabsURL = this.detailLinkArray[this.detailListIndex].url;
                const newTabsStatus = this.detailLinkArray[this.detailListIndex].status;

                if (newTabsStatus === '已学习') {
                    /* 已学习的跳过，继续下一个 */
                    setTimeout(() => {
                        this.openDetail();
                    }, 200);
                } else {
                    const newTabsWindow = window.open(newTabsURL, '_blank');
                    this.detailTabsWindow = newTabsWindow;
                    newTabsWindow.addEventListener('load', () => {
                        this.injectingCode();
                    });
                }
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
                this.nodeTime = 10 * 60 * 1000; // 时间节点，时长 10 分钟，单位毫秒

                this.init();
            }

            init() {
                window.onblur = () => {};
                window.onbeforeunload = () => {};

                if (_this.studyVersion === 0) {
                    this.CourseList_Iterate_Click_TopSpeed();
                } else {
                    this.CourseList_Iterate_Play__Process();
                }
            }

            /**
             * 正常流程播放版
             * 设置学习时长数据
             * 如果不是最后一个视频，则提交学习数据
             * @param {Object} options
             */
            async Process_SetStudyData(options) {
                const App_Vue = document.getElementById('app').__vue__;
                const NowDate = new Date().getTime();

                let loadTime = 5; // 加载缓冲时间（秒）
                let xxsc = options.duration / 1000 + loadTime;

                App_Vue.$children[0].studyRecord.xxkssj = NowDate - xxsc * 1000;
                App_Vue.$children[0].studyRecord.xxjssj = NowDate;
                App_Vue.$children[0].xxsc = xxsc;

                if (!options.IsLast) {
                    App_Vue.$children[0].addStudyRecord();
                }
            }

            /**
             * 正常流程播放版
             * 播放学习内容，在时间节点处设置学习时长数据
             * @param {Object} options
             */
            async Process_PlayElement(options) {
                let index = 0;

                console.log('Starting Process_PlayElement with options:', options);

                options.elementDom.querySelector('.course-title').click();
                await _this.Sleep(5000);

                {
                    const videoElement = document.querySelector('video');
                    if (videoElement) {
                        videoElement.muted = true;
                        videoElement.play();
                    }
                }

                while (index < options.planTimeNodeArray.length) {
                    await _this.Sleep(options.planTimeNodeArray[index]);

                    _this.Process_SetStudyData({ duration : options.planTimeNodeArray[index], IsLast : index === options.planTimeNodeArray.length - 1 });

                    ++index;
                }
            }

            /**
             * 正常流程播放版
             * 迭代课程列表，正常播放学习内容
             */
            async CourseList_Iterate_Play__Process() {
                const VideoList = document.querySelectorAll('.palyer-course-list > div');
                for (let index01 = 0; index01 < VideoList.length; index01++) {
                    const pDom = VideoList[index01].querySelectorAll('p');
                    let itemTime = pDom[0].innerText.trim();
                    let H = (itemTime.match(/\d*时/) || ['0时'])[0].replace('时', '');
                    let M = (itemTime.match(/\d*分/) || ['0分'])[0].replace('分', '');
                    let S = (itemTime.match(/\d*秒/) || ['0秒'])[0].replace('秒', '');
                    let totalTime = Number(H) * 60 * 60 * 1000 + (Number(M) + 1) * 60 * 1000 + Number(S) * 1000;
                    let planTime = 0;
                    let planTimeNodeArray = [];
                    let setRatio = this.ratio;
                    let randomRatio = _this.randomNumber(_this.min, _this.max) / 100;
                    let completionRatio = 0;
                    if (pDom[1]) {
                        completionRatio = parseInt(pDom[1].innerText.trim().replace('完成度：', '')) / 100;
                    }
                    let sleepTime = 3000;

                    // 完成进度小于设定进度
                    if (completionRatio < setRatio) {
                        if (setRatio < 1) {
                            planTime = (setRatio - completionRatio + randomRatio) * totalTime;
                        } else {
                            planTime = (setRatio - completionRatio) * totalTime;
                        }
                    }

                    let nodeNumber = planTime / this.nodeTime; // 时间节点数量

                    if (nodeNumber <= 1) {
                        planTimeNodeArray.push(planTime);
                    } else {
                        planTimeNodeArray = new Array(Math.floor(nodeNumber)).fill(this.nodeTime);
                        if (planTime % this.nodeTime !== 0) {
                            planTimeNodeArray.push(planTime % this.nodeTime);
                        }
                    }

                    console.log('index', index01);
                    console.log('H', H, 'M', M, 'S', S);
                    console.log('totalTime', totalTime);
                    console.log('planTime', planTime);
                    console.log('planTimeNodeArray', planTimeNodeArray);
                    console.log('setRatio', setRatio);
                    console.log('randomRatio', randomRatio);
                    console.log('completionRatio', completionRatio);
                    console.log('sleepTime', sleepTime);

                    if (planTime > 0) {
                        await this.Process_PlayElement({
                            elementDom        : VideoList[index01],
                            planTimeNodeArray : planTimeNodeArray
                        });
                    } else {
                        await _this.Sleep(sleepTime);
                        console.log('next');
                    }

                    console.log('loop-' + index01);
                }

                await _this.Sleep(5000);
                VideoList[0].querySelector('.course-title').click();

                await this.playOver();
            }

            /**
             * 极速版
             * 设置学习时长数据
             * 最后一个视频时，IsLast = true 直接提交学习数据
             * @param {Object} options
             */
            async TopSpeed_SetStudyData(options) {
                const App_Vue = document.getElementById('app').__vue__;
                const NowDate = new Date().getTime();

                let setRatio = this.ratio;
                let randomRatio = _this.randomNumber(_this.min, _this.max) / 100;
                let planRatio = setRatio + randomRatio;
                let loadTime = 5; // 加载缓冲时间（秒）
                let xxsc = App_Vue.$children[0].studyRecord.zsc * planRatio + loadTime;

                App_Vue.$children[0].studyRecord.xxkssj = NowDate - xxsc * 1000;
                App_Vue.$children[0].studyRecord.xxjssj = NowDate;
                App_Vue.$children[0].xxsc = xxsc;

                if (options.IsLast) {
                    App_Vue.$children[0].addStudyRecord();
                }
            }

            /**
             * 极速版
             * 迭代课程列表
             * 不在需要按流程播放学习内容，直接调用 TopSpeed_SetStudyData 设置学习时长数据
             */
            async CourseList_Iterate_Click_TopSpeed() {
                const VideoList = document.querySelectorAll('.palyer-course-list > div');
                for (let index01 = 0; index01 < VideoList.length; index01++) {
                    const pDom = VideoList[index01].querySelectorAll('p');
                    let setRatio = this.ratio;
                    let completionRatio = 0;
                    if (pDom[1]) {
                        completionRatio = parseInt(pDom[1].innerText.trim().replace('完成度：', '')) / 100;
                    }

                    // 完成进度小于设定进度
                    if (completionRatio < setRatio) {
                        VideoList[index01].querySelector('.course-title').click();
                        await _this.Sleep(10000);
                        await this.TopSpeed_SetStudyData({ IsLast : index01 === VideoList.length - 1 });
                    }

                    await _this.Sleep(5000);

                    console.log('loop-' + index01);
                }

                await this.playOver();
            }

            async playOver() {
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
