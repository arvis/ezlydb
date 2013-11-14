
function RootFrontController($scope, $http) {
    $scope.showForm=false;
    $scope.showReport=false;
    
    $scope.$on('formMenuClick', function($sc,param) {
        $scope.showForm=true;
        $scope.showReport=false;
        
        $scope.$broadcast('formClickonChild',param);
    });

    $scope.$on('reportMenuClick', function($sc,param) {
        console.log('reportMenuClick');
        $scope.showForm=true;
        $scope.showReport=false;
        
        $scope.$broadcast('reportClickonChild',param);
    });
    
    
}

function ReportController($scope, $http) {
    $scope.form_name="";
    $scope.form_id="";
    $scope.data=[];

    $scope.$on('reportClickonChild', function($sc,param) {
        //console.log(param);
        $scope.report_name=param.name;
        $scope.report_id=param._id.$oid;
        
        
        $http.get('report_data/'+$scope.report_id).success(function(data) {
            $scope.data = data;
        });
        
    });


}
 
function SingleFormController($scope, $http) {
    
  $scope.form_name="";  
  $scope.form_id="";  
  
  $scope.field={};

    $scope.$on('formClickonChild', function($sc,param) {
        //console.log(param);
        $scope.form_name=param.name;
        $scope.form_id=param._id.$oid;
        
        
        $http.get('data/'+$scope.form_id).success(function(data) {
            $scope.data = data;
            //console.log(data[1]._id.$oid)
            
            
            
        });
        
    });

  $scope.get_lookup_values=function(){
      
  }

  $scope.delete_row=function(row, index){

    var data={};
    data.id=row._id.$oid;
    data.form_name=$scope.form_id;

    console.log(data.id); 
    $http.post('/delete_row/', data).
      success(function(data, status, headers, config) {
          $scope.data.splice(index,1);
          console.log("success delete_row");
          
      }).
      error(function(data, status, headers, config) {
          console.log("failure");
    });
    
    
  }

  $scope.update_row=function(row){
    var data={};
    var is_insert=true;
    
    if (row._id){
        data.id=row._id.$oid;
        //delete row._id;
        is_insert=false;
    }
    //row.editorEnabled=false;
    delete row.editorEnabled;
            
    data.data=row;
    data.form_name=$scope.form_id;
    
    $http.post('/post_data/', data).
      success(function(return_data, status, headers, config) {
          //$scope.formProps={};
          console.log("success");
          if (is_insert) {
              row._id={};
              row._id.$oid=return_data;
              $scope.data.push(row);
              row={};
              $scope.field={};
          }
          else {
              row._id={};
              row._id.$oid=data.id;
          }
          
          
      }).
      error(function(data, status, headers, config) {
          console.log("failure");
      });
  
  
  }


  $scope.add_row=function(){

    //$scope.formProps=row;
    var data={};
    data.data=$scope.field;
    console.log(data);  
    
    $http.post('/add_row/', data).
      success(function(data, status, headers, config) {
          $scope.data.push($scope.field);
          $scope.field={};
          
      }).
      error(function(data, status, headers, config) {
          console.log("failure");
      });
    
    
  }

  
  
  $scope.set_data=function(){
    //$http.post('/someUrl', data).success(successCallback);
    
    console.log("set data");
    
    var data={};
    data.userid=1;
    data.form_name=$scope.form_name;
    data.data=$scope.formProps;
    //console.log(data);  
    
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
