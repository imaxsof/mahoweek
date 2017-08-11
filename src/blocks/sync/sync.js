// Sync
//------------------------------------------------------------------------------

// Работаем с аутентификацией
//------------------------------------------------------------------------------

(function() {

	// Переключаем вход/выход пользователя
	$('.js-toggle-auth').on('click', function() {
		// Если пользователь не авторизован
		if (!firebase.auth().currentUser) {
			// Определяем способы авторизации
			if ($(this).attr('data-provider') == 'twitter') {
				var provider = new firebase.auth.TwitterAuthProvider();
			} else if ($(this).attr('data-provider') == 'facebook') {
				var provider = new firebase.auth.FacebookAuthProvider();
				provider.addScope('public_profile');
				provider.addScope('email');
			}

			// Если вход выполняется не с мобильного устройства
			if (!MOBILE) {
				// Открываем отдельное окно с авторизацией
				firebase.auth().signInWithPopup(provider).then(function(result) {
					// Редиректим на главную
					window.location.replace('/');
				}).catch(function(error) {
					// Выводим ошибку
					console.error(error.code + ': ' + error.message);
				});

			// Если вход выполняется с мобильного устройства
			} else {
				// Открываем авторизацию в текущем окне
				firebase.auth().signInWithRedirect(provider);
			}

		// Если пользователь был авторизован
		} else {
			// Разлогиниваем
			firebase.auth().signOut();

			// Редиректим на главную
			window.location.replace('/');
		}
	});

	// При редиректе после авторизации
	firebase.auth().getRedirectResult().then(function(result) {
		if (result.credential) {
			// Редиректим на главную
			window.location.replace('/');
		}
	}).catch(function(error) {
		// Выводим ошибку
		console.error(error.code + ': ' + error.message);
	});

}());



// Залогиниваем
//------------------------------------------------------------------------------

function UserSignIn(data) {
	$('.sync__auth').hide();
	$('.sync__user').show();
}



// Разлогиниваем
//------------------------------------------------------------------------------

function UserSignOut() {
	$('.sync__auth').show();
	$('.sync__user').hide();
}
