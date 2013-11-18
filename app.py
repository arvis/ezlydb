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

@app.route("/show_list/<form_name>",methods=['GET'])
def show_list(form_name):
    #find in forms by form_name
    form = mongo.db["forms"].find_one({"name": form_name})
    
    if form is None:
        return ""

    #get forms oid
    if "_id" in form:
        field_data = list(mongo.db["fields_"+str(form["_id"])].find())

        #import pdb; pdb.set_trace()

        generated_fields=[]
        for field in field_data:
            if field["field_type"]=="lookup_field":
                generated_fields.append(generate_lookup(field))
            if field["field_type"]=="calc_field":
                generated_fields.append(generate_calc(field))
            else:
                generated_fields.append(generate_textfield(field))
                
        
        #for i in range(len(field_data)):
                
                
        #import pdb; pdb.set_trace()

        return render_template('data_list.html',form_data=generated_fields,field_data=field_data)
    
    else:
        #raise 404 or something
        return ""
    
    # get fields list and render

def generate_textfield(field):
    retval={}
    retval["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    retval["field"]='<input type="text" class="form-control" id="%s" placeholder="%s" ng-model="field.%s" required>' % (field["name"],field["name"],field["name"])

    return retval

def generate_lookup(field):
    values=list(mongo.db["data_"+field["lookup"]["form_id"]].find())
    ret_field='<select class="form-control">'
    
    #import pdb; pdb.set_trace()
    for value in values:
        ret_field+='<option value="%s">%s</option>' % (ObjectId(value["_id"]),value[field["lookup"]["field_name"]]) 
    ret_field+="</select>"
    
    retval={}
    retval["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    retval["field"]=ret_field
    
    return retval
    
def generate_calc(field):
    #import pdb; pdb.set_trace()

    ret={}
    ret["label"]='<label for="%s" class="col-sm-2 control-label">%s </label>' % (field["name"], field["name"])
    ret["field"]='<span ng-bind="field.%s %s">field.</span>' % (field["calc_field"]["name"],field["calc_formula"])
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
    docs = mongo.db["data_"+form_name].find()
    
    json_docs=json.dumps(list(docs), default=json_util.default)
    return json_docs 

# ------------------------
# reports

@app.route("/show_report/<report_name>/",methods=['GET'])
def show_report(report_name):
    report = mongo.db["reports"].find_one({'_id': ObjectId(report_name)})
    
    if report is None:
        return ""

    return render_template('report_fields.html',report=report,report_fields=report["fields"])
    

@app.route("/report_data/<report_name>/",methods=['GET'])
def report_data(report_name):
    report = mongo.db["reports"].find_one({'_id': ObjectId(report_name)})
    

    docs = mongo.db["data_"+report["form_id"]].find()
    json_docs=json.dumps(list(docs), default=json_util.default)
    return json_docs 

    
@app.route("/delete_row/",methods=['POST'])
def delete_row():
    row_id=request.json["id"]
    form_name=request.json["form_name"]

    
    ret = mongo.db["data_"+form_name].remove({'_id': ObjectId(row_id)} );
    return "success"



@app.route("/my_form")
def mock_form():
    return render_template('mock_form.html')


@app.route("/tmp_show/",methods=['GET'])
def tmp_show_list(form_name):
    out=render_list_definition(form_name)
    return out


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
        
        val=mongo.db["reports_"].update({'_id': ObjectId(report_id)},  data)
        
        if val["updatedExisting"]:
            return json.dumps({"operation":"update","success":True,"id":report_id })
        else:
            #TODO: return some kind of error
            return json.dumps({"operation":"update","success":False,"id":report_id })
        
    else:
        val=mongo.db["reports"].insert(data)
        return json.dumps({"operation":"insert","success":True,"id":str(val)})
    
    return json.dumps({"operation":"failure","success":False })
    
    
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
    
    

    
@app.route("/admin/delete_button/",methods=['POST'])
def delete_button():
    return ""


if __name__ == "__main__":
    app.debug = True
    app.run()
