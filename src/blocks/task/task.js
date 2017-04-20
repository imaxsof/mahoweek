// Task
//------------------------------------------------------------------------------

// Назначаем глобальные переменные
var taskList = $('.list__tasks');



// Выводим список дел
//------------------------------------------------------------------------------

(function() {

	// Парсим хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Начинаем генерировать список
	var taskListCreate = '';

	// Пробегаемся по каждому делу
	for (var i = 0; i < mahoweekStorage.tasks.length; i ++) {
		// Создаем строку с делом
		taskListCreate += makeTask(mahoweekStorage.tasks[i].id, mahoweekStorage.tasks[i].name, mahoweekStorage.tasks[i].completed, mahoweekStorage.tasks[i].markers);
	}

	// Выводим список
	taskList.prepend(taskListCreate);

	// Расчитываем прогресс
	makeProgress();

}());



// Выводим сетку дат в строку добавления дела
//------------------------------------------------------------------------------

taskList.find('.task--add .task__grid').html(makeGrid());



// Фиксируем блок добавления дела
//------------------------------------------------------------------------------

(function() {

	// Если не мобилка
	if (!$('body').hasClass('mobile')) {
		// Определяем переменные
		var doc = $(window),
			docHeight = doc.height(),
			docScrollTop = doc.scrollTop(),
			taskListOffsetTop = taskList.offset().top,
			taskListHeight = taskList.height() - 1,
			taskAddHeight = taskList.find('.task--add').innerHeight();

		// Если изначально блока не видно
		if (docScrollTop + docHeight - taskAddHeight <= taskListOffsetTop + taskListHeight) {
			// Фиксируем
			taskList.find('.task--add').addClass('task--fixed');
		}

		// Скроллим или ресайзим
		doc.on('scroll resize', function() {
			var isThis = $(this);

			// Смотрим где сейчас скролл
			docScrollTop = isThis.scrollTop();

			// Могло измениться
			docHeight = isThis.height();
			taskListOffsetTop = taskList.offset().top;
			taskListHeight = taskList.height() - 1;

			// Если реальная позиция блока ниже
			if (docScrollTop + docHeight - taskAddHeight <= taskListOffsetTop + taskListHeight) {
				// Фиксируем
				taskList.find('.task--add').addClass('task--fixed');

			// Если реальная позиция блока достигнута
			} else {
				// Снимаем фиксирование
				taskList.find('.task--add').removeClass('task--fixed');
			}
		});
	}

}());



// Фокусируем поле добавления дела
//------------------------------------------------------------------------------

(function() {

	// Если не мобилка
	if (!$('body').hasClass('mobile')) {
		// Ставим фокус
		taskList.find('.js-add-task').focus();
	}

	// Если поле добавления в фокусе
	taskList.find('.js-add-task').focusin(function() {
		var isThis = $(this);

		// Ставим метку о фокусе
		isThis.parents('.task--add').addClass('task--focus');
	});

	// Если поле добавления не в фокусе
	taskList.find('.js-add-task').focusout(function() {
		var isThis = $(this);

		// Снимаем метку о фокусе
		isThis.parents('.task--add').removeClass('task--focus');
	});

}());



// Добавляем дело
//------------------------------------------------------------------------------

(function() {

	$('.js-add-task').on('change', function() {
		var isThis = $(this);

		// Получаем текст дела
		var taskName = isThis.val();

		// Получаем метку времени
		var taskCreatedTime = new Date().getTime();

		// Генерируем хеш
		var taskId = makeHash();

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Добавляем новое дело
		mahoweekStorage.tasks.push({
			id: taskId,
			name: taskName,
			createdTime: taskCreatedTime,
		});

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Стираем поле ввода
		isThis.val('');

		// Выводим дело в списке
		taskList.find('.task--add').before(makeTask(taskId, taskName));

		// Расчитываем прогресс
		makeProgress();

		// Если не мобилка
		if (!$('body').hasClass('mobile')) {
			// Прижимаем прокрутку к низу экрана
			$('body').scrollTop(10000);
		}
	});

}());



// Изменяем статуса дела
//------------------------------------------------------------------------------

