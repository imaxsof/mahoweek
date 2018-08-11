// Focus
//------------------------------------------------------------------------------

Array.prototype.forEach.call(document.querySelectorAll('.js-choose-focus'), function(el) {
	el.addEventListener('change', function(value) {
		changeFocus(this.value);
	});
});

function changeFocus(value) {
	if (value === 'all') {
		document.body.classList.remove('focus-today', 'focus-planned', 'focus-someday', 'focus-completed');

		document.body.classList.add('focus-all');
	} else if (value === 'today') {
		document.body.classList.remove('focus-all', 'focus-planned', 'focus-someday', 'focus-completed');

		document.body.classList.add('focus-today');
	} else if (value === 'planned') {
		document.body.classList.remove('focus-all', 'focus-today', 'focus-someday', 'focus-completed');

		document.body.classList.add('focus-planned');
	} else if (value === 'someday') {
		document.body.classList.remove('focus-all', 'focus-today', 'focus-planned', 'focus-completed');

		document.body.classList.add('focus-someday');
	} else if (value === 'completed') {
		document.body.classList.remove('focus-all', 'focus-today', 'focus-planned', 'focus-someday');

		document.body.classList.add('focus-completed');
	}
}
