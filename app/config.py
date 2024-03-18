import os
from datetime import timedelta
from pathlib import Path

path = Path(__file__).parent.absolute()

SECRET_KEY = os.urandom(12)
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_DATABASE_URI = f'sqlite:///{path}/db/database.db'

SESSION_FILE_DIR = f'{path}/sessions'
SESSION_TYPE = 'filesystem'
# SESSION_COOKIE_SECURE = True
REMEMBER_COOKIE_DURATION = 3600
SESSION_PERMANENT = True
PERMANENT_SESSION_LIFETIME = timedelta(days=7)
