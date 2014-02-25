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

			$scope.username = $scope.username.replace(/\s/g, "-");


			var first = ($scope.username.charAt(0));

			if (first.search(/[^A-Za-z | ^0-9]/) != -1) {	
				$(".error-msg").fadeIn();
					$scope.message = "Invalid token in name";
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


	$scope.keyPress2 = function($event) {
		if($event.keyCode === 13) {
			$scope.connect();
		}
	};

}]);