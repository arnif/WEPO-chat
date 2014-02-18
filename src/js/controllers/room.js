app.controller("RoomController", ["$scope", "$routeParams", "$location", "SocketService", function($scope, $routeParams, $location, SocketService) {
	$scope.roomName = $routeParams.roomName;
	$scope.currentMessage = "";

	var meUser = SocketService.getUsername();
	$scope.userName = meUser;

	var socket = SocketService.getSocket();

	if(socket) {
		socket.emit("joinroom", { room: $scope.roomName, pass: "" }, function(success, errorMessage) {

		});


		socket.on("updatechat", function(roomname, messageHistory) {
			// console.log(messageHistory);
			$scope.messages = messageHistory;
			$scope.$apply();
			var wholeHeight = $(".chat-window")[0].scrollHeight;
			$(".chat-window").scrollTop(wholeHeight);
		
		});

		socket.on("updateusers", function(rooms, users) {
			// console.log("USER");
			console.log(users);
			if(rooms === $scope.roomName) {
				$scope.users = users;
			}
		});


		socket.emit("rooms");
		socket.on("roomlist", function(data) {
			console.log(data);
			$scope.rooms = Object.keys(data);
			$scope.$apply();
		});

		socket.on("kicked", function(room, me) {
			// console.log("hoho " + me);

			if (me === meUser) {
				$location.path("/room/lobby");
			}

		});


	}

	$scope.send = function() {
		if(socket) {


			var split = $scope.currentMessage.split(" ");

			if (split[0] === '/kick') {
				var userToKick = split[1];

				socket.emit("kick", { user: userToKick, room: $scope.roomName }, function(success) {
						console.log(success);

						if (success) {
							console.log(userToKick + " has been kicked");

						} else {

							console.log("failed to kick");
						}
				});
				
			} else {

				console.log("I sent a message to " + $scope.roomName + ": " + $scope.currentMessage);
				socket.emit("sendmsg", { roomName: $scope.roomName, msg: $scope.currentMessage });

			}

			$scope.currentMessage = "";
		}
	};

	$scope.keyPress = function($event) {
		if($event.keyCode === 13) {
			$scope.send();
		}
	};

	$scope.createRoom = function() {
		console.log("NEW ROOM");
		$("#blackout").fadeIn();
		$("#create-room").fadeIn();
		socket.emit("rooms");


	};

	$scope.create = function() {
			var n = $("#room-name").val();
			// console.log("name " +n);
			$("#blackout").fadeOut();
			$("#create-room").fadeOut();
			$location.path("/room/" + n);
			socket.emit("rooms");

	};

	$scope.menuClose = function() {
		console.log("close menu");
		$("#create-room").fadeOut();
		$("#blackout").fadeOut();
	};

}]);