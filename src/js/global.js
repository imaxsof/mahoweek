// Global
//------------------------------------------------------------------------------

// Смотрим на используемые технологии
//------------------------------------------------------------------------------

// Определяем систему
var WINDOWS = navigator.platform.toUpperCase().indexOf('WIN') !== -1,
	OSX = navigator.platform.toUpperCase().indexOf('MAC') !== -1,
	LINUX = navigator.platform.toUpperCase().indexOf('LINUX') !== -1;

// Определяем браузер
var FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
	SAFARI = /^((?!chrome).)*safari/i.test(navigator.userAgent),
	CHROME = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()),
	CHROMEIOS = navigator.userAgent.match('CriOS'),
	MSIE = navigator.userAgent.match('MSIE'),
	ANDROID = navigator.userAgent.toLowerCase().indexOf('android') > -1,
	IPAD = navigator.userAgent.match(/iPad/i) !== null;

// Определяем мобильное устройство
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	var MOBILE = true;

	$('body').addClass('mobile');
}



// Определяем элементы доски
//------------------------------------------------------------------------------

var BOARD = $('.board'),
	THEME_BOARD = BOARD.find('.board__theme'),
	LIST_BOARD = BOARD.find('.board__lists'),
	SETTINGS_FORM = $('.form--settings');



// Инициализируем Хранилищем
//------------------------------------------------------------------------------

(function() {

	// Если Хранилища не существует
	if (!localStorage.getItem('mahoweek')) {
		// Очищаем локальное хранилище полностью
		localStorage.clear();

		// Создаем некоторые объекты для Хранилища
		var listId = makeHash(),
			dateTime = new Date().getTime(),
			theme = 'leaves';

		// Генерируем первоначальные данные для Хранилища
		var storageData = {
			lists: [
				{
					id: listId,
					name: 'Краткосрочный план дел',
					createdTime: dateTime
				}
			],
			tasks: [
				{
					id: makeHash(),
					listId: listId,
					name: 'Прочитать справку о сайте: https://mahoweek.ru/#about',
					createdTime: dateTime
				},
				{
					id: makeHash(),
					listId: listId,
					name: 'Посмотреть как здесь всё устроено: https://mahoweek.ru/#tour',
					createdTime: dateTime
				},
				{
					id: makeHash(),
					listId: listId,
					name: 'Настроить доску: https://mahoweek.ru/#settings',
					createdTime: dateTime
				},
				{
					id: makeHash(),
					listId: listId,
					name: 'Добавить ещё дел в список',
					createdTime: dateTime
				},
				{
					id: makeHash(),
					listId: listId,
					name: 'Наметить на календарной сетке даты выполнения задач',
					createdTime: dateTime
				}
			],
			settings: {
				createdTime: dateTime,
				updatedTime: dateTime,
				deleteCompletedTasks: false,
				faviconCounter: true,
				theme: theme
			}
		}

		// Создаем Хранилище
		localStorage.setItem('mahoweek', JSON.stringify(storageData));

		// Добавляем тему к доске
		THEME_BOARD.addClass('board__theme--' + theme);

		// Если хеш не содержит вывода прощального сообщения
		if (window.location.hash != '#bye') {
			// Добавляем хеш для вывода приветственного сообщения
			window.location.replace('#hello');
		}

	// Если Хранилище существует
	} else {
		// Парсим Хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Добавляем тему к доске
		THEME_BOARD.addClass('board__theme--' + mahoweekStorage.settings.theme);
	}

}());



// Запускаем внутренний таймер
//------------------------------------------------------------------------------

