// List
//------------------------------------------------------------------------------

// Назначаем глобальные переменные
var list = $('.list');



// Выводим сетку дат в шапку листа
//------------------------------------------------------------------------------

list.find('.list__grid').html(makeGrid('list'));



// Фиксируем шапку списка
//------------------------------------------------------------------------------

(function() {

	// Если не мобилка
	if (!$('body').hasClass('mobile')) {
		// Определяем переменные
		var doc = $(window),
			docScrollTop = doc.scrollTop(),
			listOffsetTop = list.offset().top;

		// Скроллим
		doc.on('scroll', function() {
			var isThis = $(this);

			// Смотрим где сейчас скролл
			docScrollTop = isThis.scrollTop();

			// Если скролл больше расстояния до списка
			if (docScrollTop >= listOffsetTop) {
				// Фиксируем
				list.find('.list__head').addClass('list__head--fixed');

			// Если скролл меньше расстояния до списка
			} else {
				// Снимаем фиксирование
				list.find('.list__head').removeClass('list__head--fixed');
			}
		});
	}

}());



// Создаем прогресс выполненных дел
//------------------------------------------------------------------------------

function makeProgress() {

	// Считаем общее кол-во дел
	var taskTotal = $('.task:not(.task--add)').length;

	// Считаем кол-во выполненных
	var taskCompleted = $('.task--completed').length;

	// Высчитываем прогресс
	if (taskTotal > 0) {
		var progress = taskCompleted * 100 / taskTotal / 100;
	} else {
		var progress = 0;
	}

	// Выводим прогресс
	list.find('.list__progress').css({
		'-webkit-transform': 'scaleX(' + progress + ')',
		'transform': 'scaleX(' + progress + ')'
	});

}
