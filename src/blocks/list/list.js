// List
//------------------------------------------------------------------------------

// Выводим списки на доске
//------------------------------------------------------------------------------

function loadList() {

	// Начинаем генерировать списки
	var listBoardCreate = '';

	// Парсим Хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mwStorage'));

	// Пробегаемся по каждому списку
	for (var i = 0; i < mahoweekStorage.lists.length; i ++) {
		listBoardCreate += makeList(mahoweekStorage.lists[i].id, mahoweekStorage.lists[i].name);
	}

	// Выводим списки
	LIST_BOARD.prepend(listBoardCreate);

	// Выводим сетку дат в шапку существующих списков
	// и в строки добавления дела
	LIST_BOARD.find('.list__grid').html(makeGrid('list'));
	LIST_BOARD.find('.task__grid').html(makeGrid('add-task'));

	// Включаем сортировку списков
	sortableList();

}


// Добавляем список
//------------------------------------------------------------------------------

(function($) {

	$('.js-add-list').on('click', function() {
		// Создаем данные для списка
		var listId = makeHash();
		var listName = 'Краткосрочный план дел №' + (LIST_BOARD.find('.list').length + 1);
		var listCreatedTime = new Date().getTime();

		// Парсим Хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mwStorage'));

		// Добавляем новый список
		mahoweekStorage.lists.push({
			id: listId,
			name: listName,
			createdTime: listCreatedTime
		});

		// Обновляем Хранилище
		updateStorage(mahoweekStorage);

		// Выводим список на доске
		LIST_BOARD.append(makeList(listId, listName));

		// Находим созданный список
		var listNew = LIST_BOARD.find('.list:last-child');

		// Включаем сортировку дел
		sortableTask(document.querySelector('.list:last-child .list__tasks'));

		// Выводим сетку дат в шапку созданного списка
		// и в строку добавления дела
		listNew.find('.list__grid').html(makeGrid('list'));
		listNew.find('.task__grid').html(makeGrid('add-task'));

		// Показываем поле редактирования имени списка
		listNew.find('.js-name').trigger('mouseup', ['run']);

		// Берем данные окна
		var win = $(window);

		// Если созданный список выходит за рамки видимости
		if (listNew.offset().top > win.scrollTop() + win.height() - 30 - 80) {
			// Смещаем позицию прокрутки до созданного списка
			$('body, html').stop().animate({
				scrollTop: listNew.offset().top
			}, SPEED);
		}
	});

}(jQuery));


// Сохраняем заголовок списка при изменении
//------------------------------------------------------------------------------

(function($) {

	LIST_BOARD.on('keyup change', '.js-edit-list', function(event) {
		var isThis = $(this);

		// Если был нажат Enter или пропал фокус и были изменения
		if (event.keyCode == 13 || event.type == 'change') {
			// Получаем объект списка, его хеш и заголовок
			var list = isThis.parents('.list');
			var listId = list.attr('data-id');
			var listName = isThis.val();

			// Парсим Хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mwStorage'));

			// Получаем элемент списка в Хранилище
			var listElement = mahoweekStorage.lists.filter(function(value) {
				return value.id == listId;
			});

			// Получаем индекс списка в Хранилище
			var listIndex = mahoweekStorage.lists.indexOf(listElement[0]);

			// Изменяем заголовок списка
			mahoweekStorage.lists[listIndex].name = listName;

			// Обновляем Хранилище
			updateStorage(mahoweekStorage);

			// Если в списке нет ни одного дела
			if (list.find('.list__tasks .task').length == 0) {
				// Ставим фокус в поле добавления дел в созданном списке
				list.find('.js-add-task').focus();
			} else {
				// Убираем фокус с этого поля
				isThis.blur();
			}
		}
	});

}(jQuery));


// Удаляем список
//------------------------------------------------------------------------------

(function($) {

	LIST_BOARD.on('click', '.js-remove-list', function() {
		var isThis = $(this);

		// Получаем объект списка, его хеш и кол-во дел
		var list = isThis.parents('.list');
		var listId = list.attr('data-id');
		var taskTotal = list.find('.list__tasks .task').length;

		// Если в удаляемом списке были дела
		if (taskTotal) {
			// Задаем вопрос
			var question = confirm('При удалении списка, все дела, находящиеся в нём, так же будут удалены');
		}

		// Если в списке не было дел
		// или ответом на вопрос было «Да»
		if (!taskTotal || question) {
			// Парсим Хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mwStorage'));

			// Получаем элемент списка в Хранилище
			var listElement = mahoweekStorage.lists.filter(function(value) {
				return value.id == listId;
			});

			// Получаем индекс списка в Хранилище
			var listIndex = mahoweekStorage.lists.indexOf(listElement[0]);

			// Удаляем список
			mahoweekStorage.lists.splice(listIndex, 1);

			// Если в удаляемом списке были дела
			if (taskTotal) {
				// Готовим новый массив для дел
				var tasksNew = [];

				// Помещаем в него те дела, которые не надо удалять
				for (var i = 0; i < mahoweekStorage.tasks.length; i ++) {
					if (mahoweekStorage.tasks[i].listId != listId) {
						tasksNew.push(mahoweekStorage.tasks[i]);
					}
				}

				// Заменяем старый массив дел на новый с удаленными делами
				mahoweekStorage.tasks = tasksNew;
			}

			// Обновляем Хранилище
			updateStorage(mahoweekStorage);

			// Удаляем список из доски
			list.remove();

			// Меняем фавиконку
			changeFavicon();
		}
	});

}(jQuery));