(function() {

	taskList.on('click', '.js-completed-task', function() {
		var isThis = $(this),
			task = isThis.parents('.task');

		// Получаем хеш дела, метку о выполнении и дату текущего дня
		var taskId = task.attr('data-id'),
			taskCompleted = task.hasClass('task--completed'),
			taskDateToday = task.find('.grid__date--today').attr('data-date');

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Получаем элемент дела в хранилище
		var taskElement = mahoweekStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в хранилище
		var taskIndex = mahoweekStorage.tasks.indexOf(taskElement[0]);

		// Если дело не выполнено
		if (!taskCompleted) {
			// Переключаем метку выполнения в календаре
			task.find('.grid__date--today').toggleClass('grid__date--completed');

			// Переключаем метку в хранилище
			if (task.find('.grid__date--today').hasClass('grid__date--completed')) {
				var markerAct = 'add';
			} else {
				var markerAct = 'del';
			}

			// Если дело не многоразовое
			if ((task.find('.grid__date--today').hasClass('grid__date--bull') && !task.find('.grid__date--today').nextAll('.grid__date--bull').length) || (!task.find('.grid__date--today').hasClass('grid__date--bull') && task.find('.grid__date--today').nextAll('.grid__date--bull').length <= 1)) {
				// Окончательно ставим метку выполнения в календарь и в хранилище
				task.find('.grid__date--today').addClass('grid__date--completed');
				markerAct = 'add';

				// Получаем метку времени
				var taskCompletedTime = new Date().getTime();

				// Помечаем дело как выполненное
				mahoweekStorage.tasks[taskIndex].completed = 1;
				mahoweekStorage.tasks[taskIndex].completedTime = taskCompletedTime;

				// Обновляем дело в списке
				task.addClass('task--completed');
			}

		// Если дело было выполнено
		} else {
			// Убираем метку в хранилище
			var markerAct = 'del';

			// Убираем метку выполнения в календаре
			task.find('.grid__date--today').removeClass('grid__date--completed');

			// Помечаем дело как невыполненное
			delete mahoweekStorage.tasks[taskIndex].completed;
			delete mahoweekStorage.tasks[taskIndex].completedTime;

			// Обновляем дело в списке
			task.removeClass('task--completed');
		}

		// Заносим изменения в массив маркеров
		// и если массива маркеров не существовало
		if (markerAct == 'add' && !mahoweekStorage.tasks[taskIndex].markers) {
			// Создаем такой и сразу заполняем
			mahoweekStorage.tasks[taskIndex].markers = [{
				date: taskDateToday,
				completed: 1
			}];

		// Если существовало
		} else {
			// Проверяем существовала ли уже метка на это число
			var markerElement = mahoweekStorage.tasks[taskIndex].markers.filter(function(value) {
				return value.date == taskDateToday;
			});

			// Если существовала
			if (markerElement != '') {
				// Получаем индекс метки
				var markerIndex = mahoweekStorage.tasks[taskIndex].markers.indexOf(markerElement[0]);

				// Если действие добавления
				if (markerAct == 'add') {
					// Добавляем информацию о выполнении
					mahoweekStorage.tasks[taskIndex].markers[markerIndex].completed = 1;

				// Если удаления
				} else {
					// Если была установлена метка,
					// то удаляем только информацию о выполнении
					if (mahoweekStorage.tasks[taskIndex].markers[markerIndex].label) {
						delete mahoweekStorage.tasks[taskIndex].markers[markerIndex].completed;

					// Иначе удаляем метку полностью
					} else {
						mahoweekStorage.tasks[taskIndex].markers.splice(markerIndex, 1);
					}
				}

			// Если не существовало
			} else {
				// Если действие добавления
				if (markerAct == 'add') {
					// Добавляем метку только с информацией о выполнении
					mahoweekStorage.tasks[taskIndex].markers.push({
						date: taskDateToday,
						completed: 1
					});
				}
			}
		}

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Расчитываем прогресс
		makeProgress();
	});

}());



// Показываем поле для редактирования
//------------------------------------------------------------------------------

