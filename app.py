import os
import jinja2
import soundcloud
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/tween')
def hello():
    return render_template('tweentest.html')

@app.route('/modals')
def modals():
	return render_template('modals.html')

@app.route('/callback')
def back():
	return render_template('callback.html')

@app.route('/about')
def about():
	return render_template('about.html')

@app.route('/dropbox')
def dropbox():
	return render_template('dropbox.html')

# @app.route('/soundcloud')
# def soundcloud():
# 	client = soundcloud.Client(access_token='c62653f616ed117b1d19068691b24234')

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
