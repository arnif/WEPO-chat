app.factory("SocketService", ["$http", function($http) {
	var username = "";
	var socket;
	var rooms = [];
	return {
		setConnected: function(theSocket) {
			socket = theSocket;
		},
		setUsername: function(user) {
			username = user;
		},
		getUsername: function() {
			return username;
		},
		getSocket: function() {
			return socket;
		},
		addJoinedRoom: function(room) {
			rooms.push(room);
		},
		getJoinedRooms: function() {
			return rooms;
		},
		removeJoinedRoom: function(room) {
			rooms.splice( rooms.indexOf(room), 1 );
		}
	};
}]);