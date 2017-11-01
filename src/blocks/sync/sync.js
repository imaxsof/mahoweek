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

	// Если пользователь авторизован
	if (localStorage.getItem('authorizedUser')) {
		// Показываем панель пользователя
		$('.sync__auth').hide();
		$('.sync__user').show();

		// Показываем индикатор обновления
		$('.sync__indicator').attr('data-type', 'process');

		// Получаем данные о пользователе из Firebase
		firebase.auth().onAuthStateChanged(function(user) {
			// Если пользователь идентифицирован
			if (user) {
				// Вставляем аватар и имя
				$('.sync__ava').css('background-image', 'url(' + user.photoURL + ')');
				$('.sync__name').text(user.displayName);

				// Показываем индикатор, что все окей
				$('.sync__indicator').attr('data-type', 'ok');

				// Сверяем данные
				firebase.database().ref('/users/' + user.uid + '/database').on('value', function(data) {
					// Если в БД дата обновления новее
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

	// Логиним пользователя
	$('.js-login-sync').on('click', function() {
		var isThis = $(this);

		// Показываем процесс аутентификации
		$('.sync__auth').addClass('sync__auth--load');

		// Если пользователь не идентифицирован
		if (!firebase.auth().currentUser) {
			// Определяем способы аутентификации
			if (isThis.attr('data-provider') == 'twitter') {
				var provider = new firebase.auth.TwitterAuthProvider();
			} else if (isThis.attr('data-provider') == 'facebook') {
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
					// Скрываем процесс аутентификации
					$('.sync__auth').removeClass('sync__auth--load');

					// Выводим ошибку
					console.error(error.code + ': ' + error.message);
				});

			// Если вход выполняется с мобильного устройства
			} else {
				// Открываем аутентификацию в текущем окне
				firebase.auth().signInWithRedirect(provider);
			}
		}
	});

	// При редиректе после аутентификации
	firebase.auth().getRedirectResult().then(function(result) {
		if (result.credential) {
			// Проверяем пользователя
			checkUser(result.user.uid);
		}
	}).catch(function(error) {
		// Скрываем процесс аутентификации
		$('.sync__auth').removeClass('sync__auth--load');

		// Выводим ошибку
		console.error(error.code + ': ' + error.message);
	});

	// Разогиниваем пользователя
	$('.js-logout-sync').on('click', function() {
		// Если пользователь идентифицирован
		if (firebase.auth().currentUser) {
			// Разлогиниваем
			firebase.auth().signOut().then(function() {
				// Очищаем хранилище полностью
				localStorage.clear();

				// Редиректим на главную
				window.location.replace('/#bye');
				window.location.reload(true);
			}).catch(function(error) {
				// Выводим ошибку
				console.error(error.code + ': ' + error.message);
			});
		}
	});

}());



// Синхронизируем вручную
//------------------------------------------------------------------------------

(function() {

	$('.js-get-sync').on('click', function() {
		// Если пользователь идентифицирован
		if (firebase.auth().currentUser) {
			// Показываем индикатор обновления
			$('.sync__indicator').attr('data-type', 'process');

			// Сверяем данные
			firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/database').on('value', function(data) {
				// Парсим хранилище
				var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

				// Если в БД дата обновления новее или такая же
				if (data.val().settings.updatedTime >= mahoweekStorage.settings.updatedTime) {
					// Обновляем хранилище
					localStorage.setItem('mahoweek', JSON.stringify(data.val()));

					// Редиректим на главную
					window.location.replace('/');

				// Если в БД старая дата обновления
				} else {
					// Отправляем изменения в БД
					firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/database').set({
						"lists": mahoweekStorage.lists,
						"tasks": mahoweekStorage.tasks,
						"settings": mahoweekStorage.settings
					}).then(function() {
						// Показываем индикатор, что все окей
						$('.sync__indicator').attr('data-type', 'ok');
					}).catch(function(error) {
						// Показываем индикатор краха
						$('.sync__indicator').attr('data-type', 'fail');

						// Выводим ошибку
						console.error(error.code + ': ' + error.message);
					});
				}
			});
		}
	});

}());



// Работаем с авторизацией
//------------------------------------------------------------------------------

function checkUser(uid) {

	// Проверяем, существует ли пользователь в БД
	return firebase.database().ref('/users/' + uid + '/database').once('value').then(function(data) {
		// Если пользователя нет
		if (data.val() === null) {
			// Парсим хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

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
