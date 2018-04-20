function init() {
  var form = document.querySelector(".o-forms");
  form.addEventListener('submit', formSubmit)
};

function formSubmit(event) {
  event.preventDefault();
  var id = event.currentTarget.querySelector('#articleId').value;
  var url = window.location.href + 'article/' + id;
  window.location = url;
};
document.addEventListener("DOMContentLoaded", init);
