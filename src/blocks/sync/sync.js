// Sync
//------------------------------------------------------------------------------

// Задаем конфигурацию Firebase
var firebaseConfig = {
	apiKey: 'AIzaSyBzWqGiMDErDxB_kUOO8-KYABo0_SYNap8',
	authDomain: 'mahoweek.com',
	databaseURL: 'https://mahoweek-8c3db.firebaseio.com'
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);


// Работаем с идентификацией пользователя
//------------------------------------------------------------------------------

(function($) {

	// Если пользователь авторизован
	if (localStorage.getItem('mwAuth')) {
		// Показываем панель пользователя
		$('.sync__auth').addClass('sync__auth--hidden');
		$('.sync__user').addClass('sync__user--show');

		// Показываем индикатор обновления
		$('.sync__ava, .menu__ava').attr('data-sync', 'process');

		// Получаем данные о пользователе из Firebase
		firebase.auth().onAuthStateChanged(function(user) {
			// Если пользователь идентифицирован
			if (user) {
				// Вставляем аватар, имя и провайдера
				$('.sync__ava, .menu__ava').css('background-image', 'url(' + user.photoURL + ')');
				$('.sync__name').text(user.displayName);
				$('.sync__ava').attr('data-provider', user.providerData[0].providerId);

				// Показываем пользователя в меню
				$('.menu__item--settings').addClass('menu__item--profile');

				// Считаем кол-во синхронизаций изменений
				var syncCount = 0;

				// Подключаемся к БД и синхронизируем изменения
				firebase.database().ref('/users/' + user.uid + '/database').on('value', function(data) {
					syncCount++;

					// Если в БД дата обновления новее, чем в Хранилище
					if (data.val().settings.updatedTime > JSON.parse(localStorage.getItem('mwStorage')).settings.updatedTime) {
						// Генерируем данные для Хранилища из БД
						var storageData = {
							lists: data.val().lists !== undefined ? data.val().lists : [],
							tasks: data.val().tasks !== undefined ? data.val().tasks : [],
							settings: data.val().settings
						}

						// Обновляем Хранилище
						localStorage.setItem('mwStorage', JSON.stringify(storageData));

						// Перезагружаем страницу
						window.location.reload(true);

					// Если это первая синхронизация
					} else if (syncCount == 1) {
						// Вставляем дату последнего изменения
						$('.sync__updated span').text(convertDate(data.val().settings.updatedTime));

						// Показываем индикатор, что все окей
						$('.sync__ava, .menu__ava').attr('data-sync', 'ok');

						// Загружаем списки
						loadList();

						// Загружаем дела
						loadTask();

						// Слушаем состояние подключения к сети
						// firebase.database().ref('.info/connected').on('value', function(snap) {
						// 	// Если в сети
						// 	if (snap.val() === true) {
						// 		// Скрываем если было сообщение об ошибке
						// 		$('.sync__message').html('').hide();

						// 		// Показываем индикатор, что все окей
						// 		$('.sync__ava, .menu__ava').attr('data-sync', 'ok');

						// 	// Если не в сети
						// 	} else {
						// 		// Показываем индикатор краха
						// 		$('.sync__ava, .menu__ava').attr('data-sync', 'fail');

						// 		// Выводим ошибку в сообщении
						// 		$('.sync__message').html('Проблема с сетью').show();
						// 	}
						// });
					}
				});

			// Если пользователь не идентифицирован
			} else {
				// Очищаем локальное хранилище полностью
				localStorage.clear();

				// Добавляем хеш для вывода прощального сообщения
				window.location.replace('#bye');

				// Перезагружаем страницу
				window.location.reload(true);
			}
		});

	// Если пользователь не авторизован
	} else {
		// Загружаем списки
		loadList();

		// Загружаем дела
		loadTask();
	}

}(jQuery));


// Работаем с аутентификацией пользователя
//------------------------------------------------------------------------------

(function($) {

	// Логиним пользователя
	$('.js-login-sync').on('click', function() {
		var isThis = $(this);

		// Скрываем если было сообщение об ошибке
		$('.sync__message').html('').hide();

		// Показываем процесс аутентификации
		$('.sync__auth').addClass('sync__auth--load');

		// Если пользователь не идентифицирован
		if (!firebase.auth().currentUser) {
			// Определяем способы аутентификации
			if (isThis.attr('data-provider') == 'google') {
				var provider = new firebase.auth.GoogleAuthProvider();
				provider.addScope('email');
			} else if (isThis.attr('data-provider') == 'facebook') {
				var provider = new firebase.auth.FacebookAuthProvider();
				provider.addScope('email');
			} else if (isThis.attr('data-provider') == 'twitter') {
				var provider = new firebase.auth.TwitterAuthProvider();
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

					// Выводим ошибку в консоли и в сообщении
					console.error(error.code + ': ' + error.message);
					$('.sync__message').html(error.code + ': ' + error.message).show();
				});

			// Если вход выполняется с мобильного устройства
			} else {
				// Открываем аутентификацию в текущем окне
				firebase.auth().signInWithRedirect(provider);
			}

		// Если вдруг пользователь был как-то криво авторизован
		} else {
			// Разогиниваем пользователя
			$('.js-logout-sync').trigger('click');
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

		// Выводим ошибку в консоли и в сообщении
		console.error(error.code + ': ' + error.message);
		$('.sync__message').html(error.code + ': ' + error.message).show();
	});

	// Разогиниваем пользователя
	$('.js-logout-sync').on('click', function() {
		// Если пользователь идентифицирован
		if (firebase.auth().currentUser) {
			// Скрываем если было сообщение об ошибке
			$('.sync__message').html('').hide();

			// Разлогиниваем
			firebase.auth().signOut().then(function() {
				// Очищаем локальное хранилище полностью
				localStorage.clear();

				// Добавляем хеш для вывода прощального сообщения
				window.location.replace('#bye');

				// Перезагружаем страницу
				window.location.reload(true);
			}).catch(function(error) {
				// Выводим ошибку в консоли и в сообщении
				console.error(error.code + ': ' + error.message);
				$('.sync__message').html(error.code + ': ' + error.message).show();
			});
		}
	});

}(jQuery));


