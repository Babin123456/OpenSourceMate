import pytest
from app.config import get_settings, Settings
from app.utils.validation import validate_github_username
from app.utils.logging import sanitize_sensitive_data


def test_settings_types():
    s = get_settings()
    assert isinstance(s, Settings)
    assert isinstance(s.github_connect_timeout, float)
    assert isinstance(s.github_read_timeout, float)
    assert isinstance(s.github_max_retries, int)
    assert isinstance(s.allowed_hosts, list)
    assert isinstance(s.cors_origins, list)


def test_validation_utility_types():
    assert validate_github_username("octocat") == "octocat"
    assert validate_github_username("@torvalds") == "torvalds"
    with pytest.raises(Exception):
        validate_github_username("invalid username with spaces")


def test_sanitize_sensitive_data_types():
    clean = sanitize_sensitive_data({"token": "secret123", "normal": "public"})
    assert isinstance(clean, dict)
    assert clean["token"] == "[REDACTED]"
    assert clean["normal"] == "public"
