app.factory("PrivateService", ["$http", function($http) {
	var pms = [];
	return {
		addPm: function(pmObj) {
			console.log("ADD TO PM ");

			pms.push(pmObj);
			
		},
		getPmHistory: function(){
			
			return pms; 
		}

	};
}]);