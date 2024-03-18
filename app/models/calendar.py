import json

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_utils import ChoiceType

db = SQLAlchemy()


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    start = db.Column(db.Date)
    end = db.Column(db.Date)
    category = db.Column(ChoiceType(choices=[('Free', 'Free'), ('Busy', 'Busy')]))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "start": self.start.isoformat() if self.start else None,
            "end": self.end.isoformat() if self.end else None,
            "category": self.category.value if self.category else "Free"
        }

    def save(self):
        if not self.start:
            self.start = self.end
        if not self.end:
            self.end = self.start

        db.session.add(self)
        db.session.commit()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(500), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username


class Stat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    value = db.Column(db.Integer())