// Синхронизируем Хранилище и БД вручную
//------------------------------------------------------------------------------

(function($) {

	$('.js-get-sync').on('click', function() {
		// Если пользователь идентифицирован
		// и есть метка о авторизации
		if (firebase.auth().currentUser && localStorage.getItem('mwAuth')) {
			// Скрываем если было сообщение об ошибке
			$('.sync__message').html('').hide();

			// Показываем индикатор обновления
			$('.sync__ava, .menu__ava').attr('data-sync', 'process');
			$('.sync__hand').addClass('sync__hand--spin');

			// Подключаемся к БД единоразово
			return firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/database').once('value').then(function(data) {
				// Парсим Хранилище
				var mahoweekStorage = JSON.parse(localStorage.getItem('mwStorage'));

				// Если в БД дата обновления новее или такая же как в Хранилище
				if (data.val().settings.updatedTime >= mahoweekStorage.settings.updatedTime) {
					// Генерируем данные для Хранилища из БД
					var storageData = {
						lists: data.val().lists !== undefined ? data.val().lists : [],
						tasks: data.val().tasks !== undefined ? data.val().tasks : [],
						settings: data.val().settings
					}

					// Обновляем Хранилище
					localStorage.setItem('mwStorage', JSON.stringify(storageData));

					// Добавляем данные в Метрику
					yaCounter43856389.reachGoal('ya-manually-sync');

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
						$('.sync__ava, .menu__ava').attr('data-sync', 'ok');

						// Добавляем данные в Метрику
						yaCounter43856389.reachGoal('ya-manually-sync');

						// Перезагружаем страницу
						window.location.reload(true);
					}).catch(function(error) {
						// Показываем индикатор краха
						$('.sync__ava, .menu__ava').attr('data-sync', 'fail');
						$('.sync__hand').removeClass('sync__hand--spin');

						// Выводим ошибку в консоли и в сообщении
						console.error(error.code + ': ' + error.message);
						$('.sync__message').html(error.code + ': ' + error.message).show();
					});
				}
			}).catch(function(error) {
				// Показываем индикатор краха
				$('.sync__ava, .menu__ava').attr('data-sync', 'fail');
				$('.sync__hand').removeClass('sync__hand--spin');

				// Выводим ошибку в консоли и в сообщении
				console.error(error.code + ': ' + error.message);
				$('.sync__message').html(error.code + ': ' + error.message).show();
			});

		// Если пользователь не идентифицирован
		} else {
			// Разогиниваем пользователя
			$('.js-logout-sync').trigger('click');
		}
	});

}(jQuery));


// Работаем с авторизацией пользователя
//------------------------------------------------------------------------------

function checkUser(uid) {

	// Подключаемся к БД единоразово
	return firebase.database().ref('/users/' + uid + '/database').once('value').then(function(data) {
		// Если пользователя в БД нет
		if (data.val() === null) {
			// Парсим Хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mwStorage'));

			// Создаем пользователя в БД и заносим данные из Хранилища
			firebase.database().ref('users/' + uid + '/database').set({
				"lists": mahoweekStorage.lists,
				"tasks": mahoweekStorage.tasks,
				"settings": mahoweekStorage.settings
			}).then(function() {
				// Ставим метку, что пользователь успешно авторизовался
				localStorage.setItem('mwAuth', true);

				// Перезагружаем страницу
				window.location.reload(true);
			}).catch(function(error) {
				// Выводим ошибку в консоли и в сообщении
				console.error(error.code + ': ' + error.message);
				$('.sync__message').html(error.code + ': ' + error.message).show();
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
			localStorage.setItem('mwStorage', JSON.stringify(storageData));

			// Ставим метку, что пользователь успешно авторизовался
			localStorage.setItem('mwAuth', true);

			// Перезагружаем страницу
			window.location.reload(true);
		}
	}).catch(function(error) {
		// Выводим ошибку в консоли и в сообщении
		console.error(error.code + ': ' + error.message);
		$('.sync__message').html(error.code + ': ' + error.message).show();
	});

}
