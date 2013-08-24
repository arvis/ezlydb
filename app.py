from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
def main():
    return render_template('index.html')
    #return "Hello World!"

@app.route("/admin")
def admin():
    return render_template('admin.html')
    #return "Hello World!"

@app.route("/show/<form_name>")
def show_form(form_name):
    return "This is form <input id='my_form' /> "+form_name 






if __name__ == "__main__":
    app.debug = True
    app.run()