(function() {

	// Задаем данные
	var xy1 = 0;
	var xy2 = 0;

	// Определяем событие при нажатии
	var startEvent = $('body').hasClass('mobile') ? 'touchstart' : 'mousedown';

	// Старт события
	taskList.on(startEvent, '.task:not(.task--add) .task__name', function(e) {
		// Высчитываем сумму
		if (e.type == 'touchstart') {
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			xy1 = touch.pageX + touch.pageY;
		} else {
			xy1 = e.pageX + e.pageY;
		}

		// Убираем фокус в поле добавления дела
		taskList.find('.js-add-task').blur();
	});

	// Определяем событие при отпускании
	var endEvent = $('body').hasClass('mobile') ? 'touchend' : 'mouseup';

	// Конец события
	taskList.on(endEvent, '.task:not(.task--add) .task__name', function(e) {
		var isThis = $(this);

		// Высчитываем сумму
		if (e.type == 'touchend') {
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			xy2 = touch.pageX + touch.pageY;
		} else {
			xy2 = e.pageX + e.pageY;
		}

		// Если это была левая кнопка мышки
		if (e.type == 'mouseup' && e.which != 1) {
			// Прекращаем выполнение
			return false;
		}

		// Если это было явное действие для редактирования
		// и если это клик мышкой, то это должна быть левая кнопка
		if (xy1 == xy2) {
			// Если поля для редактирования еще нет
			if (!isThis.parents('.task').find('.task__input').length) {
				// Берем название дела
				var taskName = isThis.text();

				// Создаем поле
				isThis.html('<input class="task__input  js-edit-task" type="text" maxlength="100" value="">');

				// Вставляем текст дела и фокусируем
				isThis.parents('.task').find('.task__input').focus().val(taskName);

				// При расфокусировке
				isThis.parents('.task').find('.task__input').focusout(function() {
					// Заменяем поле редактирования на название дела
					isThis.text($(this).val());
				});
			}
		}
	});

}());



// Редактируем дело
//------------------------------------------------------------------------------

(function() {

	taskList.on('keyup change', '.js-edit-task', function(e) {
		var isThis = $(this);

		// Получаем хеш и текст дела
		var taskId = isThis.parents('.task').attr('data-id'),
			taskName = isThis.val();

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Получаем элемент дела в хранилище
		var taskElement = mahoweekStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в хранилище
		var taskIndex = mahoweekStorage.tasks.indexOf(taskElement[0]);

		// Получаем метку времени
		// var taskLastChange = new Date().getTime();

		// Изменяем текст дела
		// и помечаем время редактирования
		mahoweekStorage.tasks[taskIndex].name = taskName;
		// mahoweekStorage.tasks[taskIndex].lastChange = taskLastChange;

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Если был нажат Enter, то убираем фокус с этого поля
		if (e.keyCode == 13) {
			isThis.blur();
		}
	});

}());



// Удаляем дела
//------------------------------------------------------------------------------

(function() {

	taskList.on('click', '.js-remove-task', function() {
		var isThis = $(this);

		// Получаем хеш дела
		var taskId = isThis.parents('.task').attr('data-id');

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Получаем элемент дела в хранилище
		var taskElement = mahoweekStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в хранилище
		var taskIndex = mahoweekStorage.tasks.indexOf(taskElement[0]);

		// Удаляем дело
		mahoweekStorage.tasks.splice(taskIndex, 1);

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Удаляем дело из списка
		isThis.parents('.task').remove();

		// Если в списке не осталось дел
		if (taskList.find('.task:not(.task--add)').length == 0) {
			// Ставим фокус на добавление
			taskList.find('.js-add-task').focus();
		}

		// Расчитываем прогресс
		makeProgress();

		// Если не мобилка
		if (!$('body').hasClass('mobile') && taskList.find('.task--add').hasClass('task--fixed')) {
			// Определяем переменные
			var doc = $(window),
				docHeight = doc.height(),
				docScrollTop = doc.scrollTop(),
				taskListOffsetTop = taskList.offset().top,
				taskListHeight = taskList.height() - 1,
				taskAddHeight = taskList.find('.task--add').innerHeight();

			// Если реальная позиция блока добавления дела достигнута
			if (docScrollTop + docHeight - taskAddHeight > taskListOffsetTop + taskListHeight) {
				// Снимаем фиксирование
				taskList.find('.task--add').removeClass('task--fixed');
			}
		}
	});

}());



// Добавляем метку делу
//------------------------------------------------------------------------------

