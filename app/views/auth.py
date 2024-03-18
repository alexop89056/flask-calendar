from flask import Blueprint, render_template, request, session, redirect, url_for, abort

from app.models import User
from app.utils import bcrypt

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """
        Route for handling user login.
        Handles both GET and POST requests.
        If POST, it checks the username and password, then sets the session user_id and redirects to the calendar index.
        If username or password is incorrect, it aborts with error 404.
        Returns the login template for GET requests.
    """
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()
        if user:
            if bcrypt.check_password_hash(user.password, password):
                session['user_id'] = user.id
                return redirect(url_for('calendar.index'))

        abort(404)
    return render_template('login.html')
