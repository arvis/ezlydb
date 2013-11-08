function FormListCtrl($scope, $http) {
  $http.get('/admin/form_data').success(function(data) {
    $scope.phones = data;
  });
 
  $scope.orderProp = 'age';
}
