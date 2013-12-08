from flask import Flask,jsonify,json
from flask import render_template
from flask import request
from flask import Flask
from flask.ext.pymongo import PyMongo
from flask.ext import pymongo
from bson import json_util
from bson.objectid import ObjectId
import urllib

from app import app,mongo


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


@app.route("/admin/reports/",methods=['GET'])
def show_reports():
    return render_template('admin_reports.html')

@app.route("/admin/report_list")
def show_report_list():
    reports_list = mongo.db["reports"].find()
    json_docs=json.dumps(list(reports_list), default=json_util.default)
    return json_docs 
    
@app.route("/admin/save_report/",methods=['POST'])
def save_report():
    data={}
    data=request.json
    
    
    if "id" in request.json:
        report_id=request.json["id"]
        del data["id"] 
        
        val=mongo.db["reports"].update({'_id': ObjectId(report_id)},  data)
        
        if val["updatedExisting"]:
            return json.dumps({"operation":"update","success":True,"id":report_id })
        else:
            #TODO: return some kind of error
            return json.dumps({"operation":"update","success":False,"id":report_id })
        
    else:
        val=mongo.db["reports"].insert(data)
        return json.dumps({"operation":"insert","success":True,"id":str(val)})
    
    return json.dumps({"operation":"failure","success":False })


@app.route("/admin/single_row_report/",methods=['GET'])
def single_row_report():
    return render_template('single_report_admin.html')

@app.route("/admin/save_report_single/",methods=['POST'])
def save_report_single():
    data={}
    data=request.json
    #import pdb; pdb.set_trace()

    data=request.json
    val=mongo.db["reports"].insert(data)
    
    return "success"

@app.route("/admin/report2/",methods=['GET'])
def master_detail_report():
    return render_template('master_detail_report_admin.html')
    
    
#----------------------------
# Button functions

@app.route("/admin/buttons/<form_id_in>/",methods=['GET'])
def show_button_admin(form_id_in):
    return render_template('button_admin.html',form_id=form_id_in)

@app.route("/admin/save_button/",methods=['POST'])
def save_button():
    data={}
    data=request.json
    form_id=request.json["form_id"]
    
    val=mongo.db["buttons_"+form_id].insert(data)
    return json.dumps({"operation":"insert","success":True,"id":str(val)})

@app.route("/admin/button_list/",methods=['POST'])
def button_list():
    form_id=request.json["form_id"]
    button_list = mongo.db["buttons_"+form_id].find()
    json_docs=json.dumps(list(button_list), default=json_util.default)
    return json_docs 
    
    
@app.route("/admin/button_data/",methods=['POST'])
def get_button():
    form_id=request.json["form_id"]
    button_id=request.json["button_id"]
    button = mongo.db["buttons_"+form_id].find_one({"_id":ObjectId(button_id)})
    #form = mongo.db["forms"].find_one({"_id":ObjectId(form_id)})
    #import pdb; pdb.set_trace()

    data={}
    data["button"]=button
    #data["form"]=form

    json_docs=json.dumps(dict(button), default=json_util.default)
    return json_docs 
    
@app.route("/admin/delete_button/",methods=['POST'])
def delete_button():
    return ""

    
@app.route("/admin/testrun/",methods=['POST','GET'])
def run_tests():
    return render_template("testrun.html")
