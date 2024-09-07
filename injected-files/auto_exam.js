class AutoExam {
    constructor(params) {
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

        this.listensRequests();
        this.startExam();
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

    /**
     * 1 监听请求
     */
    async listensRequests() {
        let _this = this;

        ah.proxy({
            //请求发起前进入
            onRequest : (config, handler) => {
                let tempCheckObject = {};
                if (config.url.indexOf('/prod-api/exam/examPaper/computeScore') > -1) {
                    tempCheckObject = _this.checkAnswer(config.url);
                    tempCheckObject.flag ? (config.url = tempCheckObject.url) : '';
                }
                handler.next(config);
            },
            //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
            onError : (err, handler) => {
                console.log('ah.onError', err);
                handler.next(err);
            },
            //请求成功后进入
            onResponse : async (response, handler) => {
                if (response.config.url.indexOf('/exam/examPaper/getExamPaper') > -1) {
                    _this.answersArray = JSON.parse(response.response)
                        .data.bzdaz.split(',')
                        .map((element) => {
                            return element.split('');
                        });
                }
                handler.next(response);
            }
        });
    }

    /**
     * 点击开始答题
     */
    async startExam() {
        try {
            document.querySelector('.exam-btn button').click();
        } catch (error) {}

        await this.Sleep(1000);

        try {
            document.querySelector('.el-dialog__wrapper .el-dialog__body .el-button').click();
        } catch (error) {}

        await this.Sleep(2000);

        this.checkQuestions();
    }

    /**
     * 检查答题 dom
     */
    async checkQuestions() {
        let _this = this;

        await this.Sleep(2000);

        let intervalID = setInterval(() => {
            let questionBody = document.querySelector('#examQuestions .question-body');

            if (questionBody) {
                _this.autoAnswer();
                clearInterval(intervalID);
            }
        }, 2000);
    }

    /**
     * 自动答题
     */
    async autoAnswer() {
        await this.Sleep(1888);
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
            await this.Sleep(400);
        }

        if (questionCurrent === questionTotal) {
            // 最后一题，答完交卷
            completeButton.click();
            await this.Sleep(1888);
            this.completeDialog();
        } else {
            // 下一题
            await this.Sleep(888);
            questionFooterButton[1].click();
            this.autoAnswer();
        }
    }

    /**
     * 交卷弹窗确认
     */
    completeDialog() {
        try {
            let dialog = document.querySelector('[role="dialog"].el-message-box__wrapper');
            dialog.querySelectorAll('.el-message-box__btns button')[1].click();
        } catch (error) {}
    }

    // 修正答案
    checkAnswer(url) {
        if (this.answersArray.length <= 0) {
            return {
                flag : false,
                url
            };
        }

        let urlTempArray = url.split('?');
        let tempSearchParamsArray = [];
        let tempSearchParamsString = decodeURIComponent(urlTempArray[1]);
        let tempSearchParamsObject = urlTempArray[1].split('&').reduce((previousValue, element, index, array) => {
            let tempArray = element.split('=');
            previousValue[tempArray[0]] = tempArray[1];
            return previousValue;
        }, {});

        let flag = false;

        this.answersArray.forEach((element, index) => {
            if (element.join('') !== tempSearchParamsObject[`answerArray[${index}]`]) {
                flag = true;

                tempSearchParamsObject[`answerArray[${index}]`] = element.join('');
            }
        });

        if (flag) {
            for (let key in tempSearchParamsObject) {
                tempSearchParamsArray.push(`${encodeURIComponent(key)}=${tempSearchParamsObject[key]}`);
            }

            tempSearchParamsString = tempSearchParamsArray.join('&');
        }

        console.log(url);
        console.log(tempSearchParamsObject);

        return {
            flag,
            url : `${urlTempArray[0]}?${tempSearchParamsString}`
        };
    }
}

// new AutoExam();
