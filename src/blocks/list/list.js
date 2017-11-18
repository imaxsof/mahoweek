// List
//------------------------------------------------------------------------------

// Выводим списки на доске
//------------------------------------------------------------------------------

function loadList() {

	// Начинаем генерировать списки
	var listBoardCreate = '';

	// Парсим Хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Пробегаемся по каждому списку
	for (var i = 0; i < mahoweekStorage.lists.length; i ++) {
		listBoardCreate += makeList(mahoweekStorage.lists[i].id, mahoweekStorage.lists[i].name);
	}

	// Выводим списки
	LIST_BOARD.prepend(listBoardCreate);

	// Выводим сетку дат в шапку существующих списков
	// и в строки добавления дела
	LIST_BOARD.find('.list__grid').html(makeGrid('list'));
	LIST_BOARD.find('.task__grid').html(makeGrid());

}



// Добавляем список
//------------------------------------------------------------------------------

(function() {

	$('.js-add-list').on('click', function() {
		// Создаем данные для списка
		var listId = makeHash(),
			listName = 'Краткосрочный план дел №' + (LIST_BOARD.find('.list').length + 1),
			listCreatedTime = new Date().getTime();

		// Парсим Хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

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

		// Выводим сетку дат в шапку созданного списка
		// и в строку добавления дела
		listNew.find('.list__grid').html(makeGrid('list'));
		listNew.find('.task__grid').html(makeGrid());

		// Показываем поле редактирования имени списка
		listNew.find('.js-name').trigger('mouseup', ['run']);

		// Берем данные окна
		var win = $(window);

		// Если созданный список выходит за рамки видимости
		if (listNew.offset().top > win.scrollTop() + win.height() - 30 - 80) {
			// Смещаем позицию прокрутки до созданного списка
			win.scrollTop(listNew.offset().top);
		}
	});

}());



// Сохраняем заголовок списка при изменении
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('keyup change', '.js-edit-list', function(event) {
		var isThis = $(this);

		// Если был нажат Enter или пропал фокус и были изменения
		if (event.keyCode == 13 || event.type == 'change') {
			// Получаем объект списка, его хеш и заголовок
			var list = isThis.parents('.list'),
				listId = list.attr('data-id'),
				listName = isThis.val();

			// Парсим Хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

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
			if (list.find('.task:not(.task--add)').length == 0) {
				// Ставим фокус в поле добавления дел в созданном списке
				list.find('.js-add-task').focus();
			} else {
				// Убираем фокус с этого поля
				isThis.blur();
			}
		}
	});

}());



// Удаляем список
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('click', '.js-remove-list', function() {
		var isThis = $(this);

		// Получаем хеш списка и кол-во дел в нем
		var listId = isThis.parents('.list').attr('data-id'),
			taskTotal = isThis.parents('.list').find('.task:not(.task--add)').length;

		// Если в удаляемом списке были дела
		if (taskTotal) {
			// Задаем вопрос
			var question = confirm('При удалении списка, все дела, находящиеся в нём, так же будут удалены.');
		}

		// Если в списке не было дел
		// или ответом на вопрос было «Да»
		if (!taskTotal || question) {
			// Парсим Хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

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
			isThis.parents('.list').remove();

			// Меняем фавиконку
			changeFavicon();
		}
	});

}());



// Сортируем вручную списки
//------------------------------------------------------------------------------

(function() {

	var sortableDelay = MOBILE ? 200 : 0;

	Sortable.create(document.querySelector('.board__lists'), {
		delay: sortableDelay,
		animation: 300,
		handle: '.list__name',
		filter: '.list__input',
		preventOnFilter: false,
		ghostClass: 'list--ghost',
		chosenClass: 'list--chosen',
		dragClass: 'list--drag',
		scrollSensitivity: 80,
		onClone: function() {
			// Добавляем класс сортировки
			LIST_BOARD.addClass('board__lists--drag');
		},
		onEnd: function(evt) {
			if (Number.isInteger(evt.oldIndex) && Number.isInteger(evt.newIndex) && evt.oldIndex >= 0 && evt.newIndex >= 0 && evt.oldIndex != evt.newIndex) {
				// Парсим Хранилище
				var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

				// Проверяем присутствуют ли сортируемые списки в Хранилище
				if (mahoweekStorage.lists[evt.oldIndex] !== undefined && mahoweekStorage.lists[evt.newIndex] !== undefined) {
					// Получаем удаленный элемент
					var listRemove = mahoweekStorage.lists.splice(evt.oldIndex, 1)[0];

					// Сортируем
					mahoweekStorage.lists.splice(evt.newIndex, 0, listRemove);

					// Обновляем Хранилище
					updateStorage(mahoweekStorage);

				// Если не присутствуют
				} else {
					// Перезагружаем страницу во избежание ошибок
					window.location.reload(true);
				}
			}

			// Удаляем класс сортировки
			LIST_BOARD.removeClass('board__lists--drag');
		}
	});

}());



// Форматируем заголовок списка
//------------------------------------------------------------------------------

function remakeListName(name) {

	var remakeName = name;

	// Работаем с УРЛ
	if (/https:\/\/mahoweek\.ru\/#/.test(name)) {
		remakeName = remakeName.replace(/(https:\/\/)(mahoweek\.ru\/#)([\S]+[^ ,\.!])/ig, '<a href="#$3" class="cartonbox" data-cb-type="inline" data-cb-hash="$3"><span class="hidden">$1</span>$2$3</a>');
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
	var taskTotal = LIST_BOARD.find('.list[data-id="' + id + '"] .task:not(.task--add)').length;

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
					'<button class="list__trash  js-remove-list" aria-label="Удалить список">' +
						'<svg>' +
							'<use xlink:href="#icon-trash"></use>' +
						'</svg>' +
					'</button>' +
				'</div>' +
				'<div class="list__progress"></div>' +
			'</div>' +
			'<div class="list__grid  grid"></div>' +
		'</div>' +
		'<div class="list__tasks">' +
			'<label class="task  task--add" aria-label="Дело">' +
				'<div class="task__wrap">' +
					'<div class="task__status">' +
						'<div class="task__plus">' +
							'<svg>' +
								'<use xlink:href="#icon-plus"></use>' +
							'</svg>' +
						'</div>' +
					'</div>' +
					'<div class="task__name">' +
						'<input class="task__input  js-add-task" type="text" maxlength="255">' +
					'</div>' +
				'</div>' +
				'<div class="task__grid  grid"></div>' +
			'</label>' +
		'</div>' +
	'</section>';

}