(function() {

	// Определяем первоначальные условия
	var delay = 1000,
		date = new Date();

	// Запускаем рекурсивный таймаут
	setTimeout(function timer() {
		// Если все элементы доски загружены
		if (BOARD.hasClass('board--load')) {
			// Получаем актуальную дату
			var newDate = new Date(),
				newDateTime = newDate.getTime();

			// Получаем реальные часы и минуты
			var realHours = newDate.getHours(),
				realMinutes = newDate.getMinutes(),
				realTime = (realHours < 10 ? '0' + realHours : realHours) + ':' + (realMinutes < 10 ? '0' + realMinutes : realMinutes);

			// Если наступил новый день
			if (date.getDay() != newDate.getDay()) {
				// Перезагружаем страницу
				window.location.reload(true);

			// Если день еще не закончился
			} else {
				// Если в браузере поддерживаются оповещения
				// и браузер и устройство подходят
				if (('Notification' in window) && !CHROMEIOS && !ANDROID && !IPAD && !MOBILE) {
					// Получаем время оповещения
					var notify = localStorage.getItem('notify');

					// Если время оповещения ранее выставлялось
					// и пользователь разрешил оповещения
					if (notify && notify != 'none' && Notification.permission === 'granted') {
						// Получаем кол-во мс за которое нужно оповестить и реальное время
						var notify = notify * 1;

						// Составляем заголовок и диапазон оповещения в мс
						if (notify == 900000) {
							var notifyTitle = '15 минут',
								notifyRange = 60000 * 2;
						} else if (notify == 1800000) {
							var notifyTitle = '30 минут',
								notifyRange = 60000 * 5;
						} else if (notify == 3600000) {
							var notifyTitle = '1 час',
								notifyRange = 60000 * 10;
						} else if (notify == 7200000) {
							var notifyTitle = '2 часа',
								notifyRange = 60000 * 15;
						}

						// Пробегаемся по каждому делу у которого установлено время
						LIST_BOARD.find('.task__time').each(function() {
							var isThis = $(this);

							// Получаем объект дела, запланированное время выполнения и текст дела
							var task = isThis.parents('.task'),
								taskPresetTime = isThis.text(),
								taskName = task.find('.task__name').text();

							// Удаляем лишнее в тексте дела
							taskName = taskName.replace(/((2[0-3]|[0-1]\d):([0-5]\d)) /ig, '');

							// Если дело запланировано на сегодня
							// и оно невыполнено и не просрочено по времени
							if (task.find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').length && taskPresetTime > realTime) {
								// Берем дату выполнения дела
								var taskDate = task.find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').attr('data-date');

								// Определяем точную дату и время выполнения дела
								var taskRunTime = taskDate + 'T' + taskPresetTime + ':00';

							// Либо если дело запланировано на завтра
							} else if (task.find('.grid__date--today + .grid__date--bull').length) {
								// Берем дату выполнения дела
								var taskDate = task.find('.grid__date--today + .grid__date--bull').attr('data-date');

								// Определяем точную дату и время выполнения дела
								var taskRunTime = taskDate + 'T' + taskPresetTime + ':00';
							}

							// Если о деле планируется оповестить заранее
							// и этого еще не было сделано
							if (taskRunTime && (!task.attr('data-notify') || (task.attr('data-notify') && task.attr('data-notify') != taskRunTime))) {
								// Если время оповещения в диапазоне подошло
								if (newDateTime + notify >= Date.parse(taskRunTime) && newDateTime + notify <= Date.parse(taskRunTime) + notifyRange) {
									// Показываем оповещение
									var notification = new Notification('Через ' + notifyTitle + ', в ' + taskPresetTime, {
										body: taskName,
										icon: '/img/notify.png?v=2',
										requireInteraction: true
									});

									// Ставим метку, что оповещение уже было
									task.attr('data-notify', taskRunTime);

									// Добавляем данные в Метрику
									yaCounter43856389.reachGoal('ya-alert-triggered');
								}
							}
						});
					}
				}

				// Пробегаемся по каждому делу у которого установлено время
				LIST_BOARD.find('.task__time').each(function() {
					var isThis = $(this);

					// Получаем объект дела и запланированное время выполнения
					var task = isThis.parents('.task'),
						taskPresetTime = isThis.text();

					// Если дело запланировано на сегодня
					// и оно невыполнено, а время уже подошло
					if (task.find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').length && taskPresetTime <= realTime) {
						task.addClass('task--now');
					} else {
						task.removeClass('task--now');
					}
				});
			}

		// Если не все элементы доски загружены
		} else {
			// Fix: скроллим к началу страницы во избежании скролла к анкору
			// при первоначальном открытии модального окна
			$(window).scrollTop(0);
		}

		setTimeout(timer, delay);
	}, delay);

}());



