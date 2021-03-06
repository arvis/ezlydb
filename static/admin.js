var adminApp = angular.module('adminApp', []);
//adminApp.controller('PhoneListCtrl', function ($scope) {
//});
function RootBackController($scope, $http) {
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
}


function FormListController($scope, $http) {
    $scope.form_name = "new";
    $scope.show_form = false;
    $scope.showDashboard=true;
    $scope.current_form = {};
    $scope.field_list = {};

    $http.get('/admin/form_list').success(function(data) {
        $scope.forms_list = data;
        //$scope.current_form=data[1];    
    });

    $scope.formMenuClick = function(param) {
        $scope.showDashboard=false;
        $scope.$broadcast('formMenuClick', param);
    };

    $scope.formMenuToRoot = function(param) {
        if (!param) {
            param = $scope.current_form;
        }
        $scope.$emit('formMenuClick', param);
    };

    $scope.$on('formSelected', function($sc, param) {
        $scope.current_form = $scope.forms_list[param];
    });

    $scope.getFormFields = function(form) {
        console.log($scope.current_form);
        var data = {};
        data.form_id = $scope.current_form._id.$oid;
        $scope.current_lookup_form = $scope.current_form;

        $http.post('/admin/get_form_fields/', data).
                success(function(return_data, status, headers, config) {
            $scope.field_list = return_data;

        }).error(function(data, status, headers, config) {
            console.log("failure");
        });
    };

    $scope.lookupFieldSet = function(field) {
        param = {};
        param.field_id = $scope.current_field._id.$oid;
        param.field_name = $scope.current_field.name;
        param.field_type = $scope.current_field.field_type;
        param.form_id = $scope.current_lookup_form._id.$oid;
        //$scope.dbField["lookup"]=param;
        $scope.$emit('lookupFieldSet', param);

    };




}

function ReportListController($scope, $http) {
    $scope.report_list = {};
    $scope.current_report = {};

    $http.get('/admin/report_list').success(function(data) {
        $scope.report_list = data;
        console.log($scope.report_list);
    });

    $scope.reportMenuClick = function(param) {
        $scope.$broadcast('reportMenuClick', param);
        $scope.showDashboard = false;
    };

    $scope.reportMenuToRoot = function(param) {
        $scope.$emit('reportMenuClick', param);
        $scope.showDashboard = false;
    };



}

