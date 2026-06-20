from django.urls import path
from .views import RegisterView, MeView, UserSettingsView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("me/", MeView.as_view()),
    path("me/settings/", UserSettingsView.as_view()),
]
