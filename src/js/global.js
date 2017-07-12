// Global
//------------------------------------------------------------------------------

// Скроллим к началу страницы
// во избежании скролла к анкору при первоначальном открытии модального окна
//------------------------------------------------------------------------------

setTimeout(function() {
	$('body').scrollTop(0);
}, 1);



// Определяем мобилку
//------------------------------------------------------------------------------

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	$('body').addClass('mobile');

	var MOBILE = 1;
}



// Определяем элементы доски
//------------------------------------------------------------------------------

var BOARD = $('.board'),
	THEME_BOARD = BOARD.find('.board__theme'),
	LIST_BOARD = BOARD.find('.board__lists'),
	SETTINGS_FORM = $('.form--settings'),
	STORAGE_FORM = $('.form--storage');



// Запускаем внутренний таймер
//------------------------------------------------------------------------------

(function() {

	// Определяем первоначальные условия
	var delay = 1000,
		date = new Date();

	// Запускаем рекурсивный таймаут
	setTimeout(function timer() {
		// Получаем актуальную дату
		var newDate = new Date();

		// Если наступил новый день
		if (date.getDay() != newDate.getDay()) {
			// Перезагружаем страницу
			window.location.reload(true);

			// Сбрасываем дату на новый день
			date = newDate;
		}

		// // Если время оповещения ранее выставлялось
		// // и пользователь разрешил оповещения
		// if (localStorage.getItem('notify') && localStorage.getItem('notify') != 'none' && Notification.permission === 'granted') {
		// 	// Получаем кол-во мс за которое нужно оповестить
		// 	var notify = localStorage.getItem('notify');

		// 	console.log(newDate.getHours());

		// 	// Пробегаемся по каждому делу у которого установлено время
		// 	LIST_BOARD.find('.task__time').each(function() {
		// 		var isThis = $(this),
		// 			task = isThis.parents('.task');

		// 		// Определяем точное время выполнения каждого дела
		// 		var scheduledTime = 0;

		// 		// Если у дела есть метка на сегодняшний день, она не выполнена и время не прошло
		// 		if (task.find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').length && newDate) {
		// 			scheduledTime = 1;

		// 		// Или если дело запланировано на завтра
		// 		} else if (task.find('.grid__date--today + .grid__date--bull').length) {
		// 			scheduledTime = 2;
		// 		}

		// 		//console.log(scheduledTime);

		// 		// Если у дела есть метка на сегодняшний день и она не выполнена
		// 		// или дело запланировано на завтра
		// 		// if (task.find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').length || task.find('.grid__date--today + .grid__date--bull').length) {
		// 		// 	// Определяем точное время выполнения каждого дела
		// 		// 	var scheduledTime = 0;

		// 		// 	if (scheduledTime) {
		// 		// 		console.log(task.find('.task__name').text());
		// 		// 	}
		// 		// }
		// 	});
		// }

		setTimeout(timer, delay);
	}, delay);

}());



// Работаем с хранилищем
//------------------------------------------------------------------------------

(function() {

	// Если хранилища не существует
	if (!localStorage.getItem('mahoweek')) {
		// Создаем некоторые объекты
		var listId = makeHash(),
			theme = 'leaves';

		// Генерируем первоначальные данные
		var mahoweekData = {
			lists: [{
				id: listId,
				name: 'Краткосрочный план дел',
				createdTime: new Date().getTime()
			}],
			tasks: [{
				id: makeHash(),
				listId: listId,
				name: 'Прочитать справку о сайте: https://mahoweek.ru/#about',
				createdTime: new Date().getTime()
			},
			{
				id: makeHash(),
				listId: listId,
				name: 'Посмотреть как здесь всё устроено: https://mahoweek.ru/#tour',
				createdTime: new Date().getTime()
			},
			{
				id: makeHash(),
				listId: listId,
				name: 'Настроить доску: https://mahoweek.ru/#settings',
				createdTime: new Date().getTime()
			},
			{
				id: makeHash(),
				listId: listId,
				name: 'Добавить ещё дел в список',
				createdTime: new Date().getTime()
			},
			{
				id: makeHash(),
				listId: listId,
				name: 'Наметить на календарной сетке даты выполнения задач',
				createdTime: new Date().getTime()
			}],
			settings: {
				theme: theme
			}
		}

		// Создаем хранилище с первоначальными данными
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekData));

		// Добавляем тему к доске
		THEME_BOARD.addClass('board__theme--' + theme);

		// Помечаем, что это первый визит пользователя на сайт
		$('body').attr('data-visit', 'first');

	// Если хранилище существует
	} else {
		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Добавляем тему к доске
		THEME_BOARD.addClass('board__theme--' + mahoweekStorage.settings.theme);
	}

}());



