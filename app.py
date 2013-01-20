import os
import jinja2
import soundcloud
from flask import Flask, render_template, redirect, request

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

@app.route('/sound')
def sound():
	return 'hi' #accept .wav and upload to soundcloud

@app.route('/callback')
def back():
	# create client object with app credentials
	client = soundcloud.Client(client_id='c62653f616ed117b1d19068691b24234',
	                           client_secret='920ca0969fe79e7d2959ab0cb192e4f4',
	                           redirect_uri='http://soundsculptor.herokuapp.com/index')

	# if request.method == "POST" or request.method == "GET":
	# 	return 'hi'
	# exchange authorization code for access token
	code = request.args.get('MY_CODE')
	access_token = client.exchange_token(code)
	return render_template('callback.html').set_cookie('access_token', access_token)

@app.route('/about')
def about():
	return render_template('about.html')

@app.route('/dropbox')
def dropbox():
	return render_template('dropbox.html')

@app.route('/sc')
def sc():
	# return render_template('index.html')
	# create client object with app credentials
	client = soundcloud.Client(client_id='c62653f616ed117b1d19068691b24234',
	                           client_secret='920ca0969fe79e7d2959ab0cb192e4f4',
	                           redirect_uri='http://soundsculptor.herokuapp.com/index')

	return redirect(client.authorize_url())


if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port,debug=True)
