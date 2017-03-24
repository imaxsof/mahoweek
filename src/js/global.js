// Хранилище
//------------------------------------------------------------------------------

// Если хранилища не существует
if (!localStorage.getItem('dosho')) {
	// Генерируем первоначальные данные
	var doshoData = {
		tasks: [],
		settings: {}
	}

	// Создаем хранилище с первоначальными данными
	localStorage.setItem('dosho', JSON.stringify(doshoData));
}



// Остальное
//------------------------------------------------------------------------------

// Определяем девайс
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	$('body').addClass('mobile');
}
