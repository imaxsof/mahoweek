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
		},
		onShowBefore: function() {
			// Если открыто окно редактирования локального хранилища
			if (window.location.hash == '#storage') {
				// Парсим хранилище
				var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

				// Форматируем красиво вывод
				var mahoweekStorage = JSON.stringify(mahoweekStorage, '', 2);

				// Загружаем в текстарею содержимое локального хранилища
				STORAGE_FORM.find('.js-edit-storage').val(mahoweekStorage);
			}
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

		// Показываем содержимое доски
		BOARD.addClass('board--load');

		// Убираем вставку видимости фонового изображения
		THEME_BOARD.css('visibility', '');
	});

}());
