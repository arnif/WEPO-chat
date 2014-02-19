app.factory("RoomService", ["$http", function($http) {
	var rooms = [];
	return {
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