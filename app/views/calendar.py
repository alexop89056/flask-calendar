from datetime import datetime

from flask import Blueprint, render_template, request, abort, session, url_for, redirect

from app.helpers import login_required
from app.models import Event, db, User, Stat

calendar_bp = Blueprint('calendar', __name__)


@calendar_bp.route('/')
def index():
    user = User.query.filter_by(id=session.get('user_id')).first()
    stats = Stat.query.all()
    return render_template('calendar.html', user=user, stats=stats)


@calendar_bp.route('/get-all-events')
def get_all_events():
    events = Event.query.all()
    events_json = [event.to_dict() for event in events]
    return events_json



@calendar_bp.route('/add-event', methods=['POST', 'GET'])
@login_required
def add_event():
    """
        A function to handle adding an event to the calendar.
        Parses the request data for event details, creates an Event object, and saves it to the database.
        Returns a success message with the inserted event ID or an error message if the event addition fails.
    """
    if request.method == 'POST':
        title = request.form.get('title')
        start = request.form.get('start')
        end = request.form.get('end')
        category = request.form.get('extendedProps[calendar]')

        if start:
            try:
                start = datetime.strptime(start, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                start = datetime.strptime(start, '%Y-%m-%d')
        if end:
            try:
                end = datetime.strptime(end, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                end = datetime.strptime(end, '%Y-%m-%d')

        try:
            event_data = Event(
                title=title,
                start=start,
                end=end,
                category=category
            )
            event_data.save()
        except Exception as e:
            print(e)
            return {'status': 'error', 'message': 'Не удалось добавить событие.'}, 500

        return {'status': 'success', 'insertId': event_data.id}, 200

    return 'ONLY POST ALLOWED'


@calendar_bp.route('/update-event', methods=['POST', 'GET'])
@login_required
def update_event():
    """
        Updates an event in the calendar.
        Parameters:
            None
        Returns:
            - If the request method is POST and the data is valid:
                - If the event is successfully updated:
                    - status (str): 'success'
                - If the event is not found:
                    - status (str): 'error'
                    - message (str): 'Событие не найдено.'

            - If the request method is not POST:
                - str: 'ONLY POST ALLOWED'
    """
    if request.method == 'POST':
        if not request.is_json:
            abort(404)

        event_id = request.json.get('id')
        title = request.json.get('title')
        category = request.json.get('extendedProps')

        if not category.get('calendar'):
            abort(404)

        exists_event = Event.query.filter_by(id=event_id).first()
        if not exists_event:
            return {'status': 'error', 'message': 'Событие не найдено.'}, 404

        exists_event.title = title
        exists_event.category = category.get('calendar')
        db.session.commit()

        return {'status': 'success'}, 200

    return 'ONLY POST ALLOWED'


@calendar_bp.route('/delete-event', methods=['POST', 'GET'])
@login_required
def delete_event():
    """
        A function to delete an event. It takes no parameters.
        Returns a dictionary with a status key indicating success or error and an optional message key.
        If the request method is not POST, it returns a 404 status code.
        If the event id does not exist, it returns a 404 status code with an error message.
        If the event is successfully deleted, it returns a 200 status code with a success message.
    """
    if request.method == 'POST':
        if not request.is_json:
            abort(404)

        event_id = request.json.get('id')

        exists_event = Event.query.filter_by(id=event_id).first()
        if not exists_event:
            return {'status': 'error', 'message': 'Событие не найдено.'}, 404

        db.session.delete(exists_event)
        db.session.commit()

        return {'status': 'success'}, 200
    return 'ONLY POST ALLOWED'


@calendar_bp.route('/stat/update', methods=['POST', 'GET'])
@login_required
def update_stat():
    """
        A function to update the stat using the POST method. It retrieves the stat ID, title, and value from the request form. If the stat does not exist, it returns an error message. Otherwise, it updates the title and value of the stat in the database and redirects to the calendar index. If the request method is not POST, it returns a message stating that only POST is allowed.
    """
    if request.method == 'POST':

        stat_id = request.form.get('statId')
        title = request.form.get('stat1')
        value = request.form.get('stat2')

        exists_stat = Stat.query.filter_by(id=stat_id).first()
        if not exists_stat:
            return {'status': 'error', 'message': 'Статистика не найдена.'}, 404

        exists_stat.value = value
        exists_stat.title = title
        db.session.commit()

        return redirect(url_for('calendar.index'))

    return 'ONLY POST ALLOWED'
