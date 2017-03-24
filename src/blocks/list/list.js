// Создаем прогресс выполненных дел
//------------------------------------------------------------------------------

function makeProgress() {
	// Считаем общее кол-во дел
	var taskTotal = $('.task:not(.task--add)').length;

	// Считаем кол-во выполненных
	var taskCompleted = $('.task:not(.task--add)[data-completed="1"]').length;

	// Высчитываем прогресс
	if (taskTotal > 0) {
		var progress = taskCompleted * 100 / taskTotal / 100;
	} else {
		var progress = 0;
	}

	// Выводим прогресс
	$('.list__progress').css({
		'-webkit-transform': 'scaleX(' + progress + ')',
		'transform': 'scaleX(' + progress + ')'
	});
}
