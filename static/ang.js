var frontApp = angular.module('frontApp', []);
//adminApp.controller('SingleRowReportAdmin', function ($scope,$http) {


//function RootFrontController($scope, $http) {
frontApp.controller('RootFrontController', function ($scope,$http) {

    $scope.showForm=false;
    $scope.showReport=false;
    $scope.formParams="";
    $scope.reportParams="";
    $scope.showDashboard=true;
    
    
    $scope.$on('formMenuClick', function($sc,param) {
        $scope.showForm=true;
        $scope.showReport=false;
        $scope.showDashboard=false;
        $scope.$broadcast('formClickonChild',param);
    });

    $scope.$on('reportMenuClick', function($sc,param) {
        $scope.showForm=false;
        $scope.showReport=true;
        $scope.showDashboard=false;
        
        $scope.report_name=param.name;
        $scope.report_id=param._id.$oid;
        $scope.formParams="";

        
        $scope.$broadcast('reportClickonChild',param);
    });
    
    $scope.$on('customButtonClick', function($sc,field,button_id,form_id) {
        var data={};
        data["form_id"]=form_id;
        data["button_id"]=button_id;
        
        $http.post('/admin/button_data/',data).success(function(return_data) {
            param={};
            param["button_action"]=return_data["button_action"];
            param["object_id"]=form_id;
            param["linked_form"]=return_data["linked_form"];
            param["field_id"]=return_data["filter_field_name"];
            param["linked_field_name"]=return_data["linked_field_name"];
            
            if (return_data["linked_field_type"]==="lookup_field"){
                var json_data={};
                json_data["id"]=field._id.$oid;
                json_data["name"]=field[return_data["filter_field_name"]];
                param["field_value"]=JSON.stringify(json_data);
            }
            else {
                param["field_value"]=field[return_data["filter_field_name"]];
            }
            
            if (return_data["set_field_value"]){
                param["set_field_value"]=return_data["set_field_value"];
            }
            else {
                param["set_field_value"]=false;
            }
            
            //sample url should look like this, first is dummy value
            //objectid/?params=1&linked_field_name=field_value
            if (return_data["button_action"]==="open_report"){
                $scope.showForm=false;
                $scope.showReport=true;
                $scope.$broadcast('customButtonReport',param,field);
            }
            else {
                $scope.showForm=true;
                $scope.showReport=false;
                $scope.$broadcast('customButtonForm',param);
            }
        });
    });
});

frontApp.controller('ReportController', function ($scope,$http) {
//function ReportController($scope, $http) {
    $scope.form_name="";
    $scope.form_id="";
    //$scope.data=[];
    $scope.report_id="";

/*
    $scope.getReportData=function(){
        $http.get('report_data/'+$scope.report_id).success(function(data) {
            $scope.data = data;
        });
    }
*/
    $scope.getLookupData=function(data){
        try {
            var obj = JSON.parse(data);
            return obj.name;
        }
        catch(err){
            return data;
        }
    }

    $scope.$on('reportClickonChild', function($sc,param) {
        //console.log(param);
        $scope.report_name=param.name;
        $scope.report_id=param._id.$oid;
        $scope.formParams="";
        //$scope.getReportData();
        
    });
    
    $scope.$on('customButtonReport', function($sc,param,field) {
        //object_id/?params=1&linked_field_name=field_value
        $scope.report_id=param["linked_form"];
        $scope.formParams=""
        if (param["field_id"]=="id"){
            $scope.formParams="?id="+field._id.$oid;
        }
        else {
            $scope.formParams="?"+param["linked_field_name"]+"="+param["field_value"];
        }
        //console.log("report_url"+ $scope.report_id+"/"+$scope.formParams );
        
        //$scope.getReportData();
    });
});

frontApp.controller('SingleFormController', function ($scope,$http) {
//function SingleFormController($scope, $http) {
    
  $scope.form_name="";  
  $scope.form_id="";  
  $scope.buttons={};
  $scope.field={};
  $scope.formParams="";
  $scope.formParamName="";
  $scope.formParamValue="";
  $scope.setFieldData=false;
  
  $scope.get_data=function(){
    $http.get('/data/'+$scope.form_id+$scope.formParams).success(function(data) {
        $scope.data = data;
    });
  }
  
  $scope.get_button_data=function(){
    var button_data={};
    button_data["form_id"]=$scope.form_id;
    $http.post('/admin/button_list/',button_data).success(function(data) {
        $scope.buttons = data;
    });
  }
  
    $scope.$on('formClickonChild', function($sc,param) {
        $scope.form_name=param.name;
        $scope.form_id=param._id.$oid;
        $scope.formParams="";
        $scope.formParamName="";
        $scope.formParamValue="";
        $scope.get_data();
        $scope.get_button_data();
    });

    $scope.$on('customButtonForm', function($sc,param) {
        //object_id/?params=1&linked_field_name=field_value
        $scope.form_name=param["linked_form"];
        $scope.form_id=param["linked_form"];
        $scope.formParams="?"+param["linked_field_name"]+"="+param["field_value"];
        $scope.formParamName=param["linked_field_name"];
        $scope.formParamValue=param["field_value"];
        $scope.set_field_value=param["set_field_value"];
        
        //console.log($scope.form_name+"/"+$scope.formParams );
        $scope.get_data();
        $scope.get_button_data();
        
    });


  $scope.get_lookup_values=function(){
      
  };

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
  };

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
    
    // if there is param name and it is requested to set it as data, overwriting as filter value
    if ($scope.formParamName && $scope.set_field_value==true){
        data.data[$scope.formParamName]=$scope.formParamValue;
    }
    
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
  };

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
  };

  $scope.open_report=function(field,button_id){
      console.log("open_report button id "+button_id);
      $scope.$emit('customButtonClick',field,button_id,$scope.form_id);
  };
  
  $scope.open_form=function(field,button_id){
    console.log("open_form button id "+button_id);
    $scope.$emit('customButtonClick',field,button_id,$scope.form_id);
  };
  
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
});

frontApp.controller('SingleReportController', function ($scope,$http) {
//function SingleReportController($scope, $http) {
    console.log(report_js);
    $scope.report_data=report_js;
/*
    $http.get('report_data/'+$scope.report_id).success(function(data) {
        $scope.data = data;
    });
*/    
});


frontApp.controller('MasterDetailReportController', function ($scope,$http) {
    console.log("report_data");
    //$scope.report_data=report_js;
    //$scope.detail_report_data=report_detail_js;


    $scope.getLookupData=function(data){
        //console.log(data);
        try {
            var obj = JSON.parse(data);
            return obj.name;
        }
        catch(err){
            return data;
        }
    }


    
});


 

