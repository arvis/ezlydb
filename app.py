from flask import Flask,jsonify,json
from flask import render_template
from flask import request
from flask import Flask
from flask.ext.pymongo import PyMongo
from bson import json_util

app = Flask(__name__)
mongo = PyMongo(app)

#form_data=[{'name':'form1',"title":"form 1",'fields':[{ }] }]

forms_list=[{'name':'form1',"title":"form 1","data":[{"name":"field1","type":"text"},{"name":"field2","type":"text"}] }]


@app.route("/")
def main():
    return render_template('index.html')

@app.route("/admin")
def admin():
    return render_template('admin_menu.html')
    
@app.route("/admin/forms")
def admin_form():
    return render_template('admin.html')
    

def render_form_header(form_data):
    form_head= "<h3> %s </h3>" % (form_data["title"])
    form_head+='<form ng-submit="set_field()">'
    return form_head

def render_form_footer():
    return '<input type="submit" class="btn btn-default" value="Submit">'


def render_input(data):
    input_data='<input type="text" class="form-control" id="%s" placeholder="%s" ng-model="formProps.%s" required />' % (data["name"],data["name"],data["name"], )
    return input_data
    

def render_form(form_id):
    form_data=forms_list[0]
    form_output=render_form_header(form_data)
    for field in form_data["data"]:
        form_output+=render_input(field)
    form_output+=render_form_footer()
    return form_output


def render_list_definition(form_name):
    form_data=forms_list[0]
    output='<table class="table"><tr>'
    for field in form_data["data"]:
        output+='<th> %s </td>' % (field["name"] )
    
    output+='</tr><tr ng-repeat="field in data ">'
    for field in form_data["data"]:
        output+='<td ng-bind="field.%s"> </td>' % (field["name"] )
    output+="</tr></table>"
    return output 
    
def render_list_head(form_name):
    pass

@app.route("/show_list/<form_name>",methods=['GET'])
def show_list(form_name):
    out=render_list_definition(form_name)
    print out
    return out

@app.route("/show_form/<form_name>",methods=['GET'])
def show_form(form_name):
    form_data=render_form(form_name)
    return form_data



@app.route("/post_data/",methods=['POST'])
def post_form():
    data=request.json["data"]
    form_name=request.json["form_name"]
    print data,form_name
    mongo.db.test_data.save(data)
    return "success"

@app.route("/data/<form_name>",methods=['GET'])
def get_all(form_name):
    docs = mongo.db["test_data"].find()
    
    #import pdb; pdb.set_trace()
    
    json_docs=json.dumps(list(docs), default=json_util.default)
    #return render_template('all.html',docs=docs)
    return json_docs 


@app.route("/admin/form_list")
def show_forms_json():
    #TODO: replace with dynamic not dymmy data
    #form_data.append({'name':'form6',"title":"form 6"})
    return json.dumps(form_data)

@app.route("/admin/add_form",methods=['POST'])
def add_form_json():
    #return "aaaa"
    print request.json
    #print request.form['form_name']
    form_data.append({'name':'form6',"title":"form 6"})
    return "eee"





if __name__ == "__main__":
    app.debug = True
    app.run()
