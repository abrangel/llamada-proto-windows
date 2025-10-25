const submitButton = document.getElementById('submit');
const questionTextarea = document.getElementById('question');
const responseDiv = document.getElementById('response');

submitButton.addEventListener('click', () => {
  const question = questionTextarea.value;
  window.electronAPI.sendQuestion(question);
});

window.electronAPI.onResponse((event, response) => {
  responseDiv.innerText = response;
});