function DbFieldController($scope, $http) {
    $scope.form_name = "new";
    $scope.master = [];
    $scope.formProps = {};
    $scope.showFieldList = false;
    $scope.showAddFieldButton = false;
    $scope.dbField = {};
    $scope.lookup = {};
    $scope.forms_list = {};
    $scope.field_list = {};
    $scope.current_lookup_form = {};

    $scope.load_form = function(param) {
        console.log("load_form " + param);
    };

    $scope.$on('lookupFieldSet', function($sc, param) {
        $scope.dbField["lookup"] = param;
        console.log(param);
    });

    $scope.$on('formMenuClick', function($sc, param) {
        $scope.master = [];
        //$scope.formProps=param;

        $scope.showFieldList = true;

        //creating a new form
        if (!param) {
            //$scope.formProps.id="";
            $scope.formProps.title = "";
            $scope.formProps.name = "";
            $scope.showAddFieldButton = false;
            $scope.showFormProperties = true;
            return;
        }

        $scope.formProps.id = param._id.$oid;
        $scope.formProps.title = param.title;
        $scope.formProps.name = param.name;
        $scope.showAddFieldButton = true;

        //$scope.get_forms_list();
        $scope.get_form_fields();
    });

    $scope.getFormLookupFields = function($sc, form) {
        var data = {};
        //console.log(form);
        //console.log($scope.current_lookup_form);
        return;
        data.form_id = $scope.current_lookup_form._id.$oid;

        $http.post('/admin/get_form_fields/', data).
                success(function(return_data, status, headers, config) {
            $scope.field_list = return_data;

        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });
    }

    $scope.get_form_fields = function() {

        var data = {};

        if (!$scope.formProps.id)
            return;

        data.form_id = $scope.formProps.id;

        $http.post('/admin/get_form_fields/', data).
                success(function(data, status, headers, config) {
            $scope.master = data;
        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });


    }


    $scope.set_field_properties = function(dbField) {

        var data = {};

        //deleting fields that are used only on client side
        dbField.editorEnabled = false;
        delete dbField.editorEnabled;
        if (dbField._id) {
            data.id = dbField._id.$oid;
        }

        if (dbField.lookup) {
            dbField.lookup = $scope.dbField["lookup"];
        }

        data.form_id = $scope.formProps.id;
        data.data = dbField;
        $http.post('/admin/set_field_properties/', data).
                success(function(data, status, headers, config) {

            //var json_data=JSON.parse(data);
            json_data = data;
            console.log(json_data);

            if (json_data["operation"] == "insert") {
                dbField._id = {};
                dbField._id.$oid = json_data["id"];
                $scope.master.push(dbField);

            }
            else {

            }
            $scope.dbField = {};
            //$scope.formProps ={};
            $scope.field = {};
        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });

        $scope.showAddField = false;


    };

    $scope.set_form_properties = function() {

        var data = {};
        data.data = {};
        data.id = $scope.formProps.id;
        data.data.name = $scope.formProps.name;
        data.data.title = $scope.formProps.title;

        $http.post('/admin/set_form_properties/', data).
                success(function(data, status, headers, config) {
            console.log("success form props" + data);
            $scope.formProps.id = data;
            $scope.showAddFieldButton = true;

        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });
        $scope.showFormProperties = !$scope.showFormProperties;
    }


    $scope.set_data = function(field_name) {
        console.log(field_name);

        $scope.dbField = field_name;
    };

    $scope.post_form_data = function() {
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


function ReportAdminController($scope, $http) {
    $scope.field_list = "";
    $scope.sums_for_numbers = false; // does summing for number fields needs to be done
    $scope.report_name = "my report";
    $scope.title = "click here to edit report title";
    $scope.report_footer = "click here to edit footer";
    $scope.report_id = "";
    $scope.form_id = "";
    $scope.hideBaseForm = false;
    $scope.showReport = false;
    $scope.current_form = {};
    $scope.showDashboard=false;
    $scope.showReport=true;


    $http.get('/admin/form_list').success(function(data) {
        $scope.forms_list = data;
    });

    $scope.formMenuClick = function(param) {
        $scope.$broadcast('formMenuClick', param);
    };

    $scope.$on('formMenuClick', function($sc, param) {
        $scope.showDashboard=false;
        $scope.showReport=true;

        var form_data = {};
        form_data["form_id"] = param._id.$oid;
        $scope.form_id = param._id.$oid;

        $http.post('/admin/get_form_fields/', form_data).success(function(data) {
            $scope.field_list = data;
            $scope.showReport = true;
            $scope.report_name = param.title + " report";
            $scope.title = param.title + " report";

        });
    });

    $scope.$on('reportMenuClick', function($sc, param) {
        var report_data = {};
        $scope.showDashboard=false;

        //check if it is master-detail report
        if (param.report_type) {
            window.location = "/admin/report2/?id=" + param._id.$oid;
        }

        $scope.title = param.title;
        $scope.report_footer = param.report_footer;
        $scope.report_id = param._id.$oid;

        var temp;
        angular.forEach($scope.forms_list, function(value, key) {
            if (param.form_id == value._id.$oid) {
                console.log(value + " " + key);
                $scope.$broadcast('formSelected', key);
                $scope.form_id = value._id.$oid;
            }
        }, temp);

        $scope.field_list = param.fields;
        $scope.showReport = true;
    });

    $scope.saveReport = function() {
        data = {};
        data["fields"] = [];
        var field_data = {};

        angular.forEach($scope.field_list, function(value, key) {
            field_data = {};
            if (value.id) {
                field_data.id = value.id;
            }
            else {
                field_data.id = value._id.$oid;
            }
            field_data.name = value.name;
            field_data.field_type = value.field_type;
            this.push(field_data);
        }, data["fields"]);

        data["form_id"] = $scope.form_id;
        data["title"] = $scope.title;

        if ($scope.report_id.length > 0) {
            data["id"] = $scope.report_id;
        }


        // if default footer, save empty
        if ($scope.report_footer == "click here to edit footer") {
            data["report_footer"] = "";
        }
        else {
            data["report_footer"] = $scope.report_footer;
        }


        $http.post('/admin/save_report/', data).
                success(function(return_data, status, headers, config) {

            if (!$scope.report_id) {
                $scope.report_id = return_data["id"];
            }
            $scope.showSuccess = true;

        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });
    }

}

function ButtonAdminController($scope, $http) {
    $scope.button_name = "";
    $scope.button_action = "open_form";
    $scope.linked_form = "";
    $scope.filter_options = "all_fields";
    $scope.filter_field_name = "id";
    $scope.linked_field_name = "id";
    $scope.linked_objects_list = {};
    $scope.current_field_list = {}
    $scope.linked_field_list = {}
    $scope.form_id = "";
    $scope.show_filter_select = false;
    $scope.filter_type = "by_id";

    $http.get('/admin/form_list').success(function(data) {
        $scope.linked_objects_list = data;
        //console.log("forms list");
        //$scope.linked_form=data[0];    
        var data = {};
        data.form_id = $scope.form_id;

        $http.post('/admin/get_form_fields/', data).
                success(function(return_data, status, headers, config) {
            $scope.current_field_list = return_data;

        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });

    });

    $scope.getFormsReports = function() {

        if ($scope.button_action == "open_form") {
            $http.get('/admin/form_list').success(function(data) {
                $scope.linked_objects_list = data;
            });

        }
        else {
            $http.get('/admin/report_list').success(function(data) {
                $scope.linked_objects_list = data;

            });
        }
    }


    $scope.getFields = function() {
        var data = {};

        if (filter_options == "all_fields") {
            //$scope.show_filter_select=false;
            return;
        }

        $scope.show_filter_select = true;

        linked_data = {};

        linked_data.form_id = $scope.linked_form._id.$oid;

        $http.post('/admin/get_form_fields/', linked_data).
                success(function(return_data, status, headers, config) {
            $scope.linked_field_list = return_data;

        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });


    }

    $scope.saveData = function() {
        var data = {};

        data.button_name = $scope.button_name;
        data.button_action = $scope.button_action;
        data.linked_form = $scope.linked_form._id.$oid;
        data.filter_options = $scope.filter_options;
        console.log($scope.filter_field_name._id);
        if ($scope.filter_field_name._id) {
            data.filter_field_name = $scope.filter_field_name._id.$oid;
        }
        else {
            data.filter_field_name = "id";
        }

        if ($scope.button_action == "open_form" && $scope.filter_options == "by_current_record") {
            data.linked_field_name = $scope.linked_field_name._id.$oid;
            data.linked_field_type = $scope.linked_field_name.field_type;
            data.set_field_value = $scope.set_field_value;
        }
        data.form_id = $scope.form_id;

        $http.post('/admin/save_button/', data).
                success(function(return_data, status, headers, config) {
            console.log("success");
        }).
                error(function(data, status, headers, config) {
            console.log("failure");
        });
    }
}

//adminApp.controller('PhoneListCtrl', function ($scope) {
//});

adminApp.controller('SingleRowReportAdmin', function($scope, $http) {
    $scope.forms_list = {};
    $scope.field_list = [];
    $scope.new_field_name = "";
    $scope.report_name = "";

    $http.get('/admin/form_list').success(function(data) {
        $scope.forms_list = data;
    });


    $scope.getFormFields = function(form) {
        var data = {};
        data.form_id = $scope.current_form._id.$oid;

        $http.post('/admin/get_form_fields/', data).
                success(function(return_data, status, headers, config) {
            $scope.field_list = return_data;
            var temp = [];
            // setting every field as field type, to know when generate report
            angular.forEach($scope.field_list, function(value, key) {
                $scope.field_list[key].type = "field";
                $scope.field_list[key].field_id = value._id.$oid;
            }, temp);
            $scope.report_name = $scope.current_form.title + " page report";
            $scope.new_field_name = "field_" + $scope.field_list.length;
        });
    }

    $scope.addItem = function() {
        $scope.field_list.push({name: $scope.new_field_name, type: "text"});
        $scope.new_field_name = "field_" + $scope.field_list.length;
    }

    $scope.saveReport = function() {
        var data = {};
        data.form_id = $scope.current_form._id.$oid;
        data.form_name = $scope.current_form.name;
        data.report_title = $scope.report_name;
        data.field_data = $scope.field_list;

        console.log();

        $http.post('/admin/save_report_single/', data).
                success(function(return_data, status, headers, config) {
            console.log("success");
        });
    }

    // NOTE: $scope.$apply is called by the draggable directive
    $scope.updatePosition = function(name, pos) {
        var log = [];
        angular.forEach($scope.field_list, function(value, key) {
            if (name == value) {
                $scope.field_list[key].left = pos.left;
                $scope.field_list[key].top = pos.top;
            }
        }, log);
    };

    // NOTE: $scope.$apply is called by the resizable directive
    $scope.updateScale = function(name, pos, size) {
        var log = [];
        angular.forEach($scope.field_list, function(value, key) {
            if (name == value) {
                $scope.field_list[key].left = pos.left;
                $scope.field_list[key].top = pos.top;
                $scope.field_list[key].width = size.width;
                $scope.field_list[key].height = size.height;
            }
        }, log);
    };

});

adminApp.controller('MasterDetailReportAdmin', function($scope, $http) {
    $scope.forms_list = {};
    $scope.field_list = [];
    $scope.field_list_detail = [];
    $scope.new_field_name = "";
    $scope.report_name = "";

    $http.get('/admin/form_list').success(function(data) {
        $scope.forms_list = data;
        $scope.form_list_detail = data;
    });

    $scope.getFormFields = function(form) {
        var data = {};
        data.form_id = $scope.current_form._id.$oid;

        $http.post('/admin/get_form_fields/', data).
                success(function(return_data, status, headers, config) {
            $scope.field_list = return_data;
            $scope.field_list_filter = return_data;

            var temp = [];

            // setting every field as field type, to know when generate report
            angular.forEach($scope.field_list, function(value, key) {
                $scope.field_list[key].type = "field";
                $scope.field_list[key].field_id = value._id.$oid;
            }, temp);
            $scope.report_name = $scope.current_form.title + " page report";
            $scope.new_field_name = "field_" + $scope.field_list.length;
        });
    }
    $scope.getDetailFormFields = function(form) {
        var data = {};
        data.form_id = $scope.current_detail_form._id.$oid;

        $http.post('/admin/get_form_fields/', data).
                success(function(return_data, status, headers, config) {
            $scope.field_list_detail = return_data;
            $scope.field_list_detail_filter = return_data;
            var temp = [];
            angular.forEach($scope.field_list_detail, function(value, key) {
                $scope.field_list_detail[key].type = "field";
                $scope.field_list_detail[key].field_id = value._id.$oid;
            }, temp);

        });
    };


    $scope.addItem = function() {
        $scope.field_list.push({name: $scope.new_field_name, type: "text"});
        $scope.new_field_name = "field_" + $scope.field_list.length;
    }



    $scope.saveReport = function() {
        var data = {};
        data.form_id = $scope.current_form._id.$oid;
        data.form_name = $scope.current_form.name;
        data.detail_form_id = $scope.current_detail_form._id.$oid;
        data.detail_form_name = $scope.current_detail_form.name;
        data.report_type = "master_detail";
        data.title = $scope.report_name;
        data.field_data = $scope.field_list;
        data.detail_field_data = $scope.field_list_detail;
        data.filter_field = {};
        data.filter_field.name = $scope.filter_field["name"];
        data.filter_field.id = $scope.filter_field._id.$oid;
        data.filter_field.field_type = $scope.filter_field.field_type;
        data.filter_field_detail = {};
        data.filter_field_detail.name = $scope.filter_field_detail["name"];
        data.filter_field_detail.id = $scope.filter_field_detail._id.$oid;
        data.filter_field_detail.field_type = $scope.filter_field_detail.field_type;


        $http.post('/admin/save_report_single/', data).
                success(function(return_data, status, headers, config) {
            console.log("success");
        });
    }



    // NOTE: $scope.$apply is called by the draggable directive
    $scope.updatePosition = function(name, pos) {
        var log = [];
        angular.forEach($scope.field_list, function(value, key) {
            if (name == value) {
                $scope.field_list[key].left = pos.left;
                $scope.field_list[key].top = pos.top;
            }
        }, log);
    };

    // NOTE: $scope.$apply is called by the resizable directive
    $scope.updateScale = function(name, pos, size) {
        var log = [];
        angular.forEach($scope.field_list, function(value, key) {
            if (name == value) {
                $scope.field_list[key].left = pos.left;
                $scope.field_list[key].top = pos.top;
                $scope.field_list[key].width = size.width;
                $scope.field_list[key].height = size.height;
            }
        }, log);
    };



});


adminApp.directive('ngDraggable', function() {
    return {
        restrict: 'A',
        //template: '<div class="sparkline">Hello</div>',
        link: function(scope, element, attrs) {
            element.draggable({
                stop: function(event, ui) {
                    scope.$apply(function() {
                        scope.updatePosition(scope.field, {left: ui.position.left, top: ui.position.top});
                    });
                }
            });
            element.resizable({
                maxHeight: 40,
                minHeight: 10,
                stop: function(event, ui) {
                    scope.$apply(function() {
                        var pos = {top: ui.position.top, left: ui.position.left};
                        var scale = {width: ui.size.width, height: ui.size.height}
                        scope.updateScale(scope.field, pos, scale);
                    });
                }
            });

        }
    }
});

