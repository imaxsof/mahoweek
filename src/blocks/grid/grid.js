// Grid
//------------------------------------------------------------------------------

// Генерируем сетку
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

	// По умолчанию день прошедший
	var past = 1;

	// Работаем с data
	if (data) {
		// Создаем объект с метками
		var markerList = {};

		// Добавляем метки в объект
		for (var i = 0; i < data.length; i ++) {
			var key = data[i].day;
			markerList[key] = data[i].label;
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
			dataDay = (day < 10 ? '0' + day : day) + '.' + (month < 10 ? '0' + month : month) + '.' + year;

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
		}

		// Начало
		grid += '<div class="grid__date' + dateClass + '" data-day="' + dataDay +'">';

		// Если это шапка листа
		if (type == 'list') {
			// Выводим дату
			grid += day;
		}

		// Если это дело
		// и у него есть метки
		if (type == 'task' && markerList) {
			// Смотрим есть ли метка на этот день
			// и если есть, то показываем
			if (dataDay in markerList) {
				grid += '<svg class="grid__bull"><use xlink:href="#ei-bull-icon"></use></svg>';
			}
		}

		// Конец
		grid += '</div>';
	}

	// Выводим дни
	return grid;
}
