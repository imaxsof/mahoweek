// Task
//------------------------------------------------------------------------------

// Выводим дела в списки
//------------------------------------------------------------------------------

(function() {

	// Парсим хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Пробегаемся по каждому делу
	for (var i = 0; i < mahoweekStorage.tasks.length; i ++) {
		// Заносим дело в свой список
		LIST_BOARD.find('.list[data-id="' + mahoweekStorage.tasks[i].listId + '"] .task--add').before(makeTask(mahoweekStorage.tasks[i].id, mahoweekStorage.tasks[i].name, mahoweekStorage.tasks[i].completed, mahoweekStorage.tasks[i].markers));

		// Находим это дело
		var task = LIST_BOARD.find('.task[data-id="' + mahoweekStorage.tasks[i].id + '"]');

		// Если у этого дела есть метка на сегодняшний день и она не выполнена
		if (task.find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').length) {
			// Помечаем дело как сегодняшнее
			task.addClass('task--today');
		}
	}

	// Пробегаемся по каждому списку
	for (var i = 0; i < mahoweekStorage.lists.length; i ++) {
		// Рассчитываем прогресс выполнения списка
		makeProgress(mahoweekStorage.lists[i].id);
	}

	// Если окно приветствия не открыто
	if (window.location.hash != '#welcome') {
		// Показываем содержимое доски
		BOARD.addClass('board--load');
	}

}());



// Фокусируем поле добавления дела
//------------------------------------------------------------------------------

(function() {

	// Если поле добавления в фокусе
	LIST_BOARD.find('.js-add-task').focusin(function() {
		var isThis = $(this);

		// Ставим метку о фокусе
		isThis.parents('.task--add').addClass('task--focus');
	});

	// Если поле добавления не в фокусе
	LIST_BOARD.find('.js-add-task').focusout(function() {
		var isThis = $(this);

		// Снимаем метку о фокусе
		isThis.parents('.task--add').removeClass('task--focus');
	});

}());



// Добавляем дело
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('change', '.js-add-task', function() {
		var isThis = $(this);

		// Получаем хеш списка
		var listId = isThis.parents('.list').attr('data-id');

		// Получаем текст дела
		var taskName = isThis.val();

		// Получаем метку времени
		var taskCreatedTime = new Date().getTime();

		// Генерируем хеш дела
		var taskId = makeHash();

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Добавляем новое дело
		mahoweekStorage.tasks.push({
			id: taskId,
			listId: listId,
			name: taskName,
			createdTime: taskCreatedTime
		});

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Стираем поле ввода добавления дела
		isThis.val('');

		// Выводим дело в списке
		isThis.parents('.task--add').before(makeTask(taskId, taskName));

		// Рассчитываем прогресс выполнения списка
		makeProgress(listId);

		// Находим созданное дело
		var taskNew = isThis.parents('.task--add').prev();

		// Берем данные окна
		var win = $(window);

		// Если созданное дело вытесняет за рамки экрана конец списка
		if (taskNew.offset().top > win.scrollTop() + win.height() - 30 - 40 - 39) {
			// Смещаем позицию прокрутки на высоту строки дела
			$('body').scrollTop(win.scrollTop() + taskNew.outerHeight(true));
		}
	});

}());



// Изменяем статуса дела
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('click', '.js-completed-task', function() {
		var isThis = $(this),
			task = isThis.parents('.task');

		// Получаем хеш списка, хеш дела, метку о выполнении и дату текущего дня
		var listId = task.parents('.list').attr('data-id'),
			taskId = task.attr('data-id'),
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
			// Переключаем метку выполнения в сетке дат
			task.find('.grid__date--today').toggleClass('grid__date--completed');

			// Переключаем метку выполнения в хранилище
			if (task.find('.grid__date--today').hasClass('grid__date--completed')) {
				var markerAct = 'add';
			} else {
				var markerAct = 'del';
			}

			// Если дело не многоразовое
			if ((task.find('.grid__date--today').hasClass('grid__date--bull') && !task.find('.grid__date--today').nextAll('.grid__date--bull').length) || (!task.find('.grid__date--today').hasClass('grid__date--bull') && task.find('.grid__date--today').nextAll('.grid__date--bull').length <= 1)) {
				// Окончательно ставим метку выполнения в сетке дат и в хранилище
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
			// Убираем метку выполнения из сетки дат
			task.find('.grid__date--today').removeClass('grid__date--completed');

			// Убираем метку выполнения в хранилище
			var markerAct = 'del';

			// Помечаем дело как невыполненное
			delete mahoweekStorage.tasks[taskIndex].completed;
			delete mahoweekStorage.tasks[taskIndex].completedTime;

			// Обновляем дело в списке
			task.removeClass('task--completed');
		}

		// В итоге, если у дела есть метка на сегодняшний день и она не выполнена
		if (task.find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').length) {
			// Помечаем дело как сегодняшнее
			task.addClass('task--today');
		} else {
			// Помечаем сегодняшнее дело выполненным
			task.removeClass('task--today');
		}

		// Заносим изменения в массив маркеров
		// и если массива маркеров не существовало
		if (markerAct == 'add' && !mahoweekStorage.tasks[taskIndex].markers) {
			// Создаем массив маркеров и заполняем
			mahoweekStorage.tasks[taskIndex].markers = [{
				date: taskDateToday,
				completed: 1
			}];

		// Если существовало
		} else {
			// Проверяем существовала ли уже метка на это число в хранилище
			var markerElement = mahoweekStorage.tasks[taskIndex].markers.filter(function(value) {
				return value.date == taskDateToday;
			});

			// Если метка существовала
			if (markerElement != '') {
				// Получаем индекс метки
				var markerIndex = mahoweekStorage.tasks[taskIndex].markers.indexOf(markerElement[0]);

				// Если действие добавления метки
				if (markerAct == 'add') {
					// Добавляем информацию о выполнении
					mahoweekStorage.tasks[taskIndex].markers[markerIndex].completed = 1;

				// Если удаления метки
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

			// Если метка не существовала
			} else {
				// Если действие добавления метки
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

		// Рассчитываем прогресс выполнения списка
		makeProgress(listId);
	});

}());



// Редактируем текст дела
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('keyup change', '.js-edit-task', function(event) {
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

		// Изменяем текст дела
		mahoweekStorage.tasks[taskIndex].name = taskName;

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Если был нажат Enter, то убираем фокус с этого поля
		if (event.keyCode == 13) {
			isThis.blur();
		}
	});

}());



