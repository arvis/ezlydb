function PhoneListCtrl($scope, $http) {
  $http.get('static/form_data.json').success(function(data) {
    $scope.phones = data;
  });
 
  $scope.orderProp = 'age';
}
 
//PhoneListCtrl.$inject = ['$scope', '$http'];


function DbFieldController($scope) {
    $scope.master= [];

    $scope.add = function(dbField) {
        //$scope.master= angular.copy(dbField);
        //angular.extend($scope.master, dbField);
        $scope.master.push(dbField);
        $scope.dbField ={};
       
    };

    $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
    };

    //  $scope.dbField.field_type = 'text_field';


    $scope.reset();
}
