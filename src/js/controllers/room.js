app.controller("RoomController", ["$scope", "$routeParams", "$location", "SocketService", "RoomService", "PrivateService", function($scope, $routeParams, $location, SocketService, RoomService, PrivateService) {
	$scope.roomName = $routeParams.roomName;
	$scope.currentMessage = "";

	var meUser = SocketService.getUsername();
	$scope.userName = meUser;

	var msgCount = 0;

	var skammakrokur = false;

	// console.log("me user " + meUser);

	if (meUser === "") {
		showError("Please log in to continue ", "danger");
		$location.path("/");
		return;
	}
	

	var joinedRooms = RoomService.getJoinedRooms();

	var socket = SocketService.getSocket();

	// console.log(joinedRooms);

	$scope.rName = joinedRooms;	
	

	if(socket) {
		socket.emit("joinroom", { room: $scope.roomName, pass: "" }, function(success, errorMessage) {
			// console.log(errorMessage);

			if(errorMessage === "banned")
			{
				showError("You are banned from " + $scope.roomName, "danger");

				$location.path("/room/lobby");
			} else {
				// console.log($.inArray($scope.roomName, joinedRooms));

				//check if already joined
				if ($.inArray($scope.roomName, joinedRooms) < 0) {

					RoomService.addJoinedRoom($scope.roomName);
					showError("You joined " + $scope.roomName, "success");

				} 
			}
		});


		socket.on("updatechat", function(roomname, messageHistory) {
			// console.log(messageHistory);
			// console.log(roomname);

			if ($scope.roomName === roomname) {
				$scope.messages = messageHistory;
				$scope.$apply();
				var wholeHeight = $(".chat-window")[0].scrollHeight;
				$(".chat-window").scrollTop(wholeHeight);
			}
		
		});

		socket.on("updateusers", function(rooms, users, ops) {

			if(rooms === $scope.roomName) {

				$scope.users = users;
				$scope.ops = ops;
				$scope.$apply();

			}
		});

		socket.on("updatetopic", function(room, topic) {
			// console.log(topic);
			$scope.topic = topic;
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
				RoomService.removeJoinedRoom($scope.roomName);
				$location.path("/room/lobby");
				showError("You have been kicked from " + $scope.roomName, "warning");
			} else if (room === $scope.roomName) {
				showError(me + " has been kicked from " + $scope.roomName, "info");
			}

		});

		socket.on("banned", function(room, me) {
			// console.log("hoho " + me);

			if (me === meUser) {

				RoomService.removeJoinedRoom($scope.roomName);
				showError("You have been banned from " + $scope.roomName, "danger");
				
				$location.path("/room/lobby");

			} else if (room === $scope.roomName) {
				showError(me + " has been banned from " + $scope.roomName, "info");
			}

		});


		socket.on("opped", function(room, me, ro) {
			if(me === meUser && room === $scope.roomName) {
				showError("You have been given the status of Operator in " + $scope.roomName, "success");
			} else if (room === $scope.roomName) {
				showError(me + " has been made op in", "info");
			}

		});

		socket.on("deopped", function(room, me, ro) {
			if(me === meUser && room === $scope.roomName) {
				showError("You have been removed as Operator in " + $scope.roomName, "success");
			} else if (room === $scope.roomName) {
				showError(me + " has been  deopped", "info");
			}

		});

		socket.on("recv_privatemsg", function (from, message){
			console.log("RECV");
			console.log("sec " + message);
			var obj = {};
			obj.sender = from;
			obj.nick = $scope.userName;
			obj.message = message;
			PrivateService.addPm(obj);
			$scope.showPm();

			var wholeHeight = $(".pm-window")[0].scrollHeight;
			$(".pm-window").scrollTop(wholeHeight);

			showError("Private message recived from <strong>" + from + "</strong>", "info");

			$scope.currentMessage = "/pm " + from + " ";

			$("#appendedInputButton").focus();

			// $scope.$apply();

		});


	}

	$scope.send = function() {

		if(socket) {

			if ($scope.currentMessage === "") {
				$("#appendedInputButton").focus();
				return;
			}

			msgCount += 1;
			delay = 20;

			// console.log("msg count " + msgCount);

			if (skammakrokur === false) {
				setTimeout(function() {
					if (skammakrokur === false) {
						// console.log("RESET msg");
						msgCount = 0;
					}
				}, 10000);
			}

			if (msgCount > 5) {
				$(".skamm").prop('disabled', true);
				skammakrokur = true;
				showError("Play nice! dont't be spammin' You're muted for 25 sec.", "danger");
				setTimeout(function() {
					// console.log("skammakrokur");
					msgCount = 0;
					showError("You play now, but play nice!", "info");
					$(".skamm").prop('disabled', false);
					skammakrokur = false;
				}, 25000);
				return;
			}


			var split = $scope.currentMessage.split(" ");

			if (split[0] === '/kick') {
				var userToKick = split[1];

				socket.emit("kick", { user: userToKick, room: $scope.roomName }, function(success) {
						// console.log(success);

						if (success) {

							showError(userToKick + " has been kicked from " + $scope.roomName, "info");
			
							
							console.log(userToKick + " has been kicked");

						} else {

							console.log("failed to kick");
							showError("Failed to kick are you op ?", "warning");
						}
				});
				
			} 
			else if(split[0] === '/ban') {
				var userToBan = split[1];

				socket.emit("ban", { user: userToBan, room: $scope.roomName }, function(success) {
					if(success) {
						console.log(userToBan + " has been banned");
						showError(userToBan + " has been banned from " + $scope.roomName, "success");
					}
					else {
						console.log("failed to ban");
						showError("Failed to ban are you op ? or is user banned ?", "warning");
					}
				});
			}

			else if(split[0] === '/unban') {
				var userToUnban = split[1];

				socket.emit("unban", { user: userToUnban, room: $scope.roomName }, function(success) {
					if(success) {
						showError(userToUnban + " has been unbaned from " + $scope.roomName, "success");
						console.log(userToUnban + " has been Unbanned");
					}
					else {
						console.log("failed to unban");
						showError("failed to unban are you op ? or is user banned ?", "warning");
					}
				});
			}

			else if (split[0] === '/settopic') {
				split.shift();
				var theTopic = split.join(" ");
				socket.emit("settopic", { topic: theTopic ,room: $scope.roomName}, function(success) {
					if (success) {
						showError("Topic successfully changed...", "success");
					} else {
						showError("Can't change topic, are you op ?", "warning");
					}
					
				});
			}

			else if(split[0] === '/op') {
				var userToOp = split[1];

				socket.emit("op", { user: userToOp, room: $scope.roomName }, function(success) {
					if(success) {
						showError(userToOp + " has been made op", "success");
					}
					else {
						showError("Failed to make op", "warning");
						console.log("Failed to make a new admin");
					}
				});
			}

			else if(split[0] === '/deop') {
				var userToDeOp = split[1];

				socket.emit("deop", { user: userToDeOp, room: $scope.roomName }, function(success) {
					if(success) {
						console.log("admin removed");
						showError(userToDeOp + " has been deoped", "success");
					}
					else {
						console.log("Failed to remove admin");
						showError("Failed to deop", "warning");
					}
				});
			}

			else if(split[0] == "/pm") {

				var pmObj = {};
				pmObj.sender = $scope.userName;
				pmObj.nick = split[1];
				split.shift();
				split.shift();
				var msg = split.join(" ");
				if (msg === "") {
					$scope.currentMessage = "/pm " + pmObj.nick + " ";
					$("#appendedInputButton").focus();
					return;
				}
				pmObj.message = msg;
				// console.log(pmObj);

				socket.emit("privatemsg", pmObj, function(status) {

					if (status) {
						console.log("SENTPM");
						showError("Private message sent to <strong>" + pmObj.nick + "</strong>", "success");
						PrivateService.addPm(pmObj);
						$scope.showPm();
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
		else if ($event.keyCode === 27) {
			$scope.currentMessage = "";
		}
	};

	$scope.createRoom = function() {
		// console.log("NEW ROOM");
		$scope.closePrvt();
		$("#blackout").fadeIn();
		$("#create-room").fadeIn();
		socket.emit("rooms");


	};

	$scope.helpBox = function() {
		// console.log("Help");
		$scope.closePrvt();
		$("#blackout").fadeIn();
		$("#help").fadeIn();
		

	};

	$scope.create = function() {
			var n = $("#room-name").val();
			console.log("creat roomname " +n);
			$("#blackout").fadeOut();
			$("#create-room").fadeOut();

			if (n.length > 10) {
				showError("Room name too long", "danger");
				return;
			}

			n = n.replace(/\s/g, "-");

			var first = (n.charAt(0));

			if (first.search(/[^A-Za-z | ^0-9]/) != -1) {	
				showError("Invalid token in room name ", "danger");
				return;
				
			} 
			
			socket.emit("joinroom", { room: n, pass: "" }, function(success, errorMessage) {
				if (success) {
					
					$location.path("/room/" + n);

				} 
			}); 

			socket.emit("rooms");

	};

	$scope.menuClose = function() {
		// console.log("close menu");
		$("#create-room").fadeOut();
		$("#blackout").fadeOut();
		
	};

	$scope.helpClose = function() {
		$("#help").fadeOut();
		$("#blackout").fadeOut();
		
	};

	$scope.leaveRoom = function(){
		if ($scope.roomName === "lobby") {
			// console.log("cant leave lobby");
			showError("Cant Leave lobby", "info");
		} else {
			socket.emit("partroom", $scope.roomName);
			RoomService.removeJoinedRoom($scope.roomName);
			showError("You left " + $scope.roomName, "info");
			$location.path("/room/lobby");
		}	
		
	};

	$scope.setActive = function(activate) {
		// console.log(activate);

		if ($scope.roomName === activate){
			// console.log(activate + " is active");
			$(".close-room").hide();

			if (activate !== 'lobby') {
				// console.log($("#" + activate).next(".close-room"));
				$("#" + activate).next(".close-room").show();
			}

			return "active";
		}
	};

	$scope.disconnect = function() {
		socket.emit("logout");
		showError("You have been disconnected...Hope to see you soon..", "success");
		
		setTimeout(function() {
			$("#blackout").fadeIn();
			$("#dangerMsg").fadeOut();
		},2000);
		$location.path("/");
		

	};

	$scope.showPm = function() {

		$scope.pms = PrivateService.getPmHistory();

		if(!$scope.$$phase) {
			$scope.$apply();
		}
		

		if ($(".private-message").is(":visible") === false) {

			// $(".private-message").css({"right": "0"});
			$(".private-message").fadeIn();
			// $(".private-message").animate({ "right": "-=162px" }, "slow" );
		}
	};


	$scope.pm = function(sendTo) {
		// console.log("sendTo " +sendTo);
		if (sendTo === $scope.userName) {
			showError("Why would you want to talk to your self ?", "info");
			return;
		}

		$scope.currentMessage = "/pm " + sendTo + " ";

		$("#appendedInputButton").focus();

		// $scope.pms = PrivateService.getPmHistoryFrom(sendTo, meUser);
		

	};

	$scope.closePrvt = function() {

		if ($(".private-message").is(":visible") === true){
			$(".private-message").hide();
		}
	};



	function showError(stuff, stile) {

		if (stile === "success") {
			$("#dangerMsg").removeClass();
			$("#dangerMsg").addClass("alert alert-block alert-success");
		} else if (stile === "info") {
			$("#dangerMsg").removeClass();
			$("#dangerMsg").addClass("alert alert-block alert-info");
		} else if (stile === "warning") {
			$("#dangerMsg").removeClass();
			$("#dangerMsg").addClass("alert alert-block alert-warning");
		}else {
			$("#dangerMsg").removeClass();
			$("#dangerMsg").addClass("alert alert-block alert-danger");
		}

		$("#dangerMsg").fadeIn();
		$("#mmsg").html(stuff);
		
	}

}]);