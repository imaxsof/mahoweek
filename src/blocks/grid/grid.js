// Grid
//------------------------------------------------------------------------------

// Добавляем метку
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('click', '.task:not(.task--completed) .js-marker-task:not(.grid__date--past):not(.grid__date--completed)', function() {
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
			// Создаем массив маркеров и заполняем
			mahoweekStorage.tasks[taskIndex].markers = [{
				date: taskDate,
				label: 'bull'
			}];

			// Добавляем метку в сетку дат
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

				// Убираем метку из сетки дат
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

		// В итоге, если дела есть невыполненные метки за прошедшие дни
		// и если дело не было выполненным сегодня,
		// а так же если последняя метка точно о пропуске
		if (isThis.parents('.task').find('.grid__date.grid__date--past.grid__date--bull:not(.grid__date--completed)').length && !isThis.parents('.task').find('.grid__date.grid__date--today.grid__date--completed').length && isThis.parents('.task').find('.grid__date.grid__date--past.grid__date--bull:not(.grid__date--completed):last').index() > isThis.parents('.task').find('.grid__date.grid__date--past.grid__date--completed:last').index()) {
			// Помечаем дело как невыполненное
			isThis.parents('.task').addClass('task--past');
		} else {
			// Размечаем дело как невыполненное
			isThis.parents('.task').removeClass('task--past');
		}

		// В итоге, если у дела есть метка на любой будущий день
		if (isThis.parents('.task').find('.grid__date:not(.grid__date--past):not(.grid__date--completed).grid__date--bull').length) {
			// Помечаем дело как намеченное
			isThis.parents('.task').addClass('task--bull');
		} else {
			// Размечаем дело как намеченное
			isThis.parents('.task').removeClass('task--bull');
		}

		// А так же, если у дела есть метка на сегодняшний день и она не выполнена
		if (isThis.parents('.task').find('.grid__date--today.grid__date--bull:not(.grid__date--completed)').length) {
			// Помечаем дело как сегодняшнее
			isThis.parents('.task').addClass('task--today');
		} else {
			// Размечаем дело как сегодняшнее
			isThis.parents('.task').removeClass('task--today');
		}

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Меняем фавиконку
		changeFavicon();
	});

}());



// Генерируем сетку дат
//------------------------------------------------------------------------------

function makeGrid(type, data) {
	// Получаем метку реального времени
	var date = new Date();

	// Вычисляем номер дня
	var number = date.getDay();

	// Делаем воскресенье номером 7
	if (number == 0) {
		number = 7;
	}

	// Делаем по умолчанию день прошедший
	var past = 1;

	// Работаем с data
	if (data) {
		// Создаем объект с метками
		var markerList = {};

		// Добавляем метки в объект
		for (var i = 0; i < data.length; i ++) {
			var key = data[i].date;
			markerList[key] = data[i].label + '|' + (data[i].completed ? 1 : 0);
		}
	}

	// Начинаем генерировать дни
	var grid = '';

	// Генерируем каждый день
	// причем сдвигаем дни недели если неделя закончилась
	for (var i = 1 - number; i <= 14 - number; i ++) {
		// Определяем переменные
		var dateClass = '',
			newDate = new Date(),
			time = newDate.setDate(date.getDate() + i),
			day = newDate.getDate(time),        // число
			month = newDate.getMonth(time) + 1, // месяц
			year = newDate.getFullYear(time),   // год
			newNumber = newDate.getDay(),       // номер дня
			dataDate = (day < 10 ? '0' + day : day) + '.' + (month < 10 ? '0' + month : month) + '.' + year;

		// Делаем воскресенье номером 7
		if (newNumber == 0) {
			newNumber = 7;
		}

		// Определяем текущий день
		if (date.getDate() == day) {
			dateClass += ' grid__date--today';

			// Меняем все последующие дни на непрошедшие
			past = 0;
		}

		// Определяем прошедшие дни
		if (past) {
			dateClass += ' grid__date--past';
		}

		// Определяем выходные
		if (newNumber == 6 || newNumber == 7) {
			dateClass += ' grid__date--holiday';
		}

		// Если это дело
		if (type == 'task') {
			dateClass += ' js-marker-task';

			// Если у дела есть метки
			if (markerList) {
				// Смотрим есть ли метка на этот день
				if (dataDate in markerList) {
					// Смотрим есть ли конкретно метка
					if (markerList[dataDate].split('|')[0] == 'bull') {
						dateClass += ' grid__date--bull';
					}

					// Смотрим выполнена ли эта метка
					if (markerList[dataDate].split('|')[1] == 1) {
						dateClass += ' grid__date--completed';
					}
				}
			}
		}

		// Открываем код
		grid += '<div class="grid__date' + dateClass + '" data-date="' + dataDate +'">';

		// Если это шапка списка
		if (type == 'list') {
			// Выводим дату
			grid += day;
		}

		// Закрываем код
		grid += '</div>';
	}

	// Выводим дни
	return grid;
}
