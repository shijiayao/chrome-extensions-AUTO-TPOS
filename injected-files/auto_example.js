const AutoClassParam = JSON.parse(document.getElementById('__AUTO__CLASS__PARAM__').textContent);

if (typeof AutoStudyClass === 'function') {
    window.AutoStudyClassExample = new AutoStudyClass(AutoClassParam);
} else if (typeof AutoExam === 'function') {
    window.AutoExamExample = new AutoExam(AutoClassParam);
}
