// Task
//------------------------------------------------------------------------------

var taskList = $('.list__tasks');



// Генератор хеша
//------------------------------------------------------------------------------

function makeHash() {
	var hash = '',
		possible = '0123456789abcdefghijklmnopqrstuvwxyz';

	for (var i = 0; i < 8; i ++) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}

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
			'<input class="task__input  js-edit-task" type="text" value="' + name + '">' +
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



// Выводим список дел
//------------------------------------------------------------------------------

(function() {

	// Парсим хранилище
	var doshoStorage = JSON.parse(localStorage.getItem('dosho'));

	// Генерируем список
	var taskListCreate = '';

	// Пробегаемся по каждому делу
	for (var i = 0; i < doshoStorage.tasks.length; i ++) {
		// Создаем строку с делом
		taskListCreate += makeTask(doshoStorage.tasks[i].id, doshoStorage.tasks[i].name, doshoStorage.tasks[i].completed);
	}

	// Выводим список
	taskList.prepend(taskListCreate);

	// Расчитываем прогресс
	makeProgress();

}());



// Изменяем статуса дела
//------------------------------------------------------------------------------

(function() {

	taskList.on('click', '.js-completed-task', function() {
		// Получаем данные
		var isThis = $(this),
			taskId = isThis.parents('.task').attr('data-id'),
			taskCompleted = isThis.parents('.task').attr('data-completed');

		// Парсим хранилище
		var doshoStorage = JSON.parse(localStorage.getItem('dosho'));

		// Получаем элемент дела в хранилище
		var taskElement = doshoStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в хранилище
		var taskIndex = doshoStorage.tasks.indexOf(taskElement[0]);

		// Если дело не выполнено
		if (!taskCompleted) {
			// Получаем метку времени
			var date = new Date(),
				taskCompletedTime = date.getTime();

			// Помечаем дело как выполненное
			doshoStorage.tasks[taskIndex].completed = 1;
			doshoStorage.tasks[taskIndex].completedTime = taskCompletedTime;

			// Обновляем дело в списке
			isThis.parents('.task').attr('data-completed', 1);

		// Если дело было выполнено
		} else {
			// Помечаем дело как невыполненное
			delete doshoStorage.tasks[taskIndex].completed;
			delete doshoStorage.tasks[taskIndex].completedTime;

			// Обновляем дело в списке
			isThis.parents('.task').removeAttr('data-completed');
		}

		// Обновляем хранилище
		localStorage.setItem('dosho', JSON.stringify(doshoStorage));

		// Расчитываем прогресс
		makeProgress();
	});

}());



// Удаление дела
//------------------------------------------------------------------------------

(function() {

	taskList.on('click', '.js-remove-task', function() {
		// Получаем данные
		var isThis = $(this),
			taskId = isThis.parents('.task').attr('data-id');

		// Парсим хранилище
		var doshoStorage = JSON.parse(localStorage.getItem('dosho'));

		// Получаем элемент дела в хранилище
		var taskElement = doshoStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в хранилище
		var taskIndex = doshoStorage.tasks.indexOf(taskElement[0]);

		// Удаляем дело
		doshoStorage.tasks.splice(taskIndex, 1);

		// Обновляем хранилище
		localStorage.setItem('dosho', JSON.stringify(doshoStorage));

		// Удаляем дело из списка
		isThis.parents('.task').remove();

		// Если в списке не осталось дел
		if (taskList.find('.task:not(.task--add)').length == 0) {
			// Ставим фокус на добавление
			$('.js-add-task').focus();
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



// Редактирование дела
//------------------------------------------------------------------------------

(function() {

	taskList.on('keyup change', '.js-edit-task', function(e) {
		// Получаем данные
		var isThis = $(this),
			taskId = isThis.parents('.task').attr('data-id'),
			taskName = isThis.val();

		// Парсим хранилище
		var doshoStorage = JSON.parse(localStorage.getItem('dosho'));

		// Получаем элемент дела в хранилище
		var taskElement = doshoStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в хранилище
		var taskIndex = doshoStorage.tasks.indexOf(taskElement[0]);

		// Получаем метку времени
		var date = new Date(),
			taskLastChange = date.getTime();

		// Изменяем текст дела
		doshoStorage.tasks[taskIndex].name = taskName;
		doshoStorage.tasks[taskIndex].lastChange = taskLastChange;

		// Обновляем хранилище
		localStorage.setItem('dosho', JSON.stringify(doshoStorage));

		// Если был нажат Enter, то убираем фокус с этого поля
		if (e.keyCode == 13) {
			isThis.blur();
		}
	});

}());



// Добавление дела
//------------------------------------------------------------------------------

(function() {

	$('.js-add-task').on('change', function() {
		// Получаем данные
		var isThis = $(this),
			taskName = isThis.val();

		// Получаем метку времени
		var date = new Date(),
			taskCreatedTime = date.getTime();

		// Генерируем хеш
		var taskId = makeHash();

		// Парсим хранилище
		var doshoStorage = JSON.parse(localStorage.getItem('dosho'));

		// Добавляем новое дело
		doshoStorage.tasks.push({
			id: taskId,
			name: taskName,
			createdTime: taskCreatedTime,
		});

		// Обновляем хранилище
		localStorage.setItem('dosho', JSON.stringify(doshoStorage));

		// Стираем поле ввода
		isThis.val('');

		// Выводим дело в списке
		taskList.find('.task--add').before(makeTask(taskId, taskName));

		// Расчитываем прогресс
		makeProgress();

		// Если не мобилка
		if (!$('body').hasClass('mobile')) {
			// Прижимаем прокрутку к низу экрана
			$('body').scrollTop(1000000);
		}
	});

}());



// Фиксирование блока добавления дела
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

		// Скроллим
		doc.on('scroll', function() {
			// Смотрим где сейчас скролл
			docScrollTop = doc.scrollTop();

			// Могло измениться
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



// Фокусировка поля добавления дела
//------------------------------------------------------------------------------

// Если не мобилка
if (!$('body').hasClass('mobile')) {
	// Ставим фокус
	$('.js-add-task').focus();
}

// Если поле добавления в фокусе
$('.js-add-task').focusin(function() {
	taskList.find('.task--add').addClass('task--focus');
});

// Если поле добавления не в фокусе
$('.js-add-task').focusout(function() {
	taskList.find('.task--add').removeClass('task--focus');
});
