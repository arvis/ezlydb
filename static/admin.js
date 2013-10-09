function FormListCtrl($scope, $http) {
  $http.get('/admin/form_list').success(function(data) {
    $scope.forms_list = data;
  });
 
}



function PhoneListCtrl($scope, $http) {
  $http.get('static/form_data.json').success(function(data) {
    $scope.phones = data;
  });
 
  $scope.orderProp = 'age';
}
 


function DbFieldController($scope,$http) {
    $scope.master= [];
    //$scope.formProps.form_type={id:"single_record"};
    

    $scope.add = function(dbField) {
        //$scope.master= angular.copy(dbField);
        //angular.extend($scope.master, dbField);
        $scope.master.push(dbField);
        $scope.dbField ={};
        $scope.showAddField=false;
    };
    
    $scope.set_data = function(field_name) {
        console.log(field_name);
        
        $scope.dbField =field_name;
    };
    
    $scope.post_form_data= function(){
        $http.post('/admin/add_form', $scope.master).success(function(data) {
            //TODO: show some notification
            console.log("data saved");
        });     
    };
    
    
    

    $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
    };

    $scope.reset();
}
