from functools import wraps

from flask import session, abort

from app.models import User


def login_required(func):
    @wraps(func)
    def login_check(*args, **kwargs):

        if 'user_id' in session:
            user = User.query.filter_by(id=session['user_id']).first()
            if user:
                result = func(*args, **kwargs)
                return result

        abort(404)

    return login_check
