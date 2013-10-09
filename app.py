from flask import Flask,jsonify,json
from flask import render_template
from flask import request

app = Flask(__name__)

form_data=[{'name':'form1',"title":"form 1"}]



@app.route("/")
def main():
    return render_template('index.html')

@app.route("/admin")
def admin():
    return render_template('admin_menu.html')
    
@app.route("/admin/forms")
def admin_form():
    return render_template('admin.html')
    


@app.route("/show/<form_name>")
def show_form(form_name):
    return "This is form <input id='my_form' /> "+form_name 



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
