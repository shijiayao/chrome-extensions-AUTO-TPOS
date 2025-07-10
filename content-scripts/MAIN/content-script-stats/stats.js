async function AUTO_TPOS_VIOLATION_STATISTICS() {
    function Sleep(time = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }

    let ExampleObject = {};

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
        const StoreKey = 'TableTotalData';

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

                Total[StoreKey].push({
                    DocumentNumber,
                    LicensePlate,
                    OccurrenceTime,
                    TrafficViolationsCode,
                    Litigant,
                    PoliceName
                });

                return Total;
            },
            { [StoreKey] : [] }
        );

        const StoreKeyList = [StoreKey];
        const StoreKeyFlag = StoreKeyList.reduce((result, element, index) => {
            result[element] = false;
            return result;
        }, {});
        const TableTotalData_DB = {};
        const TotalPersonnel = {};

        if (StoreKeyList.length === 0) {
            return;
        }

        const DB_Example = new indexedDB_Class({
            DB_Name                 : 'TicketDatabase',
            DB_ObjectStore_NameList : StoreKeyList
        });

        await DB_Example.init();

        for (let index = 0; index < StoreKeyList.length; index++) {
            const Key = StoreKeyList[index];
            await DB_Example.ObjectStore_Get(Key).then((event) => {
                TableTotalData_DB[Key] = event.target.result || [];
            });
        }

        for (let index = 0; index < StoreKeyList.length; index++) {
            const Key = StoreKeyList[index];
            TableTotalData[Key].forEach((element01, index01) => {
                if (!TableTotalData_DB[Key].some((element02, index02) => element01.DocumentNumber === element02.DocumentNumber)) {
                    TableTotalData_DB[Key].push(element01);
                    StoreKeyFlag[Key] = true;
                }
            });
        }

        for (const key in StoreKeyFlag) {
            if (StoreKeyFlag[key]) {
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
            StoreKeyList,
            StoreKeyFlag,
            TableTotalData_DB,
            TotalPersonnel : TotalPersonnel[Object.keys(TotalPersonnel)[0]]
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

                Total.push({
                    DocumentNumber,
                    LicensePlate,
                    OccurrenceTime,
                    TrafficViolationsCode,
                    Litigant,
                    PoliceName
                });

                return Total;
            },
            []
        );

        // 从 sessionStorage 获取临时数据
        const CustomizeTempData = JSON.parse(sessionStorage.getItem('CUSTOMIZE_TEMP_DATA') || '[]');

        if (TableTotalData.length === 0) {
            return;
        }

        // 去重
        TableTotalData.forEach((element01, index01) => {
            if (!CustomizeTempData.some((element02, index02) => element01.DocumentNumber === element02.DocumentNumber)) {
                CustomizeTempData.push(element01);
            }
        });

        // 排序，按照 OccurrenceTime 时间顺序
        CustomizeTempData.sort((a, b) => new Date(a.OccurrenceTime) - new Date(b.OccurrenceTime));

        // 存储每个人员处理的违法行为
        const TotalPersonnel = CustomizeTempData.reduce((Total, element, index) => {
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

        ExampleObject = {
            TableTotalData,
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
    async function openViolationStatisticsDataHtml(paramDataList) {
        // 复制数据 paramDataList 到 dataList
        let dataList = JSON.parse(JSON.stringify(paramDataList));

        const StartingTime = {
            init      : true, // 初始化标记，初始化结束后改为 false
            startTime : 0, // 默认开始时间
            endTime   : 0 // 默认结束时间
        };
        const ExtraTotal = [
            [12, 0, 15, 0],
            [18, 0, 8, 0]
        ]; // 额外
        const Keynote = ['4302', '4303', '4312', '4608', '4901', '4902']; // 重点

        const dialogContainerDom = document.createElement('div');
        dialogContainerDom.id = 'dialog-container';

        let domStringArray = [];

        domStringArray.push(`<div class="dialog-main">`); // 开始 dialog-main

        domStringArray.push(`<div class="dialog-close"></div>`);

        domStringArray.push(`<div class="dialog-content-wrap">`); // 开始 dialog-content-wrap
        domStringArray.push(`<div class="dialog-content">`); // 开始 dialog-content
        domStringArray.push(`<div class="dialog-content-list-box"></div>`);
        domStringArray.push(`<div class="dialog-content-total-box"></div>`);
        domStringArray.push(`</div>`); // 结束 dialog-content
        domStringArray.push(`<div class="dialog-set-param">`); // 开始 dialog-set-param
        domStringArray.push(`<div class="set-param-box"><button id="dialog-set-param-button">设置参数</button></div>`);
        domStringArray.push(`</div>`); // 结束 dialog-set-param
        domStringArray.push(`</div>`); // 结束 dialog-content-wrap

        domStringArray.push(`<div class="dialog-set-param-popup">`); // 开始 dialog-set-param-popup
        domStringArray.push(`<div class="dialog-set-param-wrap">`); // 开始 dialog-set-param-wrap
        domStringArray.push(`<div class="dialog-set-item dialog-set-time">`); // 开始 dialog-set-time
        domStringArray.push(`<p class="item-row-p time-row center-title"><span>数据统计时间段</span></p>`);
        domStringArray.push(`<p class="item-row-p time-row">`);
        domStringArray.push(`<span>开始时间：</span>`);
        domStringArray.push(`<input type="datetime-local" id="start-date-time" value="${new Date().toISOString().slice(0, 16)}">`);
        domStringArray.push(`</p>`);
        domStringArray.push(`<p class="item-row-p time-row">`);
        domStringArray.push(`<span>结束时间：</span>`);
        domStringArray.push(`<input type="datetime-local" id="end-date-time" value="${new Date().toISOString().slice(0, 16)}">`);
        domStringArray.push(`</p>`);
        domStringArray.push(`</div>`); // 结束 dialog-set-time
        domStringArray.push(`<div class="dialog-set-item dialog-set-extra">`); // 开始 dialog-set-extra
        domStringArray.push(`<p class="item-row-p extra-row center-title"><span>额外加分时间段</span></p>`);
        ExtraTotal.map((item, index) => {
            domStringArray.push(`<p class="item-row-p extra-row">`);
            domStringArray.push(`<input type="time" value="${item[0].toString().padStart(2, '0')}:${item[1].toString().padStart(2, '0')}">`);
            domStringArray.push(`<span> - </span>`);
            domStringArray.push(`<input type="time" value="${item[2].toString().padStart(2, '0')}:${item[3].toString().padStart(2, '0')}">`);
            domStringArray.push(`<span class="span-button delete-row"></span>`);
            domStringArray.push(`</p>`);
        });
        domStringArray.push(`<p class="item-row-p extra-row"><span class="span-button add-row"></span></p>`);
        domStringArray.push(`</div>`); // 结束 dialog-set-extra
        domStringArray.push(`<div class="dialog-set-item dialog-set-keynote">`); // 开始 dialog-set-keynote
        domStringArray.push(`<p class="item-row-p keynote-row center-title"><span>重点设置</span></p>`);
        Keynote.map((item, index) => {
            domStringArray.push(`<p class="item-row-p keynote-row">`);
            domStringArray.push(`<input type="text" value="${item}">`);
            domStringArray.push(`<span class="span-button delete-row"></span>`);
            domStringArray.push(`</p>`);
        });
        domStringArray.push(`<p class="item-row-p keynote-row"><span class="span-button add-row"></span></p>`);
        domStringArray.push(`</div>`); // 结束 dialog-set-keynote
        domStringArray.push(`</div>`); // 结束 dialog-set-param-wrap
        domStringArray.push(`<p class="dialog-set-param-button"><button id="cancel">取消</button><button id="sure">确定</button></p>`);
        domStringArray.push(`</div>`); // 结束 dialog-set-param-popup

        domStringArray.push(`</div>`); // 结束 dialog-main

        dialogContainerDom.innerHTML = domStringArray.join('');

        // 将表格添加到页面
        document.body.appendChild(dialogContainerDom);

        /**
         * 根据起始时间筛选数据
         */
        function FilterDataByTime() {
            if (StartingTime.init) return;

            dataList = {};

            Object.entries(paramDataList).forEach(([policeName, data]) => {
                const TempData = {
                    DetailArray : [],
                    IDObject    : {}
                };

                // 过滤数据，按照时间段筛选
                TempData.DetailArray = data.DetailArray.filter((item) => {
                    const itemTime = new Date(item.OccurrenceTime);
                    const startTime = new Date(StartingTime.startTime);
                    const endTime = new Date(StartingTime.endTime);
                    return itemTime >= startTime && itemTime < endTime;
                });

                // 如果人员没有数据，则不显示
                if (TempData.DetailArray.length > 0) {
                    TempData.IDObject = TempData.DetailArray.reduce((IDObject, item) => {
                        IDObject[item.TrafficViolationsCode] ? IDObject[item.TrafficViolationsCode]++ : (IDObject[item.TrafficViolationsCode] = 1);
                        return IDObject;
                    }, {});
                    dataList[policeName] = TempData;
                }
            });
        }

        /**
         * 生成人员详细数据
         */
        function RegenerateStaffData() {
            FilterDataByTime();

            // 遍历数据并创建表格行，人员的详细数据
            let domStringStaffList = [];
            Object.entries(dataList).forEach(([policeName, data]) => {
                domStringStaffList.push(`<ul class="dialog-content-list staff-list">`);
                domStringStaffList.push(`<li class="dialog-content-list-item">${policeName}</li>`);
                domStringStaffList.push(`<li class="dialog-content-list-item"><label><input type="checkbox" name="total-label" value="${policeName}" checked></label></li>`);
                Object.entries(data.IDObject).map(([code, count]) => {
                    domStringStaffList.push(`<li class="dialog-content-list-item">${code} X ${count}</li>`);
                });
                domStringStaffList.push(`</ul>`);
            });
            document.querySelector('.dialog-content-list-box').innerHTML = domStringStaffList.join('');
        }

        /**
         * 生成总计数据
         */
        function RegenerateTotalData() {
            FilterDataByTime();

            const Key_StaffTotal = '合计总数';
            const Key_SelectStaffTotal = '合计总数';
            const Key_Extra = '额外';
            const Key_Keynote = '重点';
            const RegExp_Keynote = new RegExp(Keynote.map((element, index) => String(element).toUpperCase()).join('|')); // 重点正则

            const EventTotal = { [Key_StaffTotal] : { [Key_Extra] : 0, [Key_Keynote] : 0 } };
            const EventSelectTotal = { [Key_SelectStaffTotal] : { [Key_Extra] : 0, [Key_Keynote] : 0 } };
            const DomStringObject = { domExtra : [], domTotal : [] };

            // 计算数据
            Object.entries(dataList).forEach(([policeName, data]) => {
                EventTotal[policeName] ? EventTotal[policeName] : (EventTotal[policeName] = { [Key_Extra] : 0, [Key_Keynote] : 0 });
                EventSelectTotal[policeName] ? EventSelectTotal[policeName] : (EventSelectTotal[policeName] = { [Key_Extra] : 0, [Key_Keynote] : 0 });

                // 所有人员的 夜间数据、重点数据
                data.DetailArray.forEach((item) => {
                    const TimeSplitArray = item.OccurrenceTime.split(/-|:| /);
                    const timeHour = Number(TimeSplitArray[3]);
                    const timeMinute = Number(TimeSplitArray[4]);
                    const occurTime = Number(''.concat(timeHour.toString().padStart(2, '0'), timeMinute.toString().padStart(2, '0')));

                    // 初始化起始时间
                    if (StartingTime.init) {
                        if (StartingTime.startTime === 0) {
                            StartingTime.startTime = item.OccurrenceTime;
                        }
                        if (StartingTime.endTime === 0) {
                            StartingTime.endTime = item.OccurrenceTime;
                        }

                        if (new Date(item.OccurrenceTime) < new Date(StartingTime.startTime)) {
                            StartingTime.startTime = item.OccurrenceTime;
                        }
                        if (new Date(item.OccurrenceTime) > new Date(StartingTime.endTime)) {
                            StartingTime.endTime = item.OccurrenceTime;
                        }
                    }

                    // code 数据
                    EventTotal[policeName][item.TrafficViolationsCode] ? EventTotal[policeName][item.TrafficViolationsCode]++ : (EventTotal[policeName][item.TrafficViolationsCode] = 1);
                    EventTotal[Key_StaffTotal][item.TrafficViolationsCode] ? EventTotal[Key_StaffTotal][item.TrafficViolationsCode]++ : (EventTotal[Key_StaffTotal][item.TrafficViolationsCode] = 1);

                    // 重点数据
                    if (RegExp_Keynote.test(item.TrafficViolationsCode.toUpperCase())) {
                        EventTotal[policeName][Key_Keynote]++; // 人员的重点数据
                        EventTotal[Key_StaffTotal][Key_Keynote]++; // 所有人员重点数据合计

                        // 额外数据，只有重点的才计算
                        if (
                            ExtraTotal.some((timeRange) => {
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
                            EventTotal[policeName][Key_Extra]++; // 人员的额外数据
                            EventTotal[Key_StaffTotal][Key_Extra]++; // 所有人员额外数据合计
                        }
                    }
                });
            });

            // 计算被选中人员的数据
            [].forEach.call(document.querySelectorAll('#dialog-container ul.staff-list'), (element01, index01) => {
                const ItemDom = element01.querySelectorAll('.dialog-content-list-item');
                const policeName = ItemDom[0].textContent;

                // 被选中的人员数据计算
                if (ItemDom[1].querySelector('input').checked) {
                    EventSelectTotal[policeName] = EventTotal[policeName];

                    Object.entries(EventSelectTotal[policeName]).forEach(([code, count]) => {
                        EventSelectTotal[Key_SelectStaffTotal][code] ? (EventSelectTotal[Key_SelectStaffTotal][code] += count) : (EventSelectTotal[Key_SelectStaffTotal][code] = count);
                    });
                }
            });

            // 生成所有人员的总计数据 DOM 字符串
            DomStringObject.domTotal.push(`<ul class="dialog-content-list total-ul">`);
            DomStringObject.domTotal.push(`<li class="dialog-content-list-item">所有总计</li>`);
            let TempStaffTotal = Object.entries(EventTotal[Key_StaffTotal]);
            TempStaffTotal.sort((a, b) => {
                if (a[0] === Key_Extra) {
                    return 1; // 将额外放在倒数第二
                } else if (a[0] === Key_Keynote) {
                    return 2; // 将重点放在最后
                } else if (b[0] === Key_Extra || b[0] === Key_Keynote) {
                    return -1; // 将额外和重点放在最后
                } else {
                    return a[0].localeCompare(b[0]); // 按照代码排序
                }
            });
            TempStaffTotal.forEach(([code, count]) => {
                DomStringObject.domTotal.push(`<li class="dialog-content-list-item">${code} X ${count}</li>`);
            });
            DomStringObject.domTotal.push(`</ul>`);

            // 生成选中人员的总计数据 DOM 字符串
            DomStringObject.domTotal.push(`<ul class="dialog-content-list select-total-ul">`);
            DomStringObject.domTotal.push(`<li class="dialog-content-list-item">选中总计</li>`);
            let TempSelectStaffTotal = Object.entries(EventSelectTotal[Key_SelectStaffTotal]);
            TempSelectStaffTotal.sort((a, b) => {
                if (a[0] === Key_Extra) {
                    return 1; // 将额外放在倒数第二
                } else if (a[0] === Key_Keynote) {
                    return 2; // 将重点放在最后
                } else if (b[0] === Key_Extra || b[0] === Key_Keynote) {
                    return -1; // 将额外和重点放在最后
                } else {
                    return a[0].localeCompare(b[0]); // 按照代码排序
                }
            });
            TempSelectStaffTotal.forEach(([code, count]) => {
                DomStringObject.domTotal.push(`<li class="dialog-content-list-item">${code} X ${count}</li>`);
            });
            DomStringObject.domTotal.push(`</ul>`);

            document.querySelector('#dialog-container .dialog-content .dialog-content-total-box').innerHTML = DomStringObject.domExtra.join('') + DomStringObject.domTotal.join('');
        }

        RegenerateStaffData();
        RegenerateTotalData();

        // 初始化数据渲染完成，起始时间初始化结束
        StartingTime.init = false;
        document.querySelector('#dialog-container #start-date-time').value = new Date(StartingTime.startTime).toISOString().slice(0, 16);
        document.querySelector('#dialog-container #end-date-time').value = new Date(StartingTime.endTime).toISOString().slice(0, 16);

        // 关闭 dialog
        document.querySelector('#dialog-container .dialog-close').addEventListener('click', () => {
            document.querySelector('#dialog-container').style.display = 'none';
        });

        // 委托父元素监听 checkbox 变化事件，监听人员复选框变化事件
        document.querySelector('#dialog-container .dialog-content-list-box').addEventListener('change', function (event) {
            // 检查事件目标是否为 checkbox
            if (event.target.matches('input[name="total-label"]')) {
                RegenerateTotalData();
            }
        });

        // 参数设置按钮
        document.querySelector('#dialog-container #dialog-set-param-button').addEventListener('click', () => {
            document.querySelector('#dialog-container .dialog-set-param-popup').style.display = 'block';
        });

        // 设置参数 行内按钮事件
        document.querySelector('#dialog-container .dialog-set-param-popup').addEventListener('click', (event) => {
            const RowTypeConfig = {
                'dialog-set-time'    : 'time-row',
                'dialog-set-extra'   : 'extra-row',
                'dialog-set-keynote' : 'keynote-row'
            };
            // 点击事件委托，处理参数设置弹窗内的点击事件
            const target = event.target;
            if (target.classList.contains('delete-row')) {
                // 删除行
                const row = target.closest('.item-row-p');
                if (row) {
                    row.remove();
                }
            } else if (target.classList.contains('add-row')) {
                // 增加行
                const parentItem = target.closest('.dialog-set-item');
                const parentClass = [...parentItem.classList].find((cls) => RowTypeConfig[cls]);
                const rowClassname = RowTypeConfig[parentClass];

                const newRow = document.createElement('p');
                newRow.className = `item-row-p ${rowClassname}`;
                let rowHtml = '';
                if (rowClassname === 'extra-row') {
                    rowHtml = `<input type="time" value="00:00"><span> - </span><input type="time" value="00:00">`;
                } else if (rowClassname === 'keynote-row') {
                    rowHtml = `<input type="text" value="">`;
                }
                rowHtml += `<span class="span-button delete-row"></span>`;
                newRow.innerHTML = rowHtml;

                const container = parentItem.querySelector('.item-row-p:last-child');
                if (container) {
                    container.insertAdjacentElement('beforebegin', newRow);
                }
            }
        });

        // 取消参数设置
        document.querySelector('#dialog-container .dialog-set-param-popup #cancel').addEventListener('click', () => {
            document.querySelector('#dialog-container .dialog-set-param-popup').style.display = 'none';
        });

        // 确认参数设置
        document.querySelector('#dialog-container .dialog-set-param-popup #sure').addEventListener('click', () => {
            // 获取起始时间和结束时间
            const startDateTimeInput = document.querySelector('#dialog-container #start-date-time');
            const endDateTimeInput = document.querySelector('#dialog-container #end-date-time');
            const startDateTime = new Date(startDateTimeInput.value);
            const endDateTime = new Date(endDateTimeInput.value);
            const StartingTimeChangeFlag = startDateTime.getTime() !== StartingTime.startTime || endDateTime.getTime() !== StartingTime.endTime;

            if (StartingTimeChangeFlag) {
                StartingTime.startTime = startDateTime.toISOString().slice(0, 16);
                StartingTime.endTime = endDateTime.toISOString().slice(0, 16);
            }

            // 额外加分时间段
            const ExtraRow = document.querySelectorAll('#dialog-container .dialog-set-param-popup .extra-row');
            ExtraTotal.length = 0; // 清空原有额外时间段
            ExtraRow.forEach((row) => {
                const inputs = row.querySelectorAll('input[type="time"]');
                if (inputs.length === 2) {
                    const startTime = inputs[0].value;
                    const endTime = inputs[1].value;
                    if (startTime !== endTime) {
                        ExtraTotal.push([].concat(startTime.split(':').map(Number), endTime.split(':').map(Number)));
                    }
                }
            });

            // 重点设置
            const KeynoteInput = document.querySelectorAll('#dialog-container .dialog-set-param-popup .keynote-row input');
            Keynote.length = 0; // 清空原有重点设置
            KeynoteInput.forEach((input) => {
                const value = input.value.trim().toUpperCase();
                if (value) {
                    Keynote.push(value);
                }
            });

            if (StartingTimeChangeFlag) {
                RegenerateStaffData();
            }

            RegenerateTotalData();

            document.querySelector('#dialog-container .dialog-set-param-popup').style.display = 'none';
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
                    await openViolationStatisticsDataHtml(ExampleObject.TotalPersonnel);
                    sessionStorage.removeItem('POPUP-TASK-TAG');
                    sessionStorage.removeItem('POPUP-TASK-MODE');
                } else {
                    PaginationDom[PaginationDom.length - 2].click();
                    sessionStorage.setItem('POPUP-TASK-TAG', 'CONTINUE-COUNT');
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
