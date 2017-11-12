// Cartonbox
//------------------------------------------------------------------------------

(function() {

	// Настраиваем Картонбокс
	var cartonboxConfig = {
		speed: 1,
		nav: false,
		preload: false,
		closeHtml: '<svg><use xlink:href="#icon-close"></use></svg>',
		onStartBefore: function() {
			// Переносим кнопку закрытия внутрь окна
			$('.cartonbox-close').prependTo('.cartonbox-container');
		}
	};

	// Инициализируем Картонбокс
	$.cartonbox(cartonboxConfig);

	// Если хеш содержит вывод приветственного сообщения
	if (window.location.hash == '#hello') {
		// Открываем окно приветствия
		$('.js-open-hello').trigger('click');
	}

	// Закрываем окно приветствия
	$('.js-close-hello').on('click', function() {
		$('.cartonbox-close').trigger('click');
	});

}());
