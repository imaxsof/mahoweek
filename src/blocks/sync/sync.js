// Sync
//------------------------------------------------------------------------------

// Задаем конфигурацию Firebase
var firebaseConfig = {
	apiKey: 'AIzaSyBzWqGiMDErDxB_kUOO8-KYABo0_SYNap8',
	authDomain: 'mahoweek-8c3db.firebaseapp.com',
	databaseURL: 'https://mahoweek-8c3db.firebaseio.com'
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);



// Работаем с идентификацией
//------------------------------------------------------------------------------

(function() {

	// Если пользователь был авторизован
	if (localStorage.getItem('authorizedUser')) {
		// Показываем панель пользователя
		$('.sync__auth').hide();
		$('.sync__user').show();

		// Показываем индикатор обновления
		$('.sync__indicator').attr('data-type', 'process');

		// Получаем данные о пользователе из Firebase
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// Вставляем аватар и имя
				$('.sync__ava').css('background-image', 'url(' + user.photoURL + ')');
				$('.sync__name').text(user.displayName);

				// Показываем индикатор, что все окей
				$('.sync__indicator').attr('data-type', 'ok');

				firebase.database().ref('/users/' + user.uid + '/database').on('value', function(data) {
					// Если в БД данные новее
					if (data.val().settings.updatedTime > JSON.parse(localStorage.getItem('mahoweek')).settings.updatedTime) {
						// Показываем индикатор обновления
						$('.sync__indicator').attr('data-type', 'process');

						// Обновляем хранилище
						localStorage.setItem('mahoweek', JSON.stringify(data.val()));

						// Редиректим на главную
						window.location.replace('/');
					}
				});
			}
		});
	}

}());



// Работаем с аутентификацией
//------------------------------------------------------------------------------

(function() {

	// Переключаем вход/выход пользователя
	$('.js-toggle-auth').on('click', function() {
		// Если пользователь не авторизован
		if (!firebase.auth().currentUser) {
			// Определяем способы аутентификации
			if ($(this).attr('data-provider') == 'twitter') {
				var provider = new firebase.auth.TwitterAuthProvider();
			} else if ($(this).attr('data-provider') == 'facebook') {
				var provider = new firebase.auth.FacebookAuthProvider();
				provider.addScope('public_profile');
				provider.addScope('email');
			}

			// Если вход выполняется не с мобильного устройства
			if (!MOBILE) {
				// Открываем отдельное окно с аутентификацией
				firebase.auth().signInWithPopup(provider).then(function(result) {
					// Проверяем пользователя
					checkUser(result.user.uid);
				}).catch(function(error) {
					// Выводим ошибку
					console.error(error.code + ': ' + error.message);
				});

			// Если вход выполняется с мобильного устройства
			} else {
				// Открываем аутентификацию в текущем окне
				firebase.auth().signInWithRedirect(provider);
			}

		// Если пользователь был авторизован
		} else {
			// Разлогиниваем
			firebase.auth().signOut().then(function() {
				// Очищаем хранилище полностью
				localStorage.clear();

				// Редиректим на главную
				window.location.replace('/');
			}).catch(function(error) {
				// Выводим ошибку
				console.error(error.code + ': ' + error.message);
			});
		}
	});

	// При редиректе после аутентификации
	firebase.auth().getRedirectResult().then(function(result) {
		if (result.credential) {
			// Проверяем пользователя
			checkUser(result.user.uid);
		}
	}).catch(function(error) {
		// Выводим ошибку
		console.error(error.code + ': ' + error.message);
	});

}());



// Работаем с авторизацией
//------------------------------------------------------------------------------

function checkUser(uid) {

	// Парсим хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Проверяем, существует ли пользователь в БД
	return firebase.database().ref('/users/' + uid + '/database').once('value').then(function(data) {
		// Если пользователя нет
		if (data.val() === null) {
			// Создаем пользователя в БД и заносим данные
			firebase.database().ref('users/' + uid + '/database').set({
				"lists": mahoweekStorage.lists,
				"tasks": mahoweekStorage.tasks,
				"settings": mahoweekStorage.settings
			}).then(function() {
				// Ставим метку, что пользователь успешно авторизовался
				localStorage.setItem('authorizedUser', true);

				// Редиректим на главную
				window.location.replace('/');
			}).catch(function(error) {
				// Выводим ошибку
				console.error(error.code + ': ' + error.message);
			});

		// Если пользователь есть
		} else {
			// Ставим метку, что пользователь успешно авторизовался
			localStorage.setItem('authorizedUser', true);

			// Обновляем хранилище из БД
			localStorage.setItem('mahoweek', JSON.stringify(data.val()));

			// Редиректим на главную
			window.location.replace('/');
		}
	}).catch(function(error) {
		// Выводим ошибку
		console.error(error.code + ': ' + error.message);
	});

}
