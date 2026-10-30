#!/usr/bin/env python
import os
import sys
from pathlib import Path

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.local'

# Add backend dir to path
sys.path.insert(0, str(Path(__file__).parent))

import django
from django.core.management import call_command

django.setup()

print('Generating migrations...')
call_command('makemigrations', 'users', 'exercises', 'routines', 'workouts', 'body', 'wellness', 'reports', verbosity=0)

print('Applying migrations...')
call_command('migrate', verbosity=0)

print('Loading exercises...')
try:
    call_command('seed_exercises', verbosity=0)
except Exception as e:
    print(f'Seed exercises warning: {e}')

print('Setup complete!')