(function() {

	taskList.on('click', '.task:not(.task--completed) .js-marker-task:not(.grid__date--past):not(.grid__date--completed)', function() {
		var isThis = $(this);

		// Получаем хеш дела и дату
		var taskId = isThis.parents('.task').attr('data-id'),
			taskDate = isThis.attr('data-date');

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Получаем элемент дела в хранилище
		var taskElement = mahoweekStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в хранилище
		var taskIndex = mahoweekStorage.tasks.indexOf(taskElement[0]);

		// Если массива маркеров не существовало
		if (!mahoweekStorage.tasks[taskIndex].markers) {
			// Создаем такой и сразу заполняем
			mahoweekStorage.tasks[taskIndex].markers = [{
				date: taskDate,
				label: 'bull'
			}];

			// Добавляем метку для ячейки
			isThis.addClass('grid__date--bull');

		// Если существовало
		} else {
			// Проверяем существовала ли уже метка на это число
			var markerElement = mahoweekStorage.tasks[taskIndex].markers.filter(function(value) {
				return value.date == taskDate;
			});

			// Если существовала, то удаляем
			if (markerElement != '') {
				// Получаем индекс метки
				var markerIndex = mahoweekStorage.tasks[taskIndex].markers.indexOf(markerElement[0]);

				// Удаляем метку
				mahoweekStorage.tasks[taskIndex].markers.splice(markerIndex, 1);

				// Убираем метку для ячейки
				isThis.removeClass('grid__date--bull');

			// Иначе создаем новую
			} else {
				mahoweekStorage.tasks[taskIndex].markers.push({
					date: taskDate,
					label: 'bull'
				});

				// Добавляем метку для ячейки
				isThis.addClass('grid__date--bull');
			}
		}

		// Получаем метку времени
		// var taskLastChange = new Date().getTime();

		// Помечаем время редактирования
		// mahoweekStorage.tasks[taskIndex].lastChange = taskLastChange;

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));
	});

}());



// Сортируем вручную дела
//------------------------------------------------------------------------------

(function() {

	var taskListSortable = Sortable.create(document.querySelector('.list__tasks'), {
		delay: 200,
		animation: 0,
		filter: '.task--add, .task__input',
		preventOnFilter: false,
		ghostClass: 'task--ghost',
		chosenClass: 'task--chosen',
		dragClass: 'task--drag',
		scrollSensitivity: 80,
		onChoose: function() {
			// Добавляем класс сортировки
			taskList.addClass('list__tasks--drag');
		},
		onEnd: function(evt) {
			if (Number.isInteger(evt.oldIndex) && Number.isInteger(evt.newIndex) && evt.oldIndex != evt.newIndex) {
				// Парсим хранилище
				var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

				// Получаем удаленный элемент
				var taskRemove = mahoweekStorage.tasks.splice(evt.oldIndex, 1)[0];

				// Если элемент существует
				if (taskRemove !== undefined) {
					// Сортируем
					mahoweekStorage.tasks.splice(evt.newIndex, 0, taskRemove);

					// Обновляем хранилище
					localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

					// Удаляем класс сортировки
					taskList.removeClass('list__tasks--drag');

				// Если не существует
				} else {
					// Перезагружаем страницу
					// во избежание ошибок
					location.reload();
				}
			}
		}
	});

}());



// Генерируем хеш
//------------------------------------------------------------------------------

function makeHash() {

	// Определяем переменные
	var hash = '',
		possible = '0123456789abcdefghijklmnopqrstuvwxyz';

	// Генерируем
	for (var i = 0; i < 8; i ++) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	// Выводим
	return hash;

}



// Генерируем дело
//------------------------------------------------------------------------------

function makeTask(id, name, completed, markers) {

	// Определяем статус дела
	if (completed == 1) {
		var completed = ' task--completed';
	} else {
		var completed = '';
	}

	// Генерируем код
	return '' +
	'<div class="task' + completed + '" data-id="' + id + '">' +
		'<div class="task__status">' +
			'<div class="task__check  js-completed-task"></div>' +
		'</div>' +
		'<div class="task__name">' +
			name +
		'</div>' +
		'<div class="task__options">' +
			'<div class="task__trash  js-remove-task">' +
				'<svg>' +
					'<use xlink:href="#ei-trash-icon"></use>' +
				'</svg>' +
			'</div>' +
		'</div>' +
		'<div class="task__grid  grid">' +
			makeGrid('task', markers) +
		'</div>' +
	'</div>';

}
