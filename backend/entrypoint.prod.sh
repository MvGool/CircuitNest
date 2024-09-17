#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Migrate
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input

# Create superuser
python manage.py createsuperuser --no-input

# Run gunicorn
gunicorn logic_circuit.wsgi:application --bind 0.0.0.0:8000 --log-file -

exec "$@"