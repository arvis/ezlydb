from flask import Flask,jsonify,json
from flask import render_template
from flask import request
from flask import Flask
from flask.ext.pymongo import PyMongo
from bson import json_util
from bson.objectid import ObjectId


app = Flask(__name__)
mongo = PyMongo(app)

form_data=[{'name':'form1',"title":"form 1",'fields':[{ }] }]

forms_list=[{'name':'form1',"title":"form 1","data":[{"name":"field1","title":"field 1","type":"text"},{"name":"field2","title":"field 2","type":"text"}] }]


@app.route("/")
def main():
    return render_template('index.html')

    
@app.route("/my_form")
def mock_form():
    return render_template('mock_form.html')
    

def render_form_header(form_data):
    form_head= "<h3> %s </h3>" % (form_data["title"])
    form_head+='<form ng-submit="add_row()">'
    return form_head

def render_form_footer():
    return '<input type="submit" class="btn btn-default" value="Submit">'


def render_input(data):
    input_data='<input type="text" class="form-control" id="%s" placeholder="%s" ng-model="field.%s" required />' % (data["name"],data["name"],data["name"], )
    return input_data
    
    
def render_row_buttons():
    out='<button type="button" ng-click="field.editorEnabled=!field.editorEnabled" class="btn btn-info btn-xs">edit</button>'    
    out+=' <button type="button" ng-click="delete_row(field,$index)" class="btn btn-danger btn-xs">delete</button>'    
    return out

def render_form(form_id):
    form_data=forms_list[0]
    form_output=render_form_header(form_data)
    for field in form_data["data"]:
        form_output+=render_input(field)
    form_output+=render_form_footer()
    return form_output


def render_list_definition(form_name):
    form_data=forms_list[0]

    
    buttons=render_row_buttons()
    output='<table class="table"><tr>'
    for field in form_data["data"]:
        output+='<th> %s </th>' % (field["name"] )
    
    output+='<th></th>'
    output+='</tr><tr ng-repeat="field in data ">'
    output+='<td ng-bind="field._id.$oid "> </td>' 
    for field in form_data["data"]:
        output+='<td ng-bind="field.%s"> </td>' % (field["name"] )
    
    output+= "<td>"+buttons+"</td>"
    output+= "</tr></table>"
    return output 
    
def render_list_head(form_name):
    pass

@app.route("/show_list/<form_name>",methods=['GET'])
def show_list(form_name):
    return render_template('data_list.html',form_data=forms_list[0]["data"])


@app.route("/tmp_show/",methods=['GET'])
def tmp_show_list(form_name):
    out=render_list_definition(form_name)
    return out



@app.route("/show_form/<form_name>",methods=['GET'])
def show_form(form_name):
    form_data=render_form(form_name)
    return form_data



@app.route("/post_data/",methods=['POST'])
def update_row():
    data=request.json["data"]
    row_id=request.json["id"]

    #TODO: check if that element exists
    del data["_id"] 

    val=mongo.db["test_data"].update({'_id': ObjectId(row_id)},  data)
    #import pdb; pdb.set_trace()
    return "success"
    
@app.route("/add_row/",methods=['POST'])
def add_row():
    data=request.json["data"]
    mongo.db["test_data"].insert(data)
    return "success"

    
@app.route("/delete_row/",methods=['POST'])
def delete_row():
    data=request.json
    
    ret = mongo.db["test_data"].remove({'_id': ObjectId(data["id"])} );
    return "success"


@app.route("/data/<form_name>",methods=['GET'])
def get_all(form_name):
    docs = mongo.db["test_data"].find()
    json_docs=json.dumps(list(docs), default=json_util.default)
    return json_docs 


#--------------------------
# admin functions

@app.route("/admin/")
def admin():
    return render_template('admin_menu.html')
    
@app.route("/admin/forms/<form_name>/")
def admin_form(form_name):
    return render_template('admin.html')


@app.route("/admin/form_list")
def show_forms_json():
    forms_list = mongo.db["forms"].find()
    json_docs=json.dumps(list(forms_list), default=json_util.default)
    return json_docs 
    
    

@app.route("/admin/add_form",methods=['POST'])
def add_form_json():
    print request.json
    form_data.append({'name':'form6',"title":"form 6"})
    return "success"

@app.route("/admin/show_field_form/")
def show_field_form():
    # TODO: make template as a directive, not include
    return render_template('form_field.html') 


        
@app.route("/admin/set_form_properties/",methods=['POST'])
def set_form_properties():
    #print request.json
    data=request.json["data"]
    
    if "id" in request.json:
        form_id=request.json["id"]
        del data["_id"] 
        val=mongo.db["forms"].update({'_id': ObjectId(form_id)},  data)
        #import pdb; pdb.set_trace()
        
        if val["updatedExisting"]:
            return form_id
        else:
            #TODO: return some kind of error
            return form_id
        
    else:
        val=mongo.db["forms"].insert(data)
        return str(val)
        
@app.route("/admin/get_form_fields/",methods=['POST'])
def get_form_fields():
    form_id=request.json["form_id"]
    fields_list = mongo.db["fields_"+form_id].find()
    json_docs=json.dumps(list(fields_list), default=json_util.default)
    return json_docs 
        
        
@app.route("/admin/set_field_properties/",methods=['POST'])
def set_field_properties():
    data=request.json["data"]
    #import pdb; pdb.set_trace()

    form_id=request.json["form_id"]
    
    if "id" in request.json:
        field_id=request.json["id"]
        del data["_id"] 
        val=mongo.db["fields_"+form_id].update({'_id': ObjectId(field_id)},  data)
        
        if val["updatedExisting"]:
            return json.dumps({"operation":"update","success":True,"id":field_id })
        else:
            #TODO: return some kind of error
            return json.dumps({"operation":"update","success":False,"id":field_id })
        
    else:
        data["form_id"]=form_id;
        val=mongo.db["fields_"+form_id].insert(data)
        return json.dumps({"operation":"insert","success":True,"id":str(val)})
    
    return json.dumps({"operation":"failure","success":False })


if __name__ == "__main__":
    app.debug = True
    app.run()
