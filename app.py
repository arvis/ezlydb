from flask import Flask,jsonify,json
from flask import render_template
from flask import request
from flask import Flask
from flask.ext.pymongo import PyMongo
from flask.ext import pymongo
from bson import json_util
from bson.objectid import ObjectId
import urllib


app = Flask(__name__)
mongo = PyMongo(app)

@app.route("/")
def main():
    return render_template('index.html')

@app.route("/show_form/<form_name>/",methods=['GET'])
def show_form(form_name):
    return render_template('show_form.html',form_name=form_name)


@app.route("/show_list/<form_name>/",methods=['GET','POST'])
def show_list(form_name):
    
    #import pdb; pdb.set_trace()
    form = mongo.db["forms"].find_one({"name": form_name})
    
    # if cant get by name, trying to get by id
    if form is None:
        form = mongo.db["forms"].find_one({"_id":ObjectId(form_name)})
        if form is None:
            return ""

    #get forms oid
    if "_id" in form:
        field_data = list(mongo.db["fields_"+str(form["_id"])].find().sort("_id"))
        button_list = list(mongo.db["buttons_"+str(form["_id"])].find().sort("_id"))

        button_list_out=[]
        for button in button_list:
            btn={}
            url_params=""
            btn["button_name"]=button["button_name"]
            btn["button_action"]=button["button_action"]
            btn["object_id"]=ObjectId(button["_id"])
            
            button_list_out.append(btn)
             

        generated_fields=[]
        for field in field_data:
            if field["field_type"]=="lookup_field":
                generated_fields.append(generate_lookup(field))
            elif field["field_type"]=="calc_field":
                generated_fields.append(generate_calc(field))
            elif field["field_type"]=="int_field":
                generated_fields.append(generate_number(field))
            elif field["field_type"]=="float_field":
                generated_fields.append(generate_number(field))
            elif field["field_type"]=="date_field":
                generated_fields.append(generate_date(field))
            elif field["field_type"]=="bigtext_field":
                generated_fields.append(generate_textarea(field))
                
            else:
                generated_fields.append(generate_textfield(field))
                
        return render_template('data_list.html',form_data=generated_fields,field_data=field_data, button_list=button_list_out)
    
    else:
        #raise 404 or something
        return ""
    
    # get fields list and render

