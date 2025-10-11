class AutoFullyClass {
    constructor(params = {}) {
        this.options = params;
        this.bc = null;
        this.PageTab = ''; // 页面标签
        this.HomePageObject = { handler : () => { } }; // 提供给 ListLevelOne message 的处理函数
        this.HomePageArray = ['a[href="/myClass/fromPage"] .HomePage07', 'a[href="/myExam/fromPage"] .HomePage04'];
        this.HomePageIndex = 0;
        this.NextPageWindow = null;
        this.ChildrenExample = {
            Study : {
                ListLevelOne : null,
                ListLevelTwo : null,
                Detail       : null
            },
            Exam : {
                ListLevelOne : null,
                Detail       : null
            }
        };

        this.Init();
    }

    async Init() {
        this.AddTags();
        this.TabsMessage();
        this.MessageEvent();

        this.Guide();
    }

    Sleep(time = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }

    // 生成随机数，范围 min - max
    RandomNumber(min, max) {
        return Math.floor(Math.random() * (max + 1 - min) + min);
    }

    TabsMessage() {
        this.bc = new BroadcastChannel('auto-fully');
    }

    // 标签页通讯
    MessageEvent() {
        const _this_0_ = this;

        _this_0_.bc.addEventListener('message', (event) => {
            console.log(_this_0_.PageTab, event.data);
        });
    }

    // Class 代码字符串
    ClassToCodeString() {
        return this.constructor.toString();
    }

    // NewClass 代码字符串
    NewClassToCodeString() {
        return `;window.AutoStudyClassExample = new AutoFullyClass(${JSON.stringify(this.options)});`;
    }

    // 注入代码
    InjectingCode() {
        const _this_0_ = this;

        // Class 代码字符串
        const ScriptElement_Class = _this_0_.NextPageWindow.document.createElement('script');
        ScriptElement_Class.appendChild(document.createTextNode(_this_0_.ClassToCodeString()));
        _this_0_.NextPageWindow.document.body.appendChild(ScriptElement_Class);

        const ScriptElement_Example = _this_0_.NextPageWindow.document.createElement('script');
        ScriptElement_Example.appendChild(document.createTextNode(_this_0_.NewClassToCodeString()));
        _this_0_.NextPageWindow.document.body.appendChild(ScriptElement_Example);
    }

    AddTags() {
        document.body.setAttribute('__AUTO__FULLY__TAGS__', '__AUTO__FULLY__TAGS__');
    }

    Guide() {
        const pathname = location.pathname.toLowerCase();
        const routeMap = {
            '/homepage'             : { tab : 'HomePage', title : '首页', handler : 'HomePage' },
            '/myclass/frompage'     : { tab : 'StudyListLevelOne', title : '学习一级列表页', handler : 'StudyExample' },
            '/mytrainingcourselist' : { tab : 'StudyListLevelTwo', title : '学习二级列表页', handler : 'StudyExample' },
            '/home/coursedetail'    : { tab : 'StudyDetail', title : '学习详情页', handler : 'StudyExample' },
            '/myexam/frompage'      : { tab : 'ExamListLevelOne', title : '考试一级列表页', handler : 'ExamExample' },
            '/exam/examdetail'      : { tab : 'ExamDetail', title : '考试详情页', handler : 'ExamExample' }
        };

        for (const [path, config] of Object.entries(routeMap)) {
            if (pathname.startsWith(path)) {
                this.PageTab = config.tab;
                this[config.handler]();
                break;
            }
        }
    }

    async HomePage() {
        const _this_0_ = this;

        _this_0_.HomePageObject.handler = async () => {
            await _this_0_.Sleep(2000);

            document.querySelector('.is-link').click();

            if (_this_0_.HomePageIndex < _this_0_.HomePageArray.length - 1) {
                ++_this_0_.HomePageIndex;
                _this_0_.HomePage();
            } else {
                document.body.style.backgroundColor = 'lightyellow';
            }
        };

        await _this_0_.Sleep(3000);
        document.querySelector(this.HomePageArray[this.HomePageIndex]).click();
        await _this_0_.Sleep(3000);
        this.Guide();
    }

    async StudyExample() {
        const _this_0_ = this;

        class Class_StudyListLevelOne {
            constructor() {
                this.ListLevelTwoArray = []; // 学习一级列表 ID
                this.ListLevelTwoIndex = 0;

                this.MessageEvent();
                this.Init();
            }

            // 标签页通讯
            MessageEvent() {
                const _this_1_ = this;

                _this_0_.bc.addEventListener('message', (event) => {
                    if (event.data === 'study-list-level-two-complete') {
                        // 继续播放下一个
                        ++_this_1_.ListLevelTwoIndex;

                        if (_this_1_.ListLevelTwoIndex < _this_1_.ListLevelTwoArray.length) {
                            _this_1_.OpenListLevelTwo();
                        } else {
                            // 所有学习一级列表都播放完了
                            _this_0_.HomePageObject.handler();
                        }
                    }
                });
            }

            // 同步环境
            async Init() {
                await _this_0_.Sleep(3000);
                this.GetListLevelTwo(); // 获取报名中
                this.ClickAfoot(); // 切换到进行中
                await _this_0_.Sleep(3000);
                this.GetListLevelTwo(); // 获取进行中
                this.OpenListLevelTwo();
            }

            // 切换到进行中
            ClickAfoot() {
                document.querySelectorAll('.jss1343 p')[1].click();
            }

            // 学习一级列表 报名中 or 进行中
            GetListLevelTwo() {
                [].forEach.call(document.querySelectorAll('.MuiList-root .myTrainingClass-list-head a'), (element) => {
                    this.ListLevelTwoArray.push(element.getAttribute('href').split('/')[2]);
                });
            }

            // 打开 学习二级列表
            OpenListLevelTwo() {
                const _this_1_ = this;

                if (_this_1_.ListLevelTwoArray.length <= 0) {
                    return (document.body.style.backgroundColor = 'yellowgreen');
                }

                const NewTabsWindow = window.open('/myTrainingCourseList/' + _this_1_.ListLevelTwoArray[_this_1_.ListLevelTwoIndex], '_blank');
                _this_0_.NextPageWindow = NewTabsWindow;
                NewTabsWindow.addEventListener('load', () => {
                    _this_0_.InjectingCode();
                });
            }
        }

        class Class_StudyListLevelTwo {
            constructor() {
                this.DetailArray = [];
                this.DetailIndex = 0;

                this.Init();
            }

            async Init() {
                await _this_0_.Sleep(5000);
                this.MessageEvent();
                this.GetDetailList();
                this.OpenDetail();
            }

            /* 标签页通讯 */
            MessageEvent() {
                const _this_2_ = this;

                _this_0_.bc.addEventListener('message', (event) => {
                    if (event.data === 'detail-complete') {
                        setTimeout(() => {
                            ++_this_2_.DetailIndex;
                            _this_2_.OpenDetail();
                        }, 2000);
                    }
                });
            }

            /* 详情页列表 */
            GetDetailList() {
                [].forEach.call(document.querySelectorAll('.content-container ul li a'), (element) => {
                    this.DetailArray.push({ url : element.getAttribute('href'), status : element.querySelector('.status').textContent });
                });
            }

            /* 打开详情页 */
            async OpenDetail() {
                /* 所有列表都播放完了 */
                if (this.DetailIndex >= this.DetailArray.length) {
                    _this_0_.bc.postMessage('study-list-level-two-complete');
                    await _this_0_.Sleep(200);
                    window.close();

                    return;
                }

                const NewTabsURL = this.DetailArray[this.DetailIndex].url;
                const NewTabsStatus = this.DetailArray[this.DetailIndex].status;

                if (NewTabsStatus === '已学习') {
                    /* 已学习的跳过，继续下一个 */
                    await _this_0_.Sleep(1000);
                    ++this.DetailIndex;
                    this.OpenDetail();
                } else {
                    const NewTabsWindow = window.open(NewTabsURL, '_blank');
                    _this_0_.NextPageWindow = NewTabsWindow;
                    NewTabsWindow.addEventListener('load', () => {
                        _this_0_.InjectingCode();
                    });
                }
            }
        }

        class Class_StudyDetail {
            constructor() {
                this.Init();
            }

            async Init() {
                window.onblur = () => {};
                window.onbeforeunload = () => {};
                await _this_0_.Sleep(5000);
                this.CourseList_Iterate_Click_TopSpeed();
            }

            /**
             * 极速版
             * 设置学习时长数据
             * 最后一个视频时，IsLast = true 直接提交学习数据
             * @param {Object} options
             * @param {Boolean} options.IsLast - 是否是最后一个视频
             */
            async TopSpeed_SetStudyData(options) {
                const App_Vue = document.getElementById('app').__vue__;
                const NowDate = new Date().getTime();

                let randomRatio = _this_0_.RandomNumber(1, 5) / 100;
                let planRatio = 1 + randomRatio;
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
                    let setRatio = 1;
                    let completionRatio = 0;
                    if (pDom[1]) {
                        completionRatio = parseInt(pDom[1].innerText.trim().replace('完成度：', '')) / 100;
                    }

                    // 完成进度小于设定进度
                    if (completionRatio < setRatio) {
                        VideoList[index01].querySelector('.course-title').click();
                        await _this_0_.Sleep(10000);
                        await this.TopSpeed_SetStudyData({ IsLast : index01 === VideoList.length - 1 });
                    }

                    await _this_0_.Sleep(5000);

                    console.log('loop-' + index01);
                }

                await this.PlayOver();
            }

            async PlayOver() {
                console.log('playOver');
                await _this_0_.Sleep(5000);
                _this_0_.bc.postMessage('detail-complete');
                await _this_0_.Sleep(2000);
                window.close();
            }
        }

        if (_this_0_.PageTab === 'StudyListLevelOne') {
            _this_0_.ChildrenExample.Study.ListLevelOne = new Class_StudyListLevelOne();
        } else if (_this_0_.PageTab === 'StudyListLevelTwo') {
            _this_0_.ChildrenExample.Study.ListLevelTwo = new Class_StudyListLevelTwo();
        } else if (_this_0_.PageTab === 'StudyDetail') {
            _this_0_.ChildrenExample.Study.Detail = new Class_StudyDetail();
        }
    }

    async ExamExample() {
        const _this_0_ = this;

        class Class_ExamListLevelOne {
            constructor() {
                this.ExamArray = []; // 考试列表
                this.ExamIndex = 0;

                this.Init();
            }

            async Init() {
                await _this_0_.Sleep(5000);
                this.MessageEvent();
                this.GetExamList();
                this.OpenExam();
            }

            /* 标签页通讯 */
            MessageEvent() {
                const _this_1_ = this;

                _this_0_.bc.addEventListener('message', (event) => {
                    if (event.data === 'exam-complete') {
                        setTimeout(() => {
                            ++_this_1_.ExamIndex;
                            _this_1_.OpenExam();
                        }, 2000);
                    }
                });
            }

            /* 考试列表 */
            GetExamList() {
                [].forEach.call(document.querySelectorAll('#app .el-row ul.MuiList-root li.MuiListItem-root a'), (element) => {
                    this.ExamArray.push({ url : element.getAttribute('href'), status : element.querySelector('.status-1')?.textContent });
                });
            }

            /* 打开考试页 */
            async OpenExam() {
                /* 所有的考试都已完成 */
                if (this.ExamIndex >= this.ExamArray.length) {
                    _this_0_.HomePageObject.handler();
                    await _this_0_.Sleep(200);
                    window.close();

                    return;
                }

                const NewTabsURL = this.ExamArray[this.ExamIndex].url;
                const NewTabsStatus = this.ExamArray[this.ExamIndex].status;

                if (NewTabsStatus === '已完成') {
                    /* 已考试的跳过，继续下一个 */
                    await _this_0_.Sleep(1000);
                    ++this.ExamIndex;
                    this.OpenExam();
                } else {
                    const NewTabsWindow = window.open(NewTabsURL, '_blank');
                    _this_0_.NextPageWindow = NewTabsWindow;
                    NewTabsWindow.addEventListener('load', () => {
                        _this_0_.InjectingCode();
                    });
                }
            }
        }

        class Class_ExamDetail {
            constructor() {
                this.optionsMapTable = {
                    A : 0,
                    B : 1,
                    C : 2,
                    D : 3,
                    E : 4,
                    F : 5,
                    G : 6,
                    H : 7,
                    I : 8,
                    J : 9
                };
                this.answersArray = window.__AUTO_EXAM_ANSWERS_ARRAY__ || [];
                this.examScores = _this_0_.RandomNumber(0, 3);

                this.Init();
            }

            async Init() {
                await _this_0_.Sleep(5000);
                this.StartExam();
            }

            /**
             * 点击开始答题
             */
            async StartExam() {
                try {
                    [].forEach.call(document.querySelectorAll('.exam-btn button'), (element) => {
                        if (_this_0_.options.buttonText === '模拟考试') {
                            if (_this_0_.options.buttonText === element.textContent) {
                                element.click();
                            }
                        } else {
                            if (element.textContent === '开始考试' || element.textContent === '再考一次') {
                                element.click();
                            }
                        }
                    });
                } catch (error) {}

                await _this_0_.Sleep(8000);

                try {
                    document.querySelector('.el-dialog__wrapper .el-dialog__body .el-button').click();
                } catch (error) {}

                await _this_0_.Sleep(2000);

                this.CheckQuestions();
            }

            /**
             * 获取答案数据
             */
            GetAnswers() {
                const _this_3_ = this;
                const App_Vue = document.getElementById('app').__vue__;
                _this_3_.answersArray = App_Vue.$children[0].examPaperInfo.bzdaz.split(',').map((element) => {
                    return element.split(' ').join('').split('');
                });

                // 根据选项改数据（全对或者错题）
                const answersArrayLength = _this_3_.answersArray.length;
                const examScores = _this_3_.examScores;
                const tempIndexArray = new Array(answersArrayLength).fill().map((_, index) => index);
                const WrongAnswerIndexArray = [];
                let switchIndex = examScores >= 5 ? _this_0_.RandomNumber(0, 4) : examScores;

                while (switchIndex > 0) {
                    --switchIndex;
                    tempIndexArray.sort(() => Math.random() - 0.5);
                    WrongAnswerIndexArray.push(tempIndexArray.splice(0, 1)[0]);
                }

                WrongAnswerIndexArray.forEach((element) => {
                    let tempAnswers = _this_3_.answersArray[element];
                    let tempAnswer = void 0;

                    if (tempAnswers.length === 1) {
                        tempAnswer = tempAnswers[0];

                        switch (tempAnswer) {
                            case 'A':
                                _this_3_.answersArray[element][0] = 'B';
                                break;

                            case 'B':
                                _this_3_.answersArray[element][0] = 'A';
                                break;

                            default:
                                _this_3_.answersArray[element][0] = 'ABCD'
                                    .replace(tempAnswer, '')
                                    .split('')
                                    .sort(() => Math.random() - 0.5)[0];
                                break;
                        }
                    } else if (tempAnswers.length > 1) {
                        _this_3_.answersArray[element].sort(() => Math.random() - 0.5).splice(0, 1);
                        _this_3_.answersArray[element].sort();
                    }
                });
            }

            /**
             * 提交前检测答案数据
             */
            CheckAnswers() {
                const _this_3_ = this;
                const App_Vue = document.getElementById('app').__vue__;
                const selectAnswerArray = App_Vue.$children[0].questionStudentAnswerDataList;

                selectAnswerArray.forEach((element, index) => {
                    let elementString = element instanceof Array ? element.sort().join() : element;
                    let targetString = _this_3_.answersArray.sort().join();

                    if (elementString !== targetString) {
                        element = targetString.length > 1 ? targetString.split('') : targetString;
                    }
                });
            }

            /**
             * 检查答题 dom
             */
            async CheckQuestions() {
                let _this_3_ = this;

                await _this_0_.Sleep(2000);

                let intervalID = setInterval(() => {
                    let questionBody = document.querySelector('#examQuestions .question-body');

                    if (questionBody) {
                        _this_3_.GetAnswers();
                        _this_3_.AutoAnswer();
                        clearInterval(intervalID);
                    }
                }, 200);
            }

            /**
             * 自动答题
             */
            async AutoAnswer() {
                await _this_0_.Sleep(500);
                let examQuestions = document.getElementById('examQuestions');
                let questionTotal = Number(examQuestions.querySelector('.exam-ctrl .question').textContent); // 题目总数
                let questionCurrent = Number(examQuestions.querySelector('.exam-ctrl .current-question').textContent); // 当前题目序号
                let completeButton = examQuestions.querySelector('.exam-ctrl button'); // 交卷按钮
                let questionBody = examQuestions.querySelector('.question-body');
                let questionAnswerOptions = questionBody.querySelectorAll('ul.answers li.normal'); // 选择选项
                let questionCurrentAnswerarray = this.answersArray[questionCurrent - 1]; // 当前题目答案数组
                let questionFooterButton = examQuestions.querySelectorAll('.question-footer .el-button'); // 上一题、下一题 button

                for (let index = 0; index < questionCurrentAnswerarray.length; index++) {
                    let element = questionCurrentAnswerarray[index];
                    questionAnswerOptions[this.optionsMapTable[element]].querySelector('.answer-content').click();
                    await _this_0_.Sleep(200);
                }

                if (questionCurrent === questionTotal) {
                    // 最后一题，答完交卷
                    completeButton.click();
                    await _this_0_.Sleep(1888);
                    this.CompleteDialog();
                } else {
                    // 下一题
                    questionFooterButton[1].click();
                    this.AutoAnswer();
                }
            }

            /**
             * 交卷弹窗确认
             */
            async CompleteDialog() {
                try {
                    this.CheckAnswers();
                    await _this_0_.Sleep(400);
                    let dialog = document.querySelector('[role="dialog"].el-message-box__wrapper');
                    dialog.querySelectorAll('.el-message-box__btns button')[1].click();

                    this.CheckExamEnd();
                } catch (error) {}
            }

            /**
             * 检查考试是否结束
             */
            async CheckExamEnd() {
                await _this_0_.Sleep(5000);

                if (document.querySelector('#examResult .exam-result-info').textContent.includes('恭喜您成功通过考试')) {
                    _this_0_.bc.postMessage('exam-complete');
                    await _this_0_.Sleep(200);
                    window.close();
                }
            }
        }

        if (_this_0_.PageTab === 'ExamListLevelOne') {
            _this_0_.ChildrenExample.Exam.ListLevelOne = new Class_ExamListLevelOne();
        } else if (_this_0_.PageTab === 'ExamDetail') {
            _this_0_.ChildrenExample.Exam.Detail = new Class_ExamDetail();
        }
    }
}
