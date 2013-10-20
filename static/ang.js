 
function SingleFormController($scope, $http) {
  //$scope.data=[];  
  $scope.form_name="sample_form_name";  
  $scope.formProps={};
  
  $http.get('data/aaa').success(function(data) {
    $scope.data = data;
  });

  
  
  $scope.set_data=function(){
    //$http.post('/someUrl', data).success(successCallback);
    var data={};
    data.userid=1;
    data.form_name=$scope.form_name;
    data.data=$scope.formProps;
    console.log(data);  
    
    $http.post('/post_data/', data).
      success(function(data, status, headers, config) {
          $scope.formProps={};
          console.log("success");
          
      }).
      error(function(data, status, headers, config) {
          console.log("failure");
      });
    
    
    
      
  };
    
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

/*

var phonecatServices = angular.module('phonecatServices', ['ngResource']);

phonecatServices.factory('Phone', ['$resource',
  function($resource){
    return $resource('phones/:phoneId.json', {}, {
      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
    });
  }]);

var phonecatApp = angular.module('phonecatApp', [
  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices'
]);

phonecatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/phones', {
        templateUrl: 'partials/phone-list.html',
        controller: 'PhoneListCtrl'
      }).
      when('/phones/:phoneId', {
        templateUrl: 'partials/phone-detail.html',
        controller: 'PhoneDetailCtrl'
      }).
      otherwise({
        redirectTo: '/phones'
      });
  }]);
  
  
var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {
    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
      $scope.mainImageUrl = phone.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);

*/
