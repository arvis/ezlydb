function PhoneListCtrl($scope, $http) {
  $http.get('static/form_data.json').success(function(data) {
    $scope.phones = data;
  });
 
  $scope.orderProp = 'age';
}
 
//PhoneListCtrl.$inject = ['$scope', '$http'];


function Controller($scope) {
  $scope.master= {};
 
  $scope.update = function(user) {
    $scope.master= angular.copy(user);
  };
 
  $scope.reset = function() {
    $scope.user = angular.copy($scope.master);
  };
 
  $scope.reset();
}
