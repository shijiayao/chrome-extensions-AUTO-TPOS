async function AUTO_TPOS_VIOLATION_STATISTICS() {
    function Sleep(time = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }

    let ExampleObject = {
        DB_Example        : null,
        TableTotalData    : null,
        MonthlyKeyList    : null,
        MonthlyKeyFlag    : null,
        TableTotalData_DB : null,
        CustomizeTempData : null,
        TotalPersonnel    : null
    };

    class indexedDB_Class {
        constructor({ DB_Name = 'TicketDatabase', DB_ObjectStore_NameList = [] } = {}) {
            this.DB_Name = DB_Name; // 数据库名称
            this.DB_Version = void 0; // 数据库版本
            this.DBOpenRequest = null; // 打开的数据库请求
            this.DB_Result = null; // 打开的数据库结果
            this.DB_ObjectStore_NameList = DB_ObjectStore_NameList; // 数据库中的对象存储区名称列表
            this.DB_ObjectStore_Object = {}; // 对象存储区对象
            this.Open_DB = this.Open_DB.bind(this);
            this.Upgrade_DB = this.Upgrade_DB.bind(this);
            this.ObjectStore_Add = this.ObjectStore_Add.bind(this);

            this.DB_Database_PromiseAllArray = [this.Open_DB, this.Upgrade_DB];
        }

        async init() {
            for (let index = 0; index < this.DB_Database_PromiseAllArray.length; index++) {
                await this.DB_Database_PromiseAllArray[index]();
            }
        }

        /**
         * 打开数据库
         * @param {Object} param
         * @returns Promise
         */
        Open_DB({ DB_Version = this.DB_Version, DB_ObjectStore_NameList = this.DB_ObjectStore_NameList } = {}) {
            console.log('Open_DB', DB_Version, DB_ObjectStore_NameList);

            return new Promise((resolve, reject) => {
                const _this = this;

                let upgradeneededFlag = false; // 是否会触发 onupgradeneeded 事件
                let upgradeneededPromiseResolve = () => {};

                _this.DBOpenRequest = indexedDB.open(_this.DB_Name, DB_Version);

                _this.DBOpenRequest.onerror = (event) => {
                    console.log('连接数据库错误', event);

                    reject(event);
                };

                const upgradeneededPromise = new Promise((resolve_02, reject_02) => {
                    upgradeneededPromiseResolve = resolve_02;

                    _this.DBOpenRequest.onupgradeneeded = async (event) => {
                        console.log('当试图打开一个尚未被创建的数据库，或者试图连接一个数据库还没被创立的版本时，onupgradeneeded 事件会被触发', event);

                        upgradeneededFlag = true; // onupgradeneeded 事件被触发

                        const db = event.target.result;
                        const CreateObjectStoreArray = [];

                        DB_ObjectStore_NameList.forEach((ObjectStoreName) => {
                            const objectStore = db.createObjectStore(ObjectStoreName, { keyPath : 'DocumentNumber' });
                            // const objectStore = db.createObjectStore(ObjectStoreName, { autoIncrement : true }); // 自动生成键

                            // 创建一个索引以通过姓名来搜索客户。名字可能会重复，所以我们不能使用 unique 索引。
                            // objectStore.createIndex("name", "name", { unique: false });

                            // 使用邮箱建立索引，我们想确保客户的邮箱不会重复，所以我们使用 unique 索引。
                            // objectStore.createIndex("email", "email", { unique: true });

                            CreateObjectStoreArray.push(objectStore);
                        });

                        // 使用事务的 oncomplete 事件确保在插入数据前对象存储已经创建完毕。
                        // createObjectStore 不论创建多少个存储区都属于一个事务，因此只触发一次事件
                        CreateObjectStoreArray[CreateObjectStoreArray.length - 1].transaction.oncomplete = (event) => {
                            resolve_02(event);
                        };
                    };
                });

                _this.DBOpenRequest.onsuccess = async (event) => {
                    console.log('连接数据库成功', event);

                    _this.DB_Result = event.target.result;
                    _this.DB_Version = event.target.result.version;

                    if (upgradeneededFlag) {
                        await upgradeneededPromise;
                    } else {
                        upgradeneededPromiseResolve();
                    }

                    resolve(event);
                };
            });
        }

        /**
         * 升级数据库版本
         * @returns Promise
         */
        Upgrade_DB() {
            console.log('Upgrade_DB');

            const _this = this;

            const Existing_NameList = [];
            const NotExisting_NameList = [];

            _this.DB_Version += 1;

            _this.DB_ObjectStore_NameList.forEach((ObjectStoreName) => {
                if ([].some.call(_this.DB_Result.objectStoreNames, (item) => item === ObjectStoreName)) {
                    Existing_NameList.push(ObjectStoreName);
                } else {
                    NotExisting_NameList.push(ObjectStoreName);
                }
            });

            return new Promise(async (resolve, reject) => {
                if (NotExisting_NameList.length > 0) {
                    _this.DB_Result.close();
                    await _this
                        .Open_DB({
                            DB_Version              : _this.DB_Version,
                            DB_ObjectStore_NameList : NotExisting_NameList
                        })
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve();
                }
            });
        }

        /**
         * 获取对象存储区数据
         * @param {String} ObjectStoreName
         * @returns
         */
        async ObjectStore_Get(ObjectStoreName) {
            console.log('ObjectStore_Get', ObjectStoreName);
            return new Promise((resolve, reject) => {
                const _this = this;

                const transaction = _this.DB_Result.transaction(ObjectStoreName, 'readonly');
                const objectStore = transaction.objectStore(ObjectStoreName);

                const request = objectStore.getAll();

                request.onsuccess = (event) => {
                    resolve(event);
                };
            });
        }

        /**
         * 添加数据到对象存储区
         * @param {String} ObjectStoreName
         * @param {Array} data
         */
        async ObjectStore_Add(ObjectStoreName, data = []) {
            console.log('ObjectStore_Add', ObjectStoreName, data);
            const _this = this;

            const AddPriomiseAllArray = [];

            const transaction = _this.DB_Result.transaction(ObjectStoreName, 'readwrite');
            const objectStore = transaction.objectStore(ObjectStoreName);

            objectStore.clear();

            transaction.oncomplete = (event) => {
                console.log('Transaction completed.' + ObjectStoreName);
            };

            data.forEach((customer) => {
                AddPriomiseAllArray.push(
                    new Promise((resolve, reject) => {
                        const request = objectStore.add(customer);
                        request.onsuccess = (event) => {
                            // console.log('success', event);
                            resolve(event);
                        };
                        request.onerror = (event) => {
                            // 错误处理
                            console.log('error', event);
                            reject(event);
                        };
                    })
                );
            });

            return Promise.all(AddPriomiseAllArray);
        }
    }

    async function STATISTICS_MONTHLY() {
        const TableTotalData = [].reduce.call(
            document.querySelectorAll('.list tr.out'),
            (Total, element, index) => {
                const RowCells = element.querySelectorAll('td');
                const DocumentNumber = RowCells[1].textContent; // 文书编号
                const LicensePlate = RowCells[2].textContent; // 号牌号码
                const OccurrenceTime = RowCells[3].textContent; // 违法时间
                const TrafficViolationsCode = RowCells[4].textContent; // 违法行为 违法代码
                const Litigant = RowCells[5].textContent; // 当事人
                const PoliceName = RowCells[7].textContent; // 执勤民警

                const TimeSplitArray = OccurrenceTime.split(/-|:| /);
                const MonthlyKey = `${TimeSplitArray[0]}年${TimeSplitArray[1]}月`;
                const MonthlyTotal = Total[MonthlyKey] || []; // 年份月份

                MonthlyTotal.push({
                    DocumentNumber,
                    LicensePlate,
                    OccurrenceTime,
                    TrafficViolationsCode,
                    Litigant,
                    PoliceName
                });

                Total[MonthlyKey] = MonthlyTotal;

                return Total;
            },
            {}
        );

        const MonthlyKeyList = Object.keys(TableTotalData);
        const MonthlyKeyFlag = MonthlyKeyList.reduce((result, element, index) => {
            result[element] = false;
            return result;
        }, {});
        const TableTotalData_DB = {};
        const TotalPersonnel = {};

        if (MonthlyKeyList.length === 0) {
            return;
        }

        const DB_Example = new indexedDB_Class({
            DB_Name                 : 'TicketDatabase',
            DB_ObjectStore_NameList : MonthlyKeyList
        });

        await DB_Example.init();

        for (let index = 0; index < MonthlyKeyList.length; index++) {
            const Key = MonthlyKeyList[index];
            await DB_Example.ObjectStore_Get(Key).then((event) => {
                TableTotalData_DB[Key] = event.target.result || [];
            });
        }

        for (let index = 0; index < MonthlyKeyList.length; index++) {
            const Key = MonthlyKeyList[index];
            TableTotalData[Key].forEach((element01, index01) => {
                if (!TableTotalData_DB[Key].some((element02, index02) => element01.DocumentNumber === element02.DocumentNumber)) {
                    TableTotalData_DB[Key].push(element01);
                    MonthlyKeyFlag[Key] = true;
                }
            });
        }

        for (const key in MonthlyKeyFlag) {
            if (MonthlyKeyFlag[key]) {
                await DB_Example.ObjectStore_Add(key, TableTotalData_DB[key]).then((event) => {
                    console.log(event);
                });
            }
        }

        for (const key in TableTotalData_DB) {
            TotalPersonnel[key] = TableTotalData_DB[key].reduce((Total, element, index) => {
                const DocumentNumber = element.DocumentNumber; // 文书编号
                const LicensePlate = element.LicensePlate; // 号牌号码
                const OccurrenceTime = element.OccurrenceTime; // 违法时间
                const TrafficViolationsCode = element.TrafficViolationsCode; // 违法行为 违法代码
                const Litigant = element.Litigant; // 当事人
                const PoliceName = element.PoliceName; // 执勤民警

                const PersonnelTotal = Total[PoliceName] || {
                    DetailArray : [],
                    IDObject    : {}
                };

                if (!PersonnelTotal.DetailArray.some((element02) => DocumentNumber === element02.DocumentNumber)) {
                    PersonnelTotal.DetailArray.push({
                        DocumentNumber,
                        LicensePlate,
                        OccurrenceTime,
                        TrafficViolationsCode,
                        Litigant,
                        PoliceName
                    });
                    PersonnelTotal.IDObject[TrafficViolationsCode] ? PersonnelTotal.IDObject[TrafficViolationsCode]++ : (PersonnelTotal.IDObject[TrafficViolationsCode] = 1);
                }

                Total[PoliceName] = PersonnelTotal;

                return Total;
            }, {});
        }

        ExampleObject = {
            DB_Example,
            TableTotalData,
            MonthlyKeyList,
            MonthlyKeyFlag,
            TableTotalData_DB,
            TotalPersonnel
        };

        console.log(ExampleObject);
    }

    async function STATISTICS_CUSTOMIZE() {
        const TableTotalData = [].reduce.call(
            document.querySelectorAll('.list tr.out'),
            (Total, element, index) => {
                const RowCells = element.querySelectorAll('td');
                const DocumentNumber = RowCells[1].textContent; // 文书编号
                const LicensePlate = RowCells[2].textContent; // 号牌号码
                const OccurrenceTime = RowCells[3].textContent; // 违法时间
                const TrafficViolationsCode = RowCells[4].textContent; // 违法行为 违法代码
                const Litigant = RowCells[5].textContent; // 当事人
                const PoliceName = RowCells[7].textContent; // 执勤民警

                const TimeSplitArray = OccurrenceTime.split(/-|:| /);
                const MonthlyKey = `${TimeSplitArray[0]}年${TimeSplitArray[1]}月`;
                const MonthlyTotal = Total[MonthlyKey] || []; // 年份月份

                MonthlyTotal.push({
                    DocumentNumber,
                    LicensePlate,
                    OccurrenceTime,
                    TrafficViolationsCode,
                    Litigant,
                    PoliceName
                });

                Total[MonthlyKey] = MonthlyTotal;

                return Total;
            },
            {}
        );

        const MonthlyKeyList = Object.keys(TableTotalData);
        const CustomizeTempData = JSON.parse(sessionStorage.getItem('CUSTOMIZE_TEMP_DATA') || '{}');
        const TotalPersonnel = {};

        if (MonthlyKeyList.length === 0) {
            return;
        }

        for (let index = 0; index < MonthlyKeyList.length; index++) {
            const Key = MonthlyKeyList[index];
            if (!CustomizeTempData[Key]) {
                CustomizeTempData[Key] = [];
            }

            TableTotalData[Key].forEach((element01, index01) => {
                if (!CustomizeTempData[Key].some((element02, index02) => element01.DocumentNumber === element02.DocumentNumber)) {
                    CustomizeTempData[Key].push(element01);
                }
            });
        }

        for (const key in CustomizeTempData) {
            TotalPersonnel[key] = CustomizeTempData[key].reduce((Total, element, index) => {
                const DocumentNumber = element.DocumentNumber; // 文书编号
                const LicensePlate = element.LicensePlate; // 号牌号码
                const OccurrenceTime = element.OccurrenceTime; // 违法时间
                const TrafficViolationsCode = element.TrafficViolationsCode; // 违法行为 违法代码
                const Litigant = element.Litigant; // 当事人
                const PoliceName = element.PoliceName; // 执勤民警

                const PersonnelTotal = Total[PoliceName] || {
                    DetailArray : [],
                    IDObject    : {}
                };

                if (!PersonnelTotal.DetailArray.some((element02) => DocumentNumber === element02.DocumentNumber)) {
                    PersonnelTotal.DetailArray.push({
                        DocumentNumber,
                        LicensePlate,
                        OccurrenceTime,
                        TrafficViolationsCode,
                        Litigant,
                        PoliceName
                    });
                    PersonnelTotal.IDObject[TrafficViolationsCode] ? PersonnelTotal.IDObject[TrafficViolationsCode]++ : (PersonnelTotal.IDObject[TrafficViolationsCode] = 1);
                }

                Total[PoliceName] = PersonnelTotal;

                return Total;
            }, {});
        }

        ExampleObject = {
            TableTotalData,
            MonthlyKeyList,
            CustomizeTempData,
            TotalPersonnel
        };

        sessionStorage.setItem('CUSTOMIZE_TEMP_DATA', JSON.stringify(CustomizeTempData));

        console.log(ExampleObject);
    }

    /**
     * 动态创建违法统计数据表格并展现到页面上
     * @param {Object} dataList
     */
    async function openViolationStatisticsDataHtml(dataList) {
        const NightTotal = [
            [12, 0, 15, 0],
            [18, 0, 8, 0]
        ]; // 夜间

        const dialogContainerDom = document.createElement('div');
        dialogContainerDom.id = 'dialog-container';

        let domStringFirst = [];
        let domStringMiddle = [];
        let domStringLast = [];

        domStringFirst.push(`<div class="dialog-main">`);
        domStringFirst.push(`<div class="dialog-close"></div>`);
        domStringFirst.push(`<div class="dialog-content">`);

        domStringMiddle.push(`<div class="dialog-night-box">`);
        domStringMiddle.push(`<div class="float-left"><button id="dialog-night-button">夜间设置</button></div>`);
        domStringMiddle.push(`<div class="overflow-hidden-right">`);
        NightTotal.map((item, index) => {
            domStringMiddle.push(`<p class="time-item">${item[0].toString().padStart(2, '0')}:${item[1].toString().padStart(2, '0')} - ${item[2].toString().padStart(2, '0')}:${item[3].toString().padStart(2, '0')}</p>`);
        });
        domStringMiddle.push(`</div>`);
        domStringMiddle.push(`</div>`);

        domStringLast.push(`</div>`);
        domStringLast.push(`<div class="dialog-night-popup">`);
        domStringLast.push(`<div class="dialog-night-set-time">`);
        NightTotal.map((item, index) => {
            domStringLast.push(`<p class="time-row">`);
            domStringLast.push(`<input type="time" value="${item[0].toString().padStart(2, '0')}:${item[1].toString().padStart(2, '0')}">`);
            domStringLast.push(`<span> - </span>`);
            domStringLast.push(`<input type="time" value="${item[2].toString().padStart(2, '0')}:${item[3].toString().padStart(2, '0')}">`);
            domStringLast.push(`<span class="span-button delete-time-row"></span>`);
            domStringLast.push(`</p>`);
        });
        domStringLast.push(`<p class="time-row"><span class="span-button add-time-row"></span></p>`);
        domStringLast.push(`<p class="dialog-night-button"><button id="cancel">取消</button><button id="sure">确定</button></p>`);
        domStringLast.push(`</div>`);
        domStringLast.push(`</div>`);
        domStringLast.push(`</div>`);

        // 遍历数据并创建表格行，人员的月份详细数据
        Object.entries(dataList).forEach(([month, personnelData]) => {
            Object.entries(personnelData).forEach(([policeName, data]) => {
                domStringMiddle.push(`<ul class="dialog-content-list staff-list">`);
                domStringMiddle.push(`<li class="dialog-content-list-item">${month}</li>`);
                domStringMiddle.push(`<li class="dialog-content-list-item">${policeName}</li>`);
                domStringMiddle.push(`<li class="dialog-content-list-item"><label><input type="checkbox" name="total-label" value="${policeName}" checked></label></li>`);
                Object.entries(data.IDObject).map(([code, count]) => {
                    domStringMiddle.push(`<li class="dialog-content-list-item">${code} X ${count}</li>`);
                });
                domStringMiddle.push(`</ul>`);
            });
        });

        dialogContainerDom.innerHTML = [domStringFirst.join(''), domStringMiddle.join(''), domStringLast.join('')].join('');

        // 将表格添加到页面
        document.body.appendChild(dialogContainerDom);

        /**
         * 重新生成总数据
         */
        function RegenerateTotalData() {
            const EventTotal = {};
            const DomStringObject = { domNight : [], domTotal : [] };

            const Key_SelectStaffTotal = 'select_staff_total';
            const Key_Night = '夜间';

            // 计算夜间数量
            Object.entries(dataList).forEach(([month, personnelData]) => {
                EventTotal[month] = {};
                EventTotal[month][Key_SelectStaffTotal] = {}; // 被选中的人员合计总数

                Object.entries(personnelData).forEach(([policeName, data]) => {
                    EventTotal[month][policeName] = EventTotal[month][policeName] ? EventTotal[month][policeName] : { 夜间 : 0 };

                    data.DetailArray.forEach((item) => {
                        const TimeSplitArray = item.OccurrenceTime.split(/-|:| /);
                        const timeHour = Number(TimeSplitArray[3]);
                        const timeMinute = Number(TimeSplitArray[4]);
                        const occurTime = Number(''.concat(timeHour.toString().padStart(2, '0'), timeMinute.toString().padStart(2, '0')));

                        if (
                            NightTotal.some((timeRange) => {
                                const startTime = Number(''.concat(timeRange[0].toString().padStart(2, '0'), timeRange[1].toString().padStart(2, '0')));
                                const endTime = Number(''.concat(timeRange[2].toString().padStart(2, '0'), timeRange[3].toString().padStart(2, '0')));
                                /**
                                 * 第一种情况：时间区间在当日内；（起始时间为 12:00，结束时间为 15:00）
                                 * 第二种情况：时间区间跨日；（起始时间为 20:00，结束时间为 08:00）
                                 * 判断发生时间所在的时间区间
                                 */
                                return startTime < endTime ? occurTime >= startTime && occurTime < endTime : !(occurTime >= endTime && occurTime < startTime);
                            })
                        ) {
                            EventTotal[month][policeName][Key_Night]++;
                        }
                    });
                });
            });

            // 合计被选中的人员总数
            [].forEach.call(document.querySelectorAll('#dialog-container ul.staff-list'), (e01, i01) => {
                const ItemDom = e01.querySelectorAll('.dialog-content-list-item');
                if (ItemDom[2].querySelector('input').checked) {
                    const month = ItemDom[0].textContent;
                    const policeName = ItemDom[1].textContent;

                    Object.entries(dataList[month][policeName].IDObject).map(([code, count]) => {
                        EventTotal[month][policeName][code] = EventTotal[month][policeName][code] ? EventTotal[month][policeName][code] + count : count;
                        EventTotal[month][Key_SelectStaffTotal][code] = EventTotal[month][Key_SelectStaffTotal][code] ? EventTotal[month][Key_SelectStaffTotal][code] + count : count;
                    });

                    // 合计夜间的数据
                    EventTotal[month][Key_SelectStaffTotal][Key_Night] = EventTotal[month][Key_SelectStaffTotal][Key_Night]
                        ? EventTotal[month][Key_SelectStaffTotal][Key_Night] + EventTotal[month][policeName][Key_Night]
                        : EventTotal[month][policeName][Key_Night];
                }
            });

            Object.entries(EventTotal).forEach(([month, personnelData]) => {
                DomStringObject.domNight.push(`<ul class="dialog-content-list night-ul">`);
                DomStringObject.domNight.push(`<li class="dialog-content-list-item">${month}</li>`);
                DomStringObject.domNight.push(`<li class="dialog-content-list-item">夜间</li>`);
                Object.entries(personnelData).forEach(([policeName, data]) => {
                    if (policeName !== Key_SelectStaffTotal) {
                        DomStringObject.domNight.push(`<li class="dialog-content-list-item">${policeName} X ${data[Key_Night] || 0}</li>`);
                    }
                });
                DomStringObject.domNight.push(`</ul>`);

                DomStringObject.domTotal.push(`<ul class="dialog-content-list total-ul">`);
                DomStringObject.domTotal.push(`<li class="dialog-content-list-item">${month}</li>`);
                DomStringObject.domTotal.push(`<li class="dialog-content-list-item">总计</li>`);
                Object.entries(EventTotal[month][Key_SelectStaffTotal]).forEach(([code, count]) => {
                    DomStringObject.domTotal.push(`<li class="dialog-content-list-item">${code} X ${count}</li>`);
                });

                DomStringObject.domTotal.push(`</ul>`);
            });

            document.querySelectorAll('#dialog-container ul.night-ul').forEach((item) => {
                item.remove();
            });

            document.querySelectorAll('#dialog-container ul.total-ul').forEach((item) => {
                item.remove();
            });

            const range = document.createRange();
            range.selectNode(document.querySelector('#dialog-container .dialog-content'));
            const fragment = range.createContextualFragment(DomStringObject.domNight.join('') + DomStringObject.domTotal.join(''));

            document.querySelector('#dialog-container .dialog-content').append(fragment);
        }

        RegenerateTotalData();

        // 关闭 dialog
        document.querySelector('#dialog-container .dialog-close').addEventListener('click', () => {
            document.querySelector('#dialog-container').style.display = 'none';
        });

        // 夜间设置弹窗
        document.querySelector('#dialog-container #dialog-night-button').addEventListener('click', () => {
            document.querySelector('#dialog-container .dialog-night-popup').style.display = 'block';
        });

        // 关闭夜间设置弹窗
        document.querySelector('#dialog-container .dialog-night-popup #cancel').addEventListener('click', () => {
            document.querySelector('#dialog-container .dialog-night-popup').style.display = 'none';
        });

        // 确认夜间设置
        document.querySelector('#dialog-container .dialog-night-popup #sure').addEventListener('click', () => {
            const DomString = [];
            const TimeRows_First = document.querySelectorAll('#dialog-container .dialog-night-popup .time-row');

            // 删除起始时间和结束时间相同的元素
            for (let index = TimeRows_First.length - 1; index >= 0; index--) {
                const row = TimeRows_First[index];
                const inputs = row.querySelectorAll('input[type="time"]');
                if (inputs.length === 2) {
                    const startTime = inputs[0].value;
                    const endTime = inputs[1].value;
                    if (startTime === endTime) {
                        row.remove();
                    }
                }
            }

            const TimeRows_Last = document.querySelectorAll('#dialog-container .dialog-night-popup .time-row');

            NightTotal.length = 0; // 清空原有夜间时间段
            TimeRows_Last.forEach((row) => {
                const inputs = row.querySelectorAll('input[type="time"]');
                if (inputs.length === 2) {
                    const startTime = inputs[0].value.split(':').map(Number);
                    const endTime = inputs[1].value.split(':').map(Number);
                    if (startTime.length === 2 && endTime.length === 2) {
                        NightTotal.push([].concat(startTime, endTime));
                    }
                }
            });

            NightTotal.map((item, index) => {
                DomString.push(`<p class="time-item">${item[0].toString().padStart(2, '0')}:${item[1].toString().padStart(2, '0')} - ${item[2].toString().padStart(2, '0')}:${item[3].toString().padStart(2, '0')}</p>`);
            });

            document.querySelector('#dialog-container .dialog-night-box .overflow-hidden-right').innerHTML = DomString.join('');

            RegenerateTotalData();

            document.querySelector('#dialog-container .dialog-night-popup').style.display = 'none';
        });

        // 增加夜间时段
        document.querySelector('#dialog-container .dialog-night-popup .add-time-row').addEventListener('click', (event) => {
            const TimeRowDom = document.createElement('p');
            TimeRowDom.className = 'time-row';
            TimeRowDom.innerHTML = `<input type="time" value="00:00"><span> - </span><input type="time" value="00:00"><span class="span-button delete-time-row"></span>`;
            document.querySelector('#dialog-container .dialog-night-popup .dialog-night-set-time').insertBefore(TimeRowDom, event.target.parentNode);
        });

        // 删除夜间时段
        document.querySelectorAll('#dialog-container .dialog-night-popup').forEach((element) => {
            element.addEventListener('click', (event) => {
                const TimeRowDom = event.target.closest('.delete-time-row');
                if (TimeRowDom) {
                    event.target.closest('.time-row').remove();
                }
            });
        });

        // 监听总数复选框变化事件
        [].forEach.call(document.querySelectorAll('#dialog-container input[name="total-label"]'), (element, index) => {
            element.addEventListener('change', RegenerateTotalData);
        });
    }

    /**
     * 自动统计指引函数 - 用于自动遍历所有页面并收集统计数据
     *
     * 工作流程:
     * 1. 检查 sessionStorage 中的 'POPUP-TASK-TAG' 标记，如果没有该标记则不执行统计代码
     * 2. 根据标记执行不同操作:
     *    - 'START-COUNT': 首次执行,将页面重置到第一页开始统计
     *    - 'CONTINUE-COUNT': 继续执行统计,处理当前页面数据后翻到下一页
     * 3. 每页执行:
     *    - 调用 STATISTICS_CUSTOMIZE() 统计当前页面数据
     *    - 判断是否为最后一页:
     *      - 是: 清除标记,展示最终统计结果
     *      - 否: 设置标记为 'CONTINUE-COUNT' 并翻到下一页
     */
    async function AUTO_COUNT_GUIDE() {
        const PopupTaskTag = sessionStorage.getItem('POPUP-TASK-TAG');
        const PopupTaskMode = sessionStorage.getItem('POPUP-TASK-MODE');
        const RecordInfoDom = document.querySelectorAll('#result .pagin .message .blue');
        const PaginationDom = document.querySelectorAll('#result .pagin .paginList .paginItem a');
        const Total = RecordInfoDom[2].textContent.trim();
        const CurrentPage = document.querySelector('#result .pagin .paginList .paginItem.current a').textContent.trim();

        switch (PopupTaskTag) {
            case 'START-COUNT':
                if (Number(CurrentPage) !== 1) {
                    PaginationDom[0].click();
                    break;
                }

            // 如果是第一页,执行下面的统计逻辑,与 CONTINUE-COUNT 相同
            case 'CONTINUE-COUNT':
                if (PopupTaskMode === 'ViolationStatisticsMonthly') {
                    await STATISTICS_MONTHLY();
                } else if (PopupTaskMode === 'ViolationStatisticsCustomize') {
                    await STATISTICS_CUSTOMIZE();
                }
                if (Number(CurrentPage) === Number(Total)) {
                    sessionStorage.removeItem('POPUP-TASK-TAG');
                    sessionStorage.removeItem('POPUP-TASK-MODE');
                    await openViolationStatisticsDataHtml(ExampleObject.TotalPersonnel);
                } else {
                    sessionStorage.setItem('POPUP-TASK-TAG', 'CONTINUE-COUNT');
                    PaginationDom[PaginationDom.length - 2].click();
                }
                break;

            default:
                break;
        }
    }

    await new Promise(async (resolve, reject) => {
        let WhileCount = 0;
        let WhileFlag = true;

        while (WhileFlag && WhileCount < 10) {
            if (document.readyState === 'complete') {
                WhileFlag = false;
            }

            await Sleep(3000);
            WhileCount++;
        }

        if (WhileCount < 10) {
            resolve();
        } else {
            reject();
        }
    })
        .then(async () => {
            await AUTO_COUNT_GUIDE();
        })
        .catch(() => {});
}

AUTO_TPOS_VIOLATION_STATISTICS();
