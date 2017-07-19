// Form
//------------------------------------------------------------------------------

// Настраиваем оповещения
//------------------------------------------------------------------------------

(function() {

	// Если оповещения в браузере поддерживаются
	if (('Notification' in window)) {
		// Показываем настройку
		SETTINGS_FORM.find('.js-choose-notify').parents('.form__group').removeClass('form__group--hidden');

		// Если время оповещения ранее выставлялось
		// и пользователь разрешил оповещения
		if (localStorage.getItem('notify') && localStorage.getItem('notify') != 'none' && Notification.permission === 'granted') {
			// Показываем выбранный пункт
			SETTINGS_FORM.find('.js-choose-notify option[value="' + localStorage.getItem('notify') + '"]').attr('selected', 'selected');
		}

		// Меняем время оповещения
		SETTINGS_FORM.find('.js-choose-notify').on('change', function() {
			// Получаем текущее значение
			var notifyValue = $(this).val();

			if (notifyValue == 'none') {
				// Выключаем оповещения
				localStorage.setItem('notify', 'none');
			} else {
				// Если пользователь ранее разрешил оповещения
				if (Notification.permission === 'granted') {
					// Меняем время оповещения
					localStorage.setItem('notify', notifyValue);

				// Если пользователь еще не включал оповещения
				} else if (Notification.permission === 'default') {
					// Запрашиваем права
					Notification.requestPermission(function(permission) {
						// И если пользователь разрешил оповещения
						if (permission === "granted") {
							// Записываем время оповещения
							localStorage.setItem('notify', notifyValue);

							// Показываем оповещение с краткой справкой
							var notification = new Notification('Оповещения включены', {
								body: 'Теперь добавьте время выполнения делам и держите сайт открытым в браузере, чтобы оповещения приходили.',
								icon: '/img/notify.png?v=2',
								requireInteraction: true
							});

						// А если пользователь заблокировал оповещения
						} else {
							// Выключаем оповещения
							localStorage.setItem('notify', 'none');

							// Делаем состояние селекта по-умолчанию
							SETTINGS_FORM.find('.js-choose-notify option').removeAttr('selected', 'selected');
						}
					});

				// Если пользователь ранее блокировал оповещения
				} else if (Notification.permission === 'denied') {
					// Показываем алерт
					alert('Ранее вы блокировали отправку вам оповещений. Пожалуйста, разрешите оповещения в настройках сайта в браузере.');

					// Делаем состояние селекта по-умолчанию
					SETTINGS_FORM.find('.js-choose-notify option').removeAttr('selected', 'selected');
				}
			}
		});
	}


}());



// Настраиваем доску
//------------------------------------------------------------------------------

(function() {

	// Отменяем отправку формы по сабмиту
	SETTINGS_FORM.on('submit', function(event) {
		event.preventDefault();
	});

	// Парсим хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Определяем текущие параметры
	var theme = mahoweekStorage.settings.theme;

	// Выделяем текущую тему как активную
	SETTINGS_FORM.find('.js-choose-theme[value="' + theme + '"]').attr('checked', 'checked');

	// Сохраняем параметры
	SETTINGS_FORM.find(':checkbox, :radio').on('change', function() {
		// Определяем новые параметры
		theme = SETTINGS_FORM.find('.js-choose-theme[name="theme"]:checked').val();

		// Изменяем тему у доски
		THEME_BOARD.attr('class', 'board__theme  board__theme--' + theme);

		// Парсим хранилище и изменяем параметры
		mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));
		mahoweekStorage.settings.theme = theme;

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));
	});

}());



// Редактируем данные локального хранилища
//------------------------------------------------------------------------------

(function() {

	// Сохраняем изменения
	STORAGE_FORM.on('submit', function(event) {
		event.preventDefault();

		// Берем и парсим отредактированные данные
		var editedMahoweekStorage = JSON.parse(STORAGE_FORM.find('.js-edit-storage').val());

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(editedMahoweekStorage));

		// Перезагружаем
		window.location.replace('/');
	});

}());
