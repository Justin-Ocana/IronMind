from .base import *  # noqa
from pathlib import Path

DEBUG = True

# SQLite — sin necesidad de PostgreSQL en local
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Sin Redis/Celery en local — las tareas se ejecutan en modo síncrono
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# CORS abierto en local
CORS_ALLOW_ALL_ORIGINS = True

# Sin debug_toolbar para simplificar
INSTALLED_APPS = [a for a in INSTALLED_APPS if a != "debug_toolbar"]
MIDDLEWARE = [m for m in MIDDLEWARE if "debug_toolbar" not in m]
