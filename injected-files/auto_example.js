const AutoClassParam = JSON.parse(document.getElementById('__AUTO__CLASS__PARAM__').textContent);

if (typeof AutoStudyClass === 'function') {
    window.AutoStudyClassExample = new AutoStudyClass(AutoClassParam);
} else if (typeof AutoExam === 'function') {
    window.AutoExamExample = new AutoExam(AutoClassParam);
} else if (typeof AUTO_TPOS_VIOLATION_STATISTICS === 'function') {
    sessionStorage.setItem('POPUP-TASK-TAG', 'START-COUNT');
    AUTO_TPOS_VIOLATION_STATISTICS();
}
