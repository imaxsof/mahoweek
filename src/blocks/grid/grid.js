// Grid
//------------------------------------------------------------------------------

// Добавляем/убираем метку
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('click', '.js-marker-task:not(.grid__date--past):not(.grid__date--completed)', function() {
		var isThis = $(this),
			task = isThis.parents('.task');

		// Получаем хеш списка, хеш дела и дату
		var listId = task.parents('.list').attr('data-id'),
			taskId = task.attr('data-id'),
			taskDate = isThis.attr('data-date');

		// Парсим Хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Получаем элемент дела в Хранилище
		var taskElement = mahoweekStorage.tasks.filter(function(value) {
			return value.id == taskId;
		});

		// Получаем индекс дела в Хранилище
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

			// Если дело было выполнено
			if (task.hasClass('task--completed')) {
				// Помечаем дело как невыполненное
				delete mahoweekStorage.tasks[taskIndex].completed;
				delete mahoweekStorage.tasks[taskIndex].completedTime;

				// Обновляем дело в списке
				task.removeClass('task--completed');
			}

		// Если существовало
		} else {
			// Проверяем существовала ли уже метка на это число
			var markerElement = mahoweekStorage.tasks[taskIndex].markers.filter(function(value) {
				return value.date == taskDate;
			});

			// Если метка существовала
			if (markerElement != '') {
				// Получаем индекс метки
				var markerIndex = mahoweekStorage.tasks[taskIndex].markers.indexOf(markerElement[0]);

				// Удаляем метку
				mahoweekStorage.tasks[taskIndex].markers.splice(markerIndex, 1);

				// Убираем метку из сетки дат
				isThis.removeClass('grid__date--bull');

			// Если метка не существовала
			} else {
				// Добавляем метку
				mahoweekStorage.tasks[taskIndex].markers.push({
					date: taskDate,
					label: 'bull'
				});

				// Добавляем метку в сетку дат
				isThis.addClass('grid__date--bull');

				// Если дело было выполнено
				if (task.hasClass('task--completed')) {
					// Помечаем дело как невыполненное
					delete mahoweekStorage.tasks[taskIndex].completed;
					delete mahoweekStorage.tasks[taskIndex].completedTime;

					// Обновляем дело в списке
					task.removeClass('task--completed');
				}
			}
		}

		// Обновляем Хранилище
		updateStorage(mahoweekStorage);

		// Изменяем стиль статуса дела
		changeStyleTaskStatus(task);

		// Рассчитываем прогресс выполнения списка
		makeProgress(listId);

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
	var dayNumber = date.getDay();

	// Делаем воскресенье номером 7
	if (dayNumber == 0) {
		dayNumber = 7;
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
	for (var i = 1 - dayNumber; i <= 14 - dayNumber; i ++) {
		// Определяем переменные
		var dateClass = '',
			newDate = new Date(),
			time = newDate.setDate(date.getDate() + i),
			day = newDate.getDate(time),        // число
			month = newDate.getMonth(time) + 1, // месяц
			year = newDate.getFullYear(time),   // год
			newDayNumber = newDate.getDay(),    // номер дня
			dataDate = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);

		// Делаем воскресенье номером 7
		if (newDayNumber == 0) {
			newDayNumber = 7;
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
		if (newDayNumber == 6 || newDayNumber == 7) {
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

					// Смотрим выполнено ли дело в этот день
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
