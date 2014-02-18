app.controller("RoomController", ["$scope", "$routeParams", "$location", "SocketService", function($scope, $routeParams, $location, SocketService) {
	$scope.roomName = $routeParams.roomName;
	$scope.currentMessage = "";

	var meUser = SocketService.getUsername();
	$scope.userName = meUser;

	var joinedRooms = SocketService.getJoinedRooms();

	var socket = SocketService.getSocket();

	console.log(joinedRooms);

	$scope.rName = joinedRooms;	
	

	if(socket) {
		socket.emit("joinroom", { room: $scope.roomName, pass: "" }, function(success, errorMessage) {
			// console.log(errorMessage);

			//check if already joined

			console.log($.inArray($scope.roomName, joinedRooms));

			if ($.inArray($scope.roomName, joinedRooms) < 0) {
				// console.log("PUSH  " + $scope.roomName);
				SocketService.addJoinedRoom($scope.roomName);
				// console.log("JOINED...");
				// console.log(joinedRooms);
			} 

			


			if(errorMessage === "banned")
			{
				showError("You are banned from " + $scope.roomName);

				$location.path("/room/lobby");
			} 
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
			// console.log(users);
			if(rooms === $scope.roomName) {
				$scope.users = users;
				// $scope.apply();
			}
		});


		socket.emit("rooms");
		socket.on("roomlist", function(data) {
			// console.log(data);
			$scope.rooms = Object.keys(data);
			$scope.$apply();
		});

		socket.on("kicked", function(room, me) {
			// console.log("hoho " + me);

			if (me === meUser) {
				console.log("im out");
				SocketService.removeJoinedRoom($scope.roomName);
				$location.path("/room/lobby");
				showError("You have been kicked from " + $scope.roomName);
			}

		});

		socket.on("banned", function(room, me) {
			// console.log("hoho " + me);

			if (me === meUser) {

				SocketService.removeJoinedRoom($scope.roomName);
				showError("You have been banned from " + $scope.roomName);
				
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
						// console.log(success);

						if (success) {

							showError(userToKick + " has been kicked from " + $scope.roomName);
			
							
							console.log(userToKick + " has been kicked");

						} else {

							console.log("failed to kick");
						}
				});
				
			} 
			if(split[0] === '/ban') {
				var userToBan = split[1];

				socket.emit("ban", { user: userToBan, room: $scope.roomName }, function(success) {
					if(success) {
						console.log(userToBan + " has been banned");
					}
					else {
						console.log("failed to ban");
					}
				});
			}

			if(split[0] === '/unban') {
				var userToUnban = split[1];

				socket.emit("unban", { user: userToUnban, room: $scope.roomName }, function(success) {
					if(success) {
						showError(userToUnban + " has been unbaned from " + $scope.roomName);
						console.log(userToUnban + " has been Unbanned");
					}
					else {
						console.log("failed to unban");
					}
				});
			}

			else {

				// console.log("I sent a message to " + $scope.roomName + ": " + $scope.currentMessage);
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
			console.log("creat roomname " +n);
			$("#blackout").fadeOut();
			$("#create-room").fadeOut();
			
			socket.emit("joinroom", { room: n, pass: "" }, function(success, errorMessage) {
				if (success) {
					$location.path("/room/" + n);

				}
			});

			socket.emit("rooms");

	};

	$scope.menuClose = function() {
		console.log("close menu");
		$("#create-room").fadeOut();
		$("#blackout").fadeOut();
	};

	$scope.leaveRoom = function(){
		if ($scope.roomName === "lobby") {
			console.log("cant leave lobby");
		} else {
			socket.emit("partroom", $scope.roomName);
			SocketService.removeJoinedRoom($scope.roomName);
			$location.path("/room/lobby");
		}	
		
	};

	$scope.setActive = function(activate) {
		// console.log(activate);

		if ($scope.roomName === activate){
			// console.log(activate + " is active");
			return "active primary";
		}
	};

	function showError(stuff) {
		$("#dangerMsg").fadeIn();
		$("#mmsg").html(stuff);
		setTimeout(function()  {
		$("#dangerMsg").fadeOut();
		}, 10000);
	}


}]);