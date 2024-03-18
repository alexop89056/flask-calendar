from flask import Flask, redirect, url_for
from app.models import db
from app.views import calendar_bp, auth_bp
from app.utils import bcrypt, sessions

app = Flask(__name__)
app.config.from_pyfile('config.py')

# Register models
db.init_app(app)
with app.app_context():
    db.create_all()

# Register views
app.register_blueprint(calendar_bp, url_prefix='/calendar')
app.register_blueprint(auth_bp, url_prefix='/auth')

# Register utils
bcrypt.init_app(app)
sessions.init_app(app)


@app.errorhandler(404)
def page_not_found(e):
    return redirect(url_for('calendar.index'))
