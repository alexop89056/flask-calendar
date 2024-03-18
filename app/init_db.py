from app.models import db, User, Stat
from app.utils import bcrypt
from app import app

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        user = User(
            username='admin',
            password=bcrypt.generate_password_hash('admin').decode('utf-8')
        )
        db.session.add(user)
        db.session.commit()

        for i in range(3):
            stat = Stat(
                title=f'Stat {i}',
                value=i
            )
            db.session.add(stat)
        db.session.commit()
