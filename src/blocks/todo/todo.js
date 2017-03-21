// Генерируем ячейки календаря
//------------------------------------------------------------------------------

// var todoWeek = '<ul class="todo__week">';

// for ( var i = 0; i < 14; i ++ ) {
// 	todoWeek += '<li class="todo__date"></li>';
// }

// todoWeek += '</ul>';



// Генерируем дело
//------------------------------------------------------------------------------

function todoItem(id, note, status) {
	// Определяем статус дела
	if (status && status != '') {
		var status = status;
	} else {
		var status = '';
	}

	// Генерируем код
	return '' +
	'<div class="todo__item" data-id="' + id + '" data-status="' + status + '">' +
		'<div class="todo__status">' +
			'<div class="todo__done  js-toggle-status  js-status-done">' +
				'<svg>' +
					'<use xlink:href="#ei-check-icon"></use>' +
				'</svg>' +
			'</div>' +
		'</div>' +
		'<div class="todo__name">' +
			note +
		'</div>' +
		'<div class="todo__option">' +
			'<div class="todo__remove  js-remove-todo">' +
				'<svg>' +
					'<use xlink:href="#ei-trash-icon"></use>' +
				'</svg>' +
			'</div>' +
		'</div>' +
		// todoWeek +
	'</div>';
}



// Выводим список дел
//------------------------------------------------------------------------------

(function() {

	// Получаем список дел
	var todoStorage = localStorage.getItem('todo');

	// Если список есть и он не пуст
	if (todoStorage && todoStorage != '') {
		// Парсим
		todoStorage = JSON.parse(todoStorage);

		// Генерируем список
		var todoList = '';

		// Пробегаемся по каждому делу
		for (var key in todoStorage) {
			// Создаем строку с делом
			todoList += todoItem(key, todoStorage[key].note, todoStorage[key].status);
		}

		// Выводим список
		$('.todo').prepend(todoList);
	}

}());



// Изменяем статуса дела
//------------------------------------------------------------------------------

(function() {

	$('.todo').on('click', '.js-toggle-status', function() {
		// Получаем данные
		var isThis = $(this),
			todoId = isThis.parents('.todo__item').attr('data-id'),
			todoStatus = isThis.parents('.todo__item').attr('data-status');

		// Парсим список дел
		var todoStorage = JSON.parse(localStorage.getItem('todo'));

		// Определяем новый статус
		if (isThis.hasClass('js-status-done') && todoStatus == '') {
			var newStatus = 'done';
		} else {
			var newStatus = '';
		}

		// Изменяем статус дела
		todoStorage[todoId].status = newStatus;

		// Обновляем дела в LocalStorage
		localStorage.setItem('todo', JSON.stringify(todoStorage));

		// Обновляем дело в списке
		isThis.parents('.todo__item').attr('data-status', newStatus);
	});

}());



// Удаление дела
//------------------------------------------------------------------------------

(function() {

	$('.todo').on('click', '.js-remove-todo', function() {
		// Получаем данные
		var isThis = $(this),
			todoId = isThis.parents('.todo__item').attr('data-id');

		// Парсим список дел
		var todoStorage = JSON.parse(localStorage.getItem('todo'));

		// Удаляем дело
		delete todoStorage[todoId]

		// Обновляем дела в LocalStorage
		localStorage.setItem('todo', JSON.stringify(todoStorage));

		// Удаляем дело из списка
		isThis.parents('.todo__item').remove();

		// Если в списке не осталось дел, то ставим фокус на добавление
		if ($('.todo__item:not(.todo__item--add)').length == 0) {
			$('.js-add-todo').focus();
		}
	});

}());



// Добавление дела
//------------------------------------------------------------------------------

(function() {

	$('.js-add-todo').focus().on('change', function() {
		// Получаем данные
		var isThis = $(this),
			todoNote = isThis.val();

		// Получаем метку времени
		var date = new Date(),
			todoCreatedTime = date.getTime();

		// Получаем список дел
		var todoStorage = localStorage.getItem('todo');

		// Если список есть и он не пуст
		if (todoStorage && todoStorage != '') {
			// Парсим
			todoStorage = JSON.parse(todoStorage);

		// Если списка нет или он пуст
		} else {
			// Создаем объект
			todoStorage = {};
		}

		// Добавляем новое дело
		todoStorage[todoCreatedTime] = {
			note: todoNote,
			status: ''
		};

		// Обновляем в LocalStorage
		localStorage.setItem('todo', JSON.stringify(todoStorage));

		// Стираем поле ввода
		isThis.val('');

		// Выводим дело в списке
		$('.todo__item--add').before(todoItem(todoCreatedTime, todoNote));

		// Прижимаем прокрутку к низу экрана
		$('body').scrollTop(1000000);
	});

}());