// Показываем поле для редактирования списка или дела при явном действии
//------------------------------------------------------------------------------

(function() {

	// Задаем первоначальные данные
	var xy1 = 0;
	var xy2 = 0;

	// Определяем событие при нажатии
	var startEvent = MOBILE ? 'touchstart' : 'mousedown';

	// Старт события
	LIST_BOARD.on(startEvent, '.js-name', function(event) {
		// Высчитываем сумму
		if (event.type == 'touchstart') {
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			xy1 = touch.pageX + touch.pageY;
		} else {
			xy1 = event.pageX + event.pageY;
		}

		// Убираем фокус из поля добавления дела
		LIST_BOARD.find('.js-add-task').blur();
	});

	// Определяем событие при отпускании
	var endEvent = MOBILE ? 'touchend' : 'mouseup';

	// Конец события
	LIST_BOARD.on(endEvent, '.js-name', function(event) {
		var isThis = $(this);

		// Высчитываем сумму
		if (event.type == 'touchend') {
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			xy2 = touch.pageX + touch.pageY;
		} else {
			xy2 = event.pageX + event.pageY;
		}

		// Если это была не левая кнопка мышки
		if (event.type == 'mouseup' && event.which != 1) {
			// Прекращаем выполнение
			return false;
		}

		// Если это был не клик по ссылке
		if (!$(event.target).hasClass('js-link-task') && !$(event.target).hasClass('cartonbox')) {
			// Если это было явное действие для редактирования
			if (xy1 == xy2) {
				// Если это список и поля для редактирования еще нет
				if (isThis.hasClass('list__name') && !isThis.parents('.list').find('.list__input').length) {
					// Берем заголовок списка
					var listName = isThis.text();

					// Создаем поле для редактирования
					isThis.html('<input class="list__input  js-edit-list" type="text" maxlength="255" value="">');

					// Вставляем заголовок списка и фокусируем
					isThis.parents('.list').find('.list__input').val(listName).select();

					// При расфокусировке
					isThis.parents('.list').find('.list__input').focusout(function() {
						// Заменяем поле редактирования на заголовок списка
						isThis.text($(this).val());
					});
				}

				// Если это дело и поля для редактирования еще нет
				if (isThis.hasClass('task__name') && !isThis.parents('.task').find('.task__input').length) {
					// Берем текст дела
					var taskName = isThis.text();

					// Создаем поле для редактирования
					isThis.html('<input class="task__input  js-edit-task" type="text" maxlength="255" value="">');

					// Вставляем текст дела и фокусируем
					isThis.parents('.task').find('.task__input').val(taskName).focus();

					// При расфокусировке
					isThis.parents('.task').find('.task__input').focusout(function() {
						// Заменяем поле редактирования на текст дела
						isThis.html(remakeTaskName($(this).val()));
					});
				}
			}
		}
	});

}());



// Меняем фавиконку
//------------------------------------------------------------------------------

function changeFavicon() {

	// Определяем фавиконки
	var iconDefault = '/favicon-32x32.png?v=3',
		iconToday = '/img/favicon-today.png?v=2';

	// Считаем кол-во дел на сегодня
	var taskTodayTotal = LIST_BOARD.find('.task--today').length;

	// Удаляем текущие фавиконки
	$('link[rel$=icon]').remove();

	if (taskTodayTotal > 0) {
		// Показываем, что на сегодня имеются дела
		$('head').append($('<link rel="icon" type="image/png" sizes="32x32">').attr('href', iconToday));

		// Показываем счетчик с количеством дел
		Tinycon.setBubble(taskTodayTotal);
	} else {
		// Показываем, что на сегодня дел не имеется
		$('head').append($('<link rel="icon" type="image/png" sizes="32x32">').attr('href', iconDefault));
	}

}



// Генерируем хеш
//------------------------------------------------------------------------------

function makeHash() {

	// Определяем переменные
	var hash = '',
		possible = '0123456789abcdefghijklmnopqrstuvwxyz';

	// Генерируем хеш
	for (var i = 0; i < 8; i ++) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	// Выводим хеш
	return hash;

}
