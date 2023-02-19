var env = {};

if (window) {
	Object.assign(env, window.__env);
}

var app = angular.module('app', ['ngRoute']);

app.config(function ($locationProvider) {
	$locationProvider.hashPrefix('');
});

app.constant('configData', env);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: '/passwordResetApp/resources/html/generateResetLink.html',
		controller: 'generateResetLinkController'
	}).when('/reset/:param', {
		templateUrl: '/passwordResetApp/resources/html/resetPasswordPage.html',
		controller: 'resetPasswordPageController'
	}).otherwise({
		redirectTo: "/"
	});
}]);

app.controller("generateResetLinkController", ['$scope', '$http', 'configData', function ($scope, $http, configData) {
	$scope.userId = '';
	$scope.requestProcessing = false;
	$scope.generateResetLink = function () {
		$scope.serverError = false;
		$scope.errorMessage = "";
		$scope.emailSent = false;
		$scope.requestProcessing = true;
		let params = { "user_id": $scope.userId };
		$http({
			url: configData.authApiUrl + '/resetPasswordToken',
			method: "GET",
			params: params
		})
			.then(function successCallback(response) {
				console.log("Success");
				$scope.emailSent = true;
				$scope.emailId = response.data.email;
				$scope.requestProcessing = false;
				$scope.userId = "";
			}, function errorCallback(response) {
				if (response.status == 400)
					$scope.errorMessage = "User ID is invalid.";
				else
					$scope.errorMessage = "There was some problem with your request.";
				console.log("Error");
				$scope.serverError = true;
				$scope.requestProcessing = false;
			});
	};
}]);


app.controller("resetPasswordPageController", ['$scope', '$http', '$routeParams', 'configData', function ($scope, $http, $routeParams, configData) {
	$scope.password_text = "";
	$scope.userId = "";
	$scope.requestProcessing = false;
	$scope.tokenValid = true;
	$scope.tokenValidationOngoing = true;
	$scope.generateResetLinkPage = configData.resetPageUrl;

	$scope.passwordStrength = 0;
	$scope.showPassword = false;
	$scope.passwordStrengthMessage = '';
	$scope.showPassword = false;
	$scope.passwordType = 'password';
	$scope.showPasswordTips = false;
	$scope.passwordTipsList = [0, 0, 0, 0, 0];

	$scope.checkPassword = function () {
		$scope.passwordStrengthMessage = '';
		$scope.passwordTipsList[0] = $scope.password_text.length >= 10 ? 1 : 0;
		// Upper case test
		$scope.passwordTipsList[1] = /[A-Z]/.test($scope.password_text) ? 1 : 0;
		// Lower case test
		$scope.passwordTipsList[2] = /[a-z]/.test($scope.password_text) ? 1 : 0;
		// Number test
		$scope.passwordTipsList[3] = /[0-9]/.test($scope.password_text) ? 1 : 0;
		// Special character test
		$scope.passwordTipsList[4] = /[^A-Za-z0-9]/.test($scope.password_text) ? 1 : 0;

		if ($scope.password_text.length == 0)
			$scope.passwordStrength = 0;
		else
			$scope.passwordStrength = $scope.passwordTipsList.reduce((partialSum, a) => partialSum + a, 0);

		// Scaling strength bar width out of 100
		$scope.passwordStrengthBarWidth = $scope.passwordStrength * 20;

		switch ($scope.passwordStrength) {
			case 1:
				$scope.passwordStrengthMessage = "You must be joking";
				break;
			case 2:
				$scope.passwordStrengthMessage = "Thoda aur effort dedo :p";
				break;
			case 3:
				$scope.passwordStrengthMessage = "We'll let this pass for now.";
				break;
			case 4:
				$scope.passwordStrengthMessage = "Looking good!!";
				break;
			case 5:
				$scope.passwordStrengthMessage = "Why so serious?";
				break;
		}
	};

	$scope.getPasswordStrengthClass = function () {
		switch ($scope.passwordStrength) {
			case 1:
				return 'very-weak';
			case 2:
				return 'weak';
			case 3:
				return 'fair';
			case 4:
				return 'good';
			case 5:
				return 'strong';
		}
	};

	$scope.togglePasswordVisibility = function () {
		$scope.showPassword = !$scope.showPassword;
		$scope.passwordType = $scope.showPassword ? 'text' : 'password';
	};

	$scope.togglePasswordTipsVisibility = function () {
		$scope.showPasswordTips = !$scope.showPasswordTips;
	}

	let params = { "reset_password_token": $routeParams.param };
	$http({
		url: configData.authApiUrl + '/verifyResetToken',
		method: "GET",
		params: params
	})
		.then(function successCallback(response) {
			console.log("Success");
			console.log(response);
			$scope.tokenValidationOngoing = false;
			$scope.userId = response.data.user_id;
		}, function errorCallback(response) {
			console.log("Error");
			console.log(response);
			$scope.tokenValid = false;
			$scope.tokenValidationOngoing = false;
		});

	$scope.resetPassword = function () {
		$scope.requestProcessing = true;
		$scope.resetSuccess = false;
		$scope.resetError = false;
		let data = { "reset_password_token": $routeParams.param, "password": $scope.password_text };
		$http({
			url: configData.authApiUrl + '/resetPassword',
			method: "POST",
			data: data
		})
			.then(function successCallback(response) {
				console.log("Success");
				console.log(response);
				$scope.resetSuccess = true;
				$scope.resetError = false;
				$scope.requestProcessing = false;
			}, function errorCallback(response) {
				console.log("Error");
				console.log(response);
				$scope.resetSuccess = false;
				$scope.resetError = true;
				$scope.requestProcessing = false;
			});
	};
}]);

