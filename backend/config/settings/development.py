from .base import *  # noqa

DEBUG = True

try:
    import debug_toolbar  # noqa: F401
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE.insert(1, "debug_toolbar.middleware.DebugToolbarMiddleware")
    INTERNAL_IPS = ["127.0.0.1"]
except ImportError:
    pass
