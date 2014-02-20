app.factory("PrivateService", ["$http", function($http) {
	var pms = [];
	return {
		addPm: function(pmObj) {
			pms.push(pmObj);
			
		},
		getPmHistory: function(){	
			return pms; 
		}

	};
}]);