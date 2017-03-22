// List
//------------------------------------------------------------------------------



// Строим прогресс выполненных дел
//------------------------------------------------------------------------------

function listProgress() {
	// Считаем общее кол-во дел
	var todoTotal = $('.todo__item:not(.todo__item--add)').length;

	// Считаем кол-во выполненных
	var todoDone = $('.todo__item:not(.todo__item--add)[data-status="done"]').length;

	// Высчитываем прогресс
	if (todoTotal > 0) {
		var listProgress = todoDone * 100 / todoTotal / 100;
	} else {
		var listProgress = 0;
	}

	// Выводим прогресс
	$('.list__progress').css({
		'-webkit-transform': 'scaleX(' + listProgress + ')',
		'transform': 'scaleX(' + listProgress + ')'
	});
}



// (function() {

// 	// Получаем текущую дату
// 	var date = new Date();

// 	// Генерируем две недели
// 	var week = '';

// 	// Создаем список дней
// 	// причем сдвигаем дни недели если она закончилась
// 	for ( var i = 0 - date.getDay(); i < 14 - date.getDay(); i ++ ) {
// 		var dateClass = '',
// 			newDate = new Date(),
// 			time = newDate.setDate( date.getDate() + i ),
// 			day = newDate.getDate( time ),
// 			holiday = newDate.getDay();

// 		// Определяем текущий день
// 		if (date.getDate() == day) {
// 			dateClass += ' list__date--today';
// 		}

// 		// Определяем выходные
// 		if (holiday == 0 || holiday == 6) {
// 			dateClass += ' list__date--holiday';
// 		}

// 		// Добавляем в генератор двух недель
// 		week += '<li class="list__date' + dateClass + '">' + day + '</li>';
// 	}

// 	// Выводим список
// 	$('.list__week').html( week );

// }());
