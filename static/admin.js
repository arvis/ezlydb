

function FormListController($scope, $http) {
  $scope.form_name="new";
  $scope.show_form=false;
  $http.get('/admin/form_list').success(function(data) {
    $scope.forms_list = data;
  });

    $scope.formMenuClick = function(param) {
        //console.log("formMenuClick");
        //if (!param) param={};
        $scope.$broadcast('formMenuClick',param);
    };
 
    $scope.formMenuToRoot = function(param) {
        $scope.$emit('formMenuClick',param);
    };
 
 
 
}

function DbFieldController($scope,$http) {
    $scope.form_name="new";
    $scope.master= [];
    $scope.formProps={};
    $scope.showFieldList=false;
    $scope.showAddFieldButton=false;
    
    //$scope.formProps.form_type={id:"single_record"};

    $scope.load_form = function(param) {
        console.log("load_form "+param);
    };

    $scope.$on('formMenuClick', function($sc,param) {
        $scope.master= [];
        //$scope.formProps=param;
        
        $scope.showFieldList=true;

        //creating a new form
        if (!param){
            //$scope.formProps.id="";
            $scope.formProps.title="";
            $scope.formProps.name="";
            $scope.showAddFieldButton=false;
            $scope.showFormProperties=true;
            return;
        }
        
        $scope.formProps.id=param._id.$oid;
        $scope.formProps.title=param.title;
        $scope.formProps.name=param.name;
        $scope.showAddFieldButton=true;

        $scope.get_form_fields();
    });
    
    $scope.get_form_fields= function() {
        
        var data={};
        
        if (!$scope.formProps.id) return;
        
        data.form_id=$scope.formProps.id;
        
        $http.post('/admin/get_form_fields/', data).
        success(function(data, status, headers, config) {
            $scope.master=data;
            
        }).
        error(function(data, status, headers, config) {
            console.log("failure");
        });
        
        
    }
      

    $scope.set_field_properties = function(dbField) {
        
        var data={};
        
        //deleting fields that are used only on client side
        dbField.editorEnabled=false;
        delete dbField.editorEnabled;
        if (dbField._id){
            data.id=dbField._id.$oid;
        }        

        data.form_id=$scope.formProps.id;
        
        data.data=dbField;

        $http.post('/admin/set_field_properties/', data).
        success(function(data, status, headers, config) {
            
            //var json_data=JSON.parse(data);
            json_data=data;
            console.log(json_data);
            
            if (json_data["operation"]=="insert"){
                dbField._id={};
                dbField._id.$oid=json_data["id"];
                
                $scope.master.push(dbField);
            }
            else {
                
            }
            
            
            $scope.dbField ={};
        }).
        error(function(data, status, headers, config) {
            console.log("failure");
        });
        
        $scope.showAddField=false;
        
        
    };
    
    $scope.set_form_properties = function() {

        var data={};
        data.data={};
        data.id=$scope.formProps.id;
        data.data.name=$scope.formProps.name;
        data.data.title=$scope.formProps.title;
        
        $http.post('/admin/set_form_properties/', data).
        success(function(data, status, headers, config) {
            console.log("success form props"+data);
            $scope.formProps.id=data;
            $scope.showAddFieldButton=false;

        }).
        error(function(data, status, headers, config) {
            console.log("failure");
        });
        $scope.showFormProperties=!$scope.showFormProperties;
    }
    
    
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
