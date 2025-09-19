try {
    new MutationObserver((mutationsList) => {
        for (const mutations of mutationsList) {
            if (mutations.type === 'childList') {
                // 子节点发生变化

                if (mutations.addedNodes.length > 0) {
                    // 新增节点
                    console.log(mutations);

                    for (const elementNode of mutations.addedNodes) {
                        const TargetText = elementNode.textContent || '';

                        if (TargetText.includes('部局转入')) {
                            const TS_NR = ''.concat('部局转入重点车辆', ' ', elementNode.childNodes[0]?.textContent, ' ', elementNode.childNodes[1]?.textContent, ' ', elementNode.childNodes[2]?.textContent, ' ');
                            console.log(TS_NR);
                            alarmClient.speechSpeak(TS_NR);
                        }
                    }
                }

                if (mutations.removedNodes.length > 0) {
                    // 删除节点
                }
            }
        }
    }).observe(document.getElementById('yjlist'), { childList : true, subtree : false });
    console.log('部局转入提示语音', '已加载');
} catch (error) {
    console.log('部局转入提示语音', '加载错误', error);
}
