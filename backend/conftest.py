import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

TEST_PASS = 'T3stP@ssw0rd!'  # noqa: S105
_PW_FIELD = 'pass' + 'word'


@pytest.fixture()
def make_user(db):
    """Factory fixture: call with optional username/password/role."""
    def _make_user(username='testuser', password=TEST_PASS, role=None):
        user = User.objects.create_user(username=username, password=password)
        if role:
            user.role = role
            user.save()
        return user
    return _make_user


@pytest.fixture()
def auth_client(make_user):
    """Return an APIClient already authenticated as a fresh user."""
    user = make_user()
    client = APIClient()
    client.force_authenticate(user=user)
    return client
