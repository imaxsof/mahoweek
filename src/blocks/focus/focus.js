// Focus
//------------------------------------------------------------------------------

(function() {

	Array.prototype.forEach.call(document.querySelectorAll('.js-choose-focus'), function(el) {
		el.addEventListener('change', function(value) {
			if (this.value === 'all') {
				LIST_BOARD.removeClass('board__lists--today  board__lists--planned  board__lists--someday');

				LIST_BOARD.addClass('board__lists--all');
			} else if (this.value === 'today') {
				LIST_BOARD.removeClass('board__lists--all  board__lists--planned  board__lists--someday');

				LIST_BOARD.addClass('board__lists--today');
			} else if (this.value === 'planned') {
				LIST_BOARD.removeClass('board__lists--all  board__lists--today  board__lists--someday');

				LIST_BOARD.addClass('board__lists--planned');
			} else if (this.value === 'someday') {
				LIST_BOARD.removeClass('board__lists--all  board__lists--today  board__lists--planned');

				LIST_BOARD.addClass('board__lists--someday');
			}
		});
	});

}());
