// Хранилище
//------------------------------------------------------------------------------

// Если хранилища не существует
if (!localStorage.getItem('mahoweek')) {
	// Генерируем первоначальные данные
	var mahoweekData = {
		tasks: [],
		settings: {}
	}

	// Создаем хранилище с первоначальными данными
	localStorage.setItem('mahoweek', JSON.stringify(mahoweekData));
}



// Остальное
//------------------------------------------------------------------------------

// Определяем девайс
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	$('body').addClass('mobile');
}
