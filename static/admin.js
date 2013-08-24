function PhoneListCtrl($scope, $http) {
  $http.get('static/form_data.json').success(function(data) {
    $scope.phones = data;
  });
 
  $scope.orderProp = 'age';
}
 
//PhoneListCtrl.$inject = ['$scope', '$http'];


function DbFieldController($scope) {
    $scope.master= {};

    $scope.update = function(dbField) {
        $scope.master= angular.copy(dbField);
    };

    $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
    };

    $scope.dbField.field_type = 'text_field';


    $scope.reset();
}
