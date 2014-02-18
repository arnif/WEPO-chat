app.controller("LoginController", ["$scope", "$location", "SocketService", function($scope, $location, SocketService) {
	$scope.username = "";
	$scope.message = "";
	var socket = io.connect('http://localhost:8080');

	$scope.connect = function() {

		if(socket) {
			if ($scope.username === "") {
				$(".error-msg").fadeIn();
					$scope.message = "Name can't empty";
					setTimeout(function () {
						$(".error-msg").fadeOut();
					},5500);
					return;
			}
			socket.emit("adduser", $scope.username, function(available) {
				if(available) {
					// $("#blackout").fadeOut();
					SocketService.setConnected(socket);
					SocketService.setUsername($scope.username);

					$location.path("/room/lobby");
					setTimeout(function() {
						$("#create-room").fadeIn();

					},500);
					
				}
				else {
					$(".error-msg").fadeIn();
					$scope.message = "Your name is taken, please choose another";
					setTimeout(function () {
						$(".error-msg").fadeOut();
					},5500);
				}
				$scope.$apply();
			});
		}
	};
}]);