// Показываем поле для редактирования имени списка или дела при явном действии
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
	LIST_BOARD.on(endEvent, '.js-name', function(event, run) {
		var isThis = $(this);

		// Высчитываем сумму
		if (event.type == 'touchend') {
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			xy2 = touch.pageX + touch.pageY;
		} else {
			xy2 = event.pageX + event.pageY;
		}

		// Если это была не левая кнопка мышки
		if (event.type == 'mouseup' && event.which != 1 && run != 'run') {
			// Прекращаем выполнение
			return false;
		}

		// Если это был не клик по ссылке
		if (!$(event.target).hasClass('js-link-task') && !$(event.target).hasClass('cartonbox')) {
			// Если это было явное действие для редактирования
			if (xy1 == xy2 || run == 'run') {
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
						isThis.html(remakeListName($(this).val()));
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

	// Если в браузере поддерживается смена фавиконки
	// и браузер и устройство подходят
	if (document.createElement('canvas').getContext && !CHROMEIOS && !ANDROID && !IPAD && !MSIE && !SAFARI && !MOBILE) {
		// Определяем фавиконки
		var iconDefault = '/favicon-32x32.png?v=3',
			iconToday = '/img/favicon-today.png?v=2';

		// Удаляем текущие фавиконки
		$('link[rel$=icon]').remove();

		// Парсим Хранилище и находим настройку счетчика в фавиконке
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek')),
			faviconCounter = mahoweekStorage.settings.faviconCounter;

		// Считаем кол-во дел на сегодня
		var taskTodayTotal = LIST_BOARD.find('.task--today').length;

		// Если на сегодня намечены дела
		// и показ счетчика в фавиконке включен
		if (taskTodayTotal > 0 && faviconCounter === true) {
			// Показываем, что на сегодня имеются дела
			$('head').append($('<link rel="icon" type="image/png" sizes="32x32">').attr('href', iconToday));

			// Показываем счетчик с количеством дел
			Tinycon.setBubble(taskTodayTotal <= 9 ? taskTodayTotal : '9+');
		} else {
			// Показываем, что на сегодня дел не имеется
			$('head').append($('<link rel="icon" type="image/png" sizes="32x32">').attr('href', iconDefault));
		}
	}

}



// Генерируем хеш
//------------------------------------------------------------------------------

function makeHash() {

	// Определяем переменные для хеша
	var hash = '',
		possible = '0123456789abcdefghijklmnopqrstuvwxyz';

	// Генерируем хеш
	for (var i = 0; i < 8; i ++) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	// Выводим хеш
	return hash;

}



// Обновляем Хранилище и БД
//------------------------------------------------------------------------------

function updateStorage(data) {

	// Записываем дату обновления в Хранилище
	data.settings.updatedTime = new Date().getTime();

	// Обновляем Хранилище
	localStorage.setItem('mahoweek', JSON.stringify(data));

	// Если пользователь идентифицирован
	if (firebase.auth().currentUser) {
		// Показываем индикатор обновления
		$('.sync__indicator').attr('data-type', 'process');

		// Отправляем изменения в БД из Хранилища
		firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/database').set({
			"lists": data.lists,
			"tasks": data.tasks,
			"settings": data.settings
		}).then(function() {
			// Показываем индикатор, что все окей
			$('.sync__indicator').attr('data-type', 'ok');
		}).catch(function(error) {
			// Показываем индикатор краха
			$('.sync__indicator').attr('data-type', 'fail');

			// Выводим ошибку
			console.error(error.code + ': ' + error.message);
		});
	}

}
