var app = angular.module('app', ['ngRoute']);

app.config(function ($locationProvider) {
	$locationProvider.hashPrefix('');
});

app.constant('configData',
	{
		apiUrl: "http://localhost:3000/api/auth",
		resetPageUrl: "http://localhost:3200/passwordResetApp",
		// apiUrl: "http://ec2-43-204-240-96.ap-south-1.compute.amazonaws.com/api/auth",
		// resetPageUrl: "http://ec2-43-204-240-96.ap-south-1.compute.amazonaws.com/passwordResetApp",
	}
);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: '/resources/html/generateResetLink.html',
		controller: 'generateResetLinkController'
	}).when('/reset/:param', {
		templateUrl: '/resources/html/resetPasswordPage.html',
		controller: 'resetPasswordPageController'
	}).otherwise({
		redirectTo: "/"
	});
}]);

app.controller("generateResetLinkController", ['$scope', '$http', 'configData', function ($scope, $http, configData) {
	$scope.userId = '';
	$scope.requestProcessing = false;
	$scope.generateResetLink = function () {
		$scope.userIdInvalid = false;
		$scope.emailSent = false;
		$scope.requestProcessing = true;
		let params = { "user_id": $scope.userId };
		$http({
			url: configData.apiUrl + '/resetPasswordToken',
			method: "GET",
			params: params
		})
			.then(function successCallback(response) {
				console.log("Success");
				$scope.emailSent = true;
				$scope.emailId = response.data;
				$scope.requestProcessing = false;
				$scope.userId = "";
			}, function errorCallback(response) {
				console.log("Error");
				$scope.userIdInvalid = true;
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
	$scope.passwordHidden = true;

	let params = { "reset_password_token": $routeParams.param };
	$http({
		url: configData.apiUrl + '/verifyResetToken',
		method: "GET",
		params: params
	})
		.then(function successCallback(response) {
			console.log("Success");
			console.log(response);
			$scope.tokenValidationOngoing = false;
			$scope.userId = response.data;
		}, function errorCallback(response) {
			console.log("Error");
			console.log(response);
			$scope.tokenValid = false;
			$scope.tokenValidationOngoing = false;
		});

	$scope.togglePasswordVisibility = function () {
		$scope.passwordHidden = !$scope.passwordHidden;
	};

	$scope.resetPassword = function () {
		$scope.requestProcessing = true;
		$scope.resetSuccess = false;
		$scope.resetError = false;
		let data = { "reset_password_token": $routeParams.param, "password": $scope.password_text };
		$http({
			url: configData.apiUrl + '/resetPassword',
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

