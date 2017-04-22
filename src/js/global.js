// Global
//------------------------------------------------------------------------------

// Определяем мобилку
//------------------------------------------------------------------------------

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	$('body').addClass('mobile');

	var MOBILE = 1;
}



// Берем листы на доске
//------------------------------------------------------------------------------

var LIST_BOARD = $('.board__lists');



// Работаем с хранилищем
//------------------------------------------------------------------------------

// Если хранилища не существует
if (!localStorage.getItem('mahoweek')) {
	// Создаем данные для листа
	var listId = makeHash(),
		listName = 'Краткосрочный план дел',
		listCreatedTime = new Date().getTime();

	// Генерируем объект данных
	var mahoweekData = {
		lists: [
			{
				id: listId,
				name: listName,
				createdTime: listCreatedTime
			}
		],
		tasks: [],
		settings: {}
	}

	// Создаем хранилище
	localStorage.setItem('mahoweek', JSON.stringify(mahoweekData));
}



// Показываем поле для редактирования листа или дела при явном действии
//------------------------------------------------------------------------------

(function() {

	// Задаем первоначальные данные
	var xy1 = 0;
	var xy2 = 0;

	// Определяем событие при нажатии
	var startEvent = MOBILE ? 'touchstart' : 'mousedown';

	// Старт события
	LIST_BOARD.on(startEvent, '.js-name', function(e) {
		// Высчитываем сумму
		if (e.type == 'touchstart') {
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			xy1 = touch.pageX + touch.pageY;
		} else {
			xy1 = e.pageX + e.pageY;
		}

		// Убираем фокус из поля добавления дела
		LIST_BOARD.find('.js-add-task').blur();
	});

	// Определяем событие при отпускании
	var endEvent = MOBILE ? 'touchend' : 'mouseup';

	// Конец события
	LIST_BOARD.on(endEvent, '.js-name', function(e) {
		var isThis = $(this);

		// Высчитываем сумму
		if (e.type == 'touchend') {
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			xy2 = touch.pageX + touch.pageY;
		} else {
			xy2 = e.pageX + e.pageY;
		}

		// Если это была не левая кнопка мышки
		if (e.type == 'mouseup' && e.which != 1) {
			// Прекращаем выполнение
			return false;
		}

		// Если это было явное действие для редактирования
		if (xy1 == xy2) {
			// Если это лист и поля для редактирования еще нет
			if (isThis.hasClass('list__name') && !isThis.parents('.list').find('.list__input').length) {
				// Берем заголовок листа
				var listName = isThis.text();

				// Создаем поле для редактирования
				isThis.html('<input class="list__input  js-edit-list" type="text" maxlength="100" value="">');

				// Вставляем заголовок листа и фокусируем
				isThis.parents('.list').find('.list__input').focus().val(listName);

				// При расфокусировке
				isThis.parents('.list').find('.list__input').focusout(function() {
					// Заменяем поле редактирования на заголовок листа
					isThis.text($(this).val());
				});
			}

			// Если это дело и поля для редактирования еще нет
			if (isThis.hasClass('task__name') && !isThis.parents('.task').find('.task__input').length) {
				// Берем текст дела
				var taskName = isThis.text();

				// Создаем поле для редактирования
				isThis.html('<input class="task__input  js-edit-task" type="text" maxlength="100" value="">');

				// Вставляем текст дела и фокусируем
				isThis.parents('.task').find('.task__input').focus().val(taskName);

				// При расфокусировке
				isThis.parents('.task').find('.task__input').focusout(function() {
					// Заменяем поле редактирования на текст дела
					isThis.text($(this).val());
				});
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

	// Генерируем хеш
	for (var i = 0; i < 8; i ++) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	// Выводим хеш
	return hash;

}
