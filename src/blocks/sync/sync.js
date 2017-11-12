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



// Работаем с идентификацией пользователя
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

				// Считаем кол-во синхронизаций изменений
				var syncCount = 0;

				// Подключаемся к БД и синхронизируем изменения
				firebase.database().ref('/users/' + user.uid + '/database').on('value', function(data) {
					syncCount++;

					// Если в БД дата обновления новее, чем в Хранилище
					if (data.val().settings.updatedTime > JSON.parse(localStorage.getItem('mahoweek')).settings.updatedTime) {
						// Генерируем данные для Хранилища из БД
						var storageData = {
							lists: data.val().lists !== undefined ? data.val().lists : [],
							tasks: data.val().tasks !== undefined ? data.val().tasks : [],
							settings: data.val().settings
						}

						// Обновляем Хранилище
						localStorage.setItem('mahoweek', JSON.stringify(storageData));

						// Перезагружаем страницу
						window.location.reload(true);

					// Если это первая синхронизация
					} else if (syncCount == 1) {
						// Показываем индикатор, что все окей
						$('.sync__indicator').attr('data-type', 'ok');

						// Загружаем списки
						loadList();

						// Загружаем дела
						loadTask();
					}
				});
			}
		});

	// Если пользователь не авторизован
	} else {
		// Загружаем списки
		loadList();

		// Загружаем дела
		loadTask();
	}

}());



// Работаем с аутентификацией пользователя
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
		// Если данные от провайдера получены
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
				// Очищаем локальное хранилище полностью
				localStorage.clear();

				// Добавляем хеш для вывода прощального сообщения
				window.location.replace('#bye');

				// Перезагружаем страницу
				window.location.reload(true);
			}).catch(function(error) {
				// Выводим ошибку
				console.error(error.code + ': ' + error.message);
			});
		}
	});

}());



// Синхронизируем Хранилище и БД вручную
//------------------------------------------------------------------------------

(function() {

	$('.js-get-sync').on('click', function() {
		// Если пользователь идентифицирован
		if (firebase.auth().currentUser) {
			// Показываем индикатор обновления
			$('.sync__indicator').attr('data-type', 'process');

			// Подключаемся к БД единоразово
			return firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/database').once('value').then(function(data) {
				// Парсим Хранилище
				var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

				// Если в БД дата обновления новее или такая же как в Хранилище
				if (data.val().settings.updatedTime >= mahoweekStorage.settings.updatedTime) {
					// Генерируем данные для Хранилища из БД
					var storageData = {
						lists: data.val().lists !== undefined ? data.val().lists : [],
						tasks: data.val().tasks !== undefined ? data.val().tasks : [],
						settings: data.val().settings
					}

					// Обновляем Хранилище
					localStorage.setItem('mahoweek', JSON.stringify(storageData));

					// Перезагружаем страницу
					window.location.reload(true);

				// Если в БД старая дата обновления
				} else {
					// Отправляем изменения в БД из Хранилища
					firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/database').set({
						"lists": mahoweekStorage.lists,
						"tasks": mahoweekStorage.tasks,
						"settings": mahoweekStorage.settings
					}).then(function() {
						// Показываем индикатор, что все окей
						$('.sync__indicator').attr('data-type', 'ok');

						// Перезагружаем страницу
						window.location.reload(true);
					}).catch(function(error) {
						// Показываем индикатор краха
						$('.sync__indicator').attr('data-type', 'fail');

						// Выводим ошибку
						console.error(error.code + ': ' + error.message);
					});
				}
			}).catch(function(error) {
				// Показываем индикатор краха
				$('.sync__indicator').attr('data-type', 'fail');

				// Выводим ошибку
				console.error(error.code + ': ' + error.message);
			});
		}
	});

}());



// Работаем с авторизацией пользователя
//------------------------------------------------------------------------------

function checkUser(uid) {

	// Подключаемся к БД единоразово
	return firebase.database().ref('/users/' + uid + '/database').once('value').then(function(data) {
		// Если пользователя в БД нет
		if (data.val() === null) {
			// Парсим Хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

			// Создаем пользователя в БД и заносим данные из Хранилища
			firebase.database().ref('users/' + uid + '/database').set({
				"lists": mahoweekStorage.lists,
				"tasks": mahoweekStorage.tasks,
				"settings": mahoweekStorage.settings
			}).then(function() {
				// Ставим метку, что пользователь успешно авторизовался
				localStorage.setItem('authorizedUser', true);

				// Перезагружаем страницу
				window.location.reload(true);
			}).catch(function(error) {
				// Выводим ошибку
				console.error(error.code + ': ' + error.message);
			});

		// Если пользователь в БД есть
		} else {
			// Генерируем данные для Хранилища из БД
			var storageData = {
				lists: data.val().lists !== undefined ? data.val().lists : [],
				tasks: data.val().tasks !== undefined ? data.val().tasks : [],
				settings: data.val().settings
			}

			// Обновляем Хранилище
			localStorage.setItem('mahoweek', JSON.stringify(storageData));

			// Ставим метку, что пользователь успешно авторизовался
			localStorage.setItem('authorizedUser', true);

			// Перезагружаем страницу
			window.location.reload(true);
		}
	}).catch(function(error) {
		// Выводим ошибку
		console.error(error.code + ': ' + error.message);
	});

}