// Сортируем вручную списки
//------------------------------------------------------------------------------

function sortableList() {

	Sortable.create(document.querySelector('.board__lists'), {
		delay: SPEED,
		animation: SPEED,
		handle: '.list__name',
		filter: '.list__input',
		preventOnFilter: false,
		ghostClass: 'list--ghost',
		chosenClass: 'list--chosen',
		dragClass: 'list--drag',
		forceFallback: true,
		fallbackClass: 'list--fallback',
		fallbackOnBody: true,
		scrollSensitivity: 100,
		onChoose: function() {
			// Добавляем класс, что выполняется сортировка
			LIST_BOARD.addClass('board__lists--drag');
		},
		onEnd: function() {
			// Удаляем класс, что выполняется сортировка
			LIST_BOARD.removeClass('board__lists--drag');
		},
		onSort: function(event) {
			// Парсим Хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mwStorage'));

			// Получаем удаленный элемент
			var listRemove = mahoweekStorage.lists.splice(event.oldIndex, 1)[0];

			// Сортируем
			mahoweekStorage.lists.splice(event.newIndex, 0, listRemove);

			// Обновляем Хранилище
			updateStorage(mahoweekStorage);
		}
	});

}


// Форматируем заголовок списка
//------------------------------------------------------------------------------

function remakeListName(name) {

	var remakeName = name;

	// Работаем с УРЛ
	if (/https:\/\/mahoweek\.com\/#/.test(name)) {
		remakeName = remakeName.replace(/(https:\/\/)(mahoweek\.com\/#)([\S]+[^ ,\.!])/ig, '<a href="#$3" class="cartonbox" data-cb-type="inline" data-cb-hash="$3"><span class="hidden">$1</span>$2$3</a>');
	} else {
		remakeName = remakeName.replace(/(http(s)?:\/\/(www\.)?)([\S]+[^ ,\.!])/ig, '<a href="$1$4" class="js-link-task" target="_blank" rel="noopener noreferrer"><span class="hidden">$1</span>$4</a>');
	}

	// Выводим отформатированный заголовок
	return remakeName;

}


// Генерируем прогресс списка
//------------------------------------------------------------------------------

function makeProgress(id) {

	// Считаем общее кол-во дел
	var taskTotal = LIST_BOARD.find('.list[data-id="' + id + '"] .list__tasks .task').length;

	// Считаем кол-во выполненных дел
	var taskCompleted = LIST_BOARD.find('.list[data-id="' + id + '"] .task--completed').length;

	// Высчитываем прогресс
	if (taskTotal > 0) {
		var progress = taskCompleted * 100 / taskTotal / 100;
	} else {
		var progress = 0;
	}

	// Выводим прогресс
	LIST_BOARD.find('.list[data-id="' + id + '"] .list__progress').css({
		'-webkit-transform': 'scaleX(' + progress + ')',
		'transform': 'scaleX(' + progress + ')'
	});

}


// Генерируем списки
//------------------------------------------------------------------------------

function makeList(id, name) {

	// Генерируем код
	return '' +
	'<section class="list" data-id="' + id + '">' +
		'<div class="list__head">' +
			'<div class="list__wrap">' +
				'<div class="list__name  js-name">' +
					remakeListName(name) +
				'</div>' +
				'<div class="list__options">' +
					'<button type="button" class="list__trash  js-remove-list" aria-label="Удалить">' +
						'<svg>' +
							'<use xlink:href="#icon-trash"></use>' +
						'</svg>' +
					'</button>' +
				'</div>' +
				'<div class="list__progress"></div>' +
			'</div>' +
			'<div class="list__grid  grid"></div>' +
		'</div>' +
		'<div class="list__tasks"></div>' +
		'<div class="list__foot">' +
			'<div class="task  task--add">' +
				'<div class="task__wrap">' +
					'<label class="task__status" for="' + id + '-add-task" aria-label="Дело">' +
						'<div class="task__plus">' +
							'<svg>' +
								'<use xlink:href="#icon-plus"></use>' +
							'</svg>' +
						'</div>' +
					'</label>' +
					'<div class="task__name">' +
						'<input id="' + id + '-add-task" class="task__input  js-add-task" type="text" maxlength="255">' +
					'</div>' +
				'</div>' +
				'<div class="task__grid  grid"></div>' +
			'</div>' +
		'</div>' +
	'</section>';

}