def generate_textfield(field):
    retval={}
    retval["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    retval["field"]='<input type="text" class="form-control" id="%s" placeholder="%s" ng-model="field.%s" required>' % (field["name"],field["name"],ObjectId(field["_id"]))
    return retval

def generate_textarea(field):
    retval={}
    retval["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    retval["field"]='<textarea class="form-control" id="%s" placeholder="%s" ng-model="field.%s" required rows="3"></textarea>' % (field["name"],field["name"],ObjectId(field["_id"]))
    return retval

def generate_lookup(field):
    values=list(mongo.db["data_"+field["lookup"]["form_id"]].find())
    ret_field='<select class="form-control" id="%s" ng-model="field.%s">' % (field["name"], ObjectId(field["_id"]))
    
    #import pdb; pdb.set_trace()
    for value in values:
        #ret_field+='<option value="%s">%s</option>' % (ObjectId(value["_id"]),value[field["lookup"]["field_name"]]) 
        #ret_field+='<option value="%s">%s</option>' % (value[field["lookup"]["field_name"]],value[field["lookup"]["field_name"]]) 
        ret_field+="<option value='{\"id\":\"%s\",\"name\":\"%s\"}'>%s</option>" % ( ObjectId(value["_id"]),value[field["lookup"]["field_id"]], value[field["lookup"]["field_id"]]) 
    ret_field+="</select>"
    
    retval={}
    retval["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    retval["field"]=ret_field
    
    return retval

def generate_number(field):
    retval={}
    retval["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    retval["field"]='<input type="number" class="form-control" id="%s" placeholder="%s" ng-model="field.%s" required>' % (field["name"],field["name"],ObjectId(field["_id"]))
    return retval
    
def generate_date(field):
    retval={}
    retval["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    retval["field"]='<input type="date" class="form-control" id="%s" ng-model="field.%s" required>' % (field["name"],ObjectId(field["_id"]))
    return retval
    
def generate_calc(field):
    #import pdb; pdb.set_trace()

    ret={}
    ret["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    #ret["field"]='<input class="form-control" type="text" id="calc_field" ng-model="field.%s" ng-init="field.%s= field.%s %s " />' % (ObjectId(field["_id"]),ObjectId(field["_id"]), field["calc_field"],field["calc_formula"])
    ret["field"]='<span ng-bind="field.%s %s">field.</span>' % (ObjectId(field["calc_field"]["_id"]),field["calc_formula"])
    return ret
    



@app.route("/post_data/",methods=['POST'])
def post_data():
    data=request.json["data"]
    form_name=request.json["form_name"]
    #row_id=request.json["id"]
    #TODO: check if this user is allowed to post here
    
    if "id" in request.json:
        row_id=request.json["id"]
        if "_id" in data:
            del data["_id"] 
        val=mongo.db["data_"+form_name].update({'_id': ObjectId(row_id)},  data)
        return "success"
        
        if val["updatedExisting"]:
            return form_id
        else:
            #TODO: return some kind of error
            return form_id
        
    else:
        val=mongo.db["data_"+form_name].insert(data)
        return str(val)
    
    #TODO: check if that element exists
    del data["_id"] 


@app.route("/data/<form_name>/",methods=['GET'])
def get_all(form_name):
    #find_params=request.args
    filter_params={}
    if len(request.args)>0:
        #assuming for now, that there is only one param, later need to redone it
        filter_params={request.args.items()[0][0]:request.args.values()[0]}
    
    
    docs = mongo.db["data_"+form_name].find(dict(filter_params))
    #import pdb; pdb.set_trace()
    
    json_docs=json.dumps(list(docs), default=json_util.default)
    return json_docs 

@app.route("/delete_row/",methods=['POST'])
def delete_row():
    row_id=request.json["id"]
    form_name=request.json["form_name"]
    ret = mongo.db["data_"+form_name].remove({'_id': ObjectId(row_id)} );
    return "success"


# ------------------------
# reports

@app.route("/show_report/<report_name>/",methods=['GET'])
def show_report(report_name):
    report = mongo.db["reports"].find_one({'_id': ObjectId(report_name)})
    
    if report is None:
        return ""
    if report["report_type"]:
        return render_master_detail(report)
        
    field_data=mongo.db["fields_"+report["form_id"]].find()
    return render_template('report_fields.html',report=report,report_fields=report["fields"])
    

def render_master_detail(report):

    filter_params={}
    if len(request.args)>0:
        #TODO: assuming for now that there is only one param, later need to redone it
        filter_params={request.args.items()[0][0]:request.args.values()[0]}
        
    report_data = mongo.db["data_"+report["form_id"]].find(dict(filter_params))
    json_docs=json.dumps(list(report_data), default=json_util.default)

    #import pdb; pdb.set_trace()

    return render_template('master_detail_report.html',report_fields=report["field_data"],report_js=json_docs)

@app.route("/report_data/<report_name>/",methods=['GET'])
def report_data(report_name):
    report = mongo.db["reports"].find_one({'_id': ObjectId(report_name)})
    filter_params={}
    if len(request.args)>0:
        #TODO: assuming for now that there is only one param, later need to redone it
        filter_params={request.args.items()[0][0]:request.args.values()[0]}

    docs = mongo.db["data_"+report["form_id"]].find(dict(filter_params))
    json_docs=json.dumps(list(docs), default=json_util.default)
    return json_docs 

@app.route("/report_group/<report_name>/",methods=['GET'])
def report_group_by(report_name):
    report = mongo.db["reports"].find_one({'_id': ObjectId(report_name)})
    filter_params={}
    if len(request.args)>0:
        #assuming for now, that there is only one param, later need to redone it
        filter_params={request.args.items()[0][0]:request.args.values()[0]}

    #GROUPING http://stackoverflow.com/questions/5010624/how-to-use-group-in-pymongo-to-group-similar-rows
    #docs = mongo.db["data_"+report["form_id"]].find(dict(filter_params))
    result = mongo.db["data_"+report["form_id"]].group(['uid'], None,{'list': []},'function(obj, prev) {prev.list.push(obj)}') # reducer
    
    json_docs=json.dumps(list(docs), default=json_util.default)
    return json_docs 
    
    

@app.route("/singe_item_report/<report_id>/",methods=['GET'])
def single_report(report_id):
    report = mongo.db["report_single"].find_one({'_id': ObjectId(report_id)})
    filter_params={}
    if len(request.args)>0:
        #assuming for now, that there is only one param, later need to redone it
        filter_params={request.args.items()[0][0]:request.args.values()[0]}
        
    report_data = mongo.db["data_"+report["form_id"]].find(dict(filter_params))
    json_docs=json.dumps(list(report_data), default=json_util.default)

    #import pdb; pdb.set_trace()

    return render_template('single_report.html',report_fields=report["field_data"],report_js=json_docs)


@app.route("/singe_item_data/<report_name>/",methods=['GET'])
def single_report_data(report_name):
    report = mongo.db["report_single"].find_one({'_id': ObjectId(report_name)})
    

    docs = mongo.db["data_"+report["form_id"]].find()
    json_docs=json.dumps(list(docs), default=json_util.default)
    return json_docs 


@app.route("/charts/<chart_name>/",methods=['GET'])
def show_chart(chart_name):
    return render_template("charts.html")

@app.route("/grid/<form_name>/",methods=['GET'])
def show_grid(chart_name):
    return render_template("grid.html")



#--------------------------
# admin functions

from app_admin import *

if __name__ == "__main__":
    app.debug = True
    app.run()