// Удаляем дело
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('click', '.js-remove-task', function() {
		var isThis = $(this);

		// Получаем хеш списке и хеш дела
		var listId = isThis.parents('.list').attr('data-id'),
			taskId = isThis.parents('.task').attr('data-id');

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

		// Рассчитываем прогресс выполнения списка
		makeProgress(listId);
	});

}());



// Сортируем вручную дела
//------------------------------------------------------------------------------

// (function() {

// 	LIST_BOARD.find('.list__tasks').each(function() {
// 		Sortable.create(this, {
// 			group: "name",
// 			delay: 200,
// 			animation: 0,
// 			filter: '.task--add, .task__input',
// 			preventOnFilter: false,
// 			ghostClass: 'task--ghost',
// 			chosenClass: 'task--chosen',
// 			dragClass: 'task--drag',
// 			scrollSensitivity: 80,
// 			onChoose: function() {
// 				// Добавляем класс сортировки
// 				LIST_BOARD.find('.list__tasks').addClass('list__tasks--drag');
// 			},
// 			onEnd: function(evt) {
// 				console.log(evt.oldIndex + ' ' + evt.newIndex);

// 				if (Number.isInteger(evt.oldIndex) && Number.isInteger(evt.newIndex) && evt.oldIndex != evt.newIndex) {
// 					// Парсим хранилище
// 					var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

// 					// Получаем удаленный элемент
// 					var taskRemove = mahoweekStorage.tasks.splice(evt.oldIndex, 1)[0];

// 					// Если элемент существует
// 					if (taskRemove !== undefined) {
// 						// Сортируем
// 						mahoweekStorage.tasks.splice(evt.newIndex, 0, taskRemove);

// 						// Обновляем хранилище
// 						localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

// 						// Удаляем класс сортировки
// 						LIST_BOARD.find('.list__tasks').removeClass('list__tasks--drag');

// 					// Если не существует
// 					} else {
// 						// Перезагружаем страницу
// 						// во избежание ошибок
// 						location.reload();
// 					}
// 				}
// 			}
// 		});
// 	});

// }());



// Обрабатываем строку с делом
//------------------------------------------------------------------------------

function remakeTaskName(name) {

	var remakeName = name;

	// Превращаем урл в ссылку
	if (/https:\/\/mahoweek\.ru\/#/.test(name)) {
		remakeName = remakeName.replace(/(https:\/\/)(mahoweek\.ru\/#)([\S]+[^ ,\.!])/ig, '<a href="#$3" class="cartonbox" data-cb-type="inline" data-cb-hash="$3"><span class="hidden">$1</span>$2$3</a>');
	} else {
		remakeName = remakeName.replace(/(http(s)?:\/\/(www\.)?)([\S]+[^ ,\.!])/ig, '<a href="$1$4" class="js-link-task" target="_blank" rel="noopener noreferrer"><span class="hidden">$1</span>$4</a>');
	}

	// Выводим преобразованную строку
	return remakeName;

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
		'<div class="task__wrap">' +
			'<div class="task__status">' +
				'<div class="task__check  js-completed-task"></div>' +
			'</div>' +
			'<div class="task__name  js-name">' +
				remakeTaskName(name) +
			'</div>' +
			'<div class="task__options">' +
				'<div class="task__trash  js-remove-task">' +
					'<svg>' +
						'<use xlink:href="#icon-trash"></use>' +
					'</svg>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="task__grid  grid">' +
			makeGrid('task', markers) +
		'</div>' +
	'</div>';

}
