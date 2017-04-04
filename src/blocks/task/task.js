// Task
//------------------------------------------------------------------------------

// Назначаем глобальные переменные
var taskList = $('.list__tasks');



// Выводим список дел
//------------------------------------------------------------------------------

(function() {

	// Парсим хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Генерируем список
	var taskListCreate = '';

	// Пробегаемся по каждому делу
	for (var i = 0; i < mahoweekStorage.tasks.length; i ++) {
		// Создаем строку с делом
		taskListCreate += makeTask(mahoweekStorage.tasks[i].id, mahoweekStorage.tasks[i].name, mahoweekStorage.tasks[i].completed);
	}

	// Выводим список
	taskList.prepend(taskListCreate);

	// Расчитываем прогресс
	makeProgress();

}());



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
		var isThis = $(this);

		// Получаем хеш дела и метку о выполнении
		var taskId = isThis.parents('.task').attr('data-id'),
			taskCompleted = isThis.parents('.task').attr('data-completed');

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
			// Получаем метку времени
			var taskCompletedTime = new Date().getTime();

			// Помечаем дело как выполненное
			mahoweekStorage.tasks[taskIndex].completed = 1;
			mahoweekStorage.tasks[taskIndex].completedTime = taskCompletedTime;

			// Обновляем дело в списке
			isThis.parents('.task').attr('data-completed', 1);

		// Если дело было выполнено
		} else {
			// Помечаем дело как невыполненное
			delete mahoweekStorage.tasks[taskIndex].completed;
			delete mahoweekStorage.tasks[taskIndex].completedTime;

			// Обновляем дело в списке
			isThis.parents('.task').removeAttr('data-completed');
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
		var taskLastChange = new Date().getTime();

		// Изменяем текст дела
		mahoweekStorage.tasks[taskIndex].name = taskName;
		mahoweekStorage.tasks[taskIndex].lastChange = taskLastChange;

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

function makeTask(id, name, completed) {

	// Определяем статус дела
	if (completed == 1) {
		var completed = ' data-completed="1"';
	} else {
		var completed = '';
	}

	// Генерируем код
	return '' +
	'<div class="task" data-id="' + id + '"' + completed + '>' +
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
	'</div>';

}
