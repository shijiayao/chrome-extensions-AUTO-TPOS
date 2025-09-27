const AutoFullyParam = JSON.parse(document.getElementById('__AUTO__FULLY__PARAM__').textContent);

if (typeof AutoFullyClass === 'function') {
    window.AutoFullyClassExample = new AutoFullyClass(AutoFullyParam);
} else if (typeof AUTO_TPOS_VIOLATION_STATISTICS === 'function') {
    sessionStorage.setItem('POPUP-TASK-MODE', AutoFullyParam.buttonTag);
    sessionStorage.setItem('POPUP-TASK-TAG', 'START-COUNT');
    AUTO_TPOS_VIOLATION_STATISTICS();
}
