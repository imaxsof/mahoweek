// Cartonbox
//------------------------------------------------------------------------------

(function() {

	// Настраиваем Картонбокс
	var options = {
		speed: 1,
		preload: false,
		closeHtml: '<svg><use xlink:href="#icon-close"></use></svg>',
		onStartBefore: function() {
			// Переносим кнопку закрытия внутрь окна
			$('.cartonbox-close').prependTo('.cartonbox-container');
		}
	};

	// Инициализируем Картонбокс
	$.cartonbox(options);

	// Если это стартовый визит пользователя на сайт
	if ($('body').attr('data-visit') == 'start') {
		// Открываем окно приветствия
		$('.js-open-welcome').trigger('click');
	}

	// Закрываем окно приветствия
	$('.js-close-welcome').on('click', function() {
		$('.cartonbox-close').trigger('click');
	});

}());
