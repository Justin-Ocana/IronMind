from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from common.models import TimeStampedModel


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email


class UserSettings(TimeStampedModel):
    UNIT_CHOICES = [("kg", "Kilograms"), ("lbs", "Pounds")]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")
    weight_unit = models.CharField(max_length=3, choices=UNIT_CHOICES, default="kg")
    default_rest_seconds = models.PositiveIntegerField(default=120)
    default_increment_kg = models.DecimalField(max_digits=4, decimal_places=1, default=2.5)
    weekly_report_enabled = models.BooleanField(default=True)
    timezone = models.CharField(max_length=50, default="Europe/Madrid")

    class Meta:
        db_table = "user_settings"
