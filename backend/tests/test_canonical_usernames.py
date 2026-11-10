"""
Canonical username resolution and normalization tests for GitHub integration.
Validates case-insensitive equivalence, cache hit consistency, edge-case rejection,
and canonical display formatting across all system entry points.
"""

import pytest
from app.exceptions import InvalidUsernameError
from app.utils.validation import (
    is_valid_github_username,
    normalize_github_username,
    validate_github_username,
)


class TestCanonicalUsernames:
    """Test suite covering case-insensitive username normalization and validation."""

    def test_normalize_lowercase_conversion(self):
        """Ensure usernames with uppercase letters are transformed to lowercase."""
        assert normalize_github_username("Octocat") == "octocat"
        assert normalize_github_username("OCTOCAT") == "octocat"
        assert normalize_github_username("Torvalds") == "torvalds"
        assert normalize_github_username("Linus-Torvalds") == "linus-torvalds"

    def test_normalize_trims_whitespace_and_at_symbol(self):
        """Ensure whitespace and leading @ symbols are trimmed before lowercasing."""
        assert normalize_github_username(" @octocat ") == "octocat"
        assert normalize_github_username("@OctoCat") == "octocat"
        assert normalize_github_username("   @FreeCodeCamp   ") == "freecodecamp"
        assert normalize_github_username("\t@Google\n") == "google"

    def test_normalize_empty_or_none(self):
        """Ensure None or empty inputs normalize cleanly to empty string."""
        assert normalize_github_username(None) == ""
        assert normalize_github_username("") == ""
        assert normalize_github_username("   ") == ""
        assert normalize_github_username("@") == ""

    def test_validate_github_username_valid_variants(self):
        """Ensure valid variations normalize to their canonical lowercase representation."""
        assert validate_github_username("OctoCat") == "octocat"
        assert validate_github_username("@Torvalds") == "torvalds"
        assert validate_github_username("user-with-hyphen") == "user-with-hyphen"
        assert validate_github_username("Dev-Ops-Team") == "dev-ops-team"

    def test_validate_github_username_invalid_inputs(self):
        """Ensure invalid characters or illegal formats raise InvalidUsernameError."""
        with pytest.raises(InvalidUsernameError):
            validate_github_username("-starts-with-hyphen")

        with pytest.raises(InvalidUsernameError):
            validate_github_username("ends-with-hyphen-")

        with pytest.raises(InvalidUsernameError):
            validate_github_username("user--name")

        with pytest.raises(InvalidUsernameError):
            validate_github_username("invalid@user")

        with pytest.raises(InvalidUsernameError):
            validate_github_username("invalid user")

        with pytest.raises(InvalidUsernameError):
            validate_github_username("invalid.user")

        with pytest.raises(InvalidUsernameError):
            validate_github_username("invalid#user")

        with pytest.raises(InvalidUsernameError):
            validate_github_username("a" * 40)

        with pytest.raises(InvalidUsernameError):
            validate_github_username("")

        with pytest.raises(InvalidUsernameError):
            validate_github_username(None)

    def test_cache_key_equivalence(self):
        """Ensure variations of the same username produce identical cache keys."""
        variations = [
            "octocat",
            "Octocat",
            "OCTOCAT",
            "@octocat",
            " @OctoCat ",
            "oCtOcAt",
        ]
        keys = {f"user_analysis:{normalize_github_username(v)}" for v in variations}
        assert len(keys) == 1
        assert "user_analysis:octocat" in keys

    def test_compare_username_equivalence(self):
        """Verify that comparing identical usernames with different casing is detected."""
        user_a = normalize_github_username("Torvalds")
        user_b = normalize_github_username("torvalds")
        assert user_a == user_b

        user_c = normalize_github_username("OCTOCAT")
        assert user_a != user_c

    def test_numeric_and_alphanumeric_usernames(self):
        """Verify alphanumeric usernames with digits are preserved accurately."""
        assert normalize_github_username("Developer123") == "developer123"
        assert normalize_github_username("123456") == "123456"
        assert normalize_github_username("Code-42-Agent") == "code-42-agent"

    def test_is_valid_github_username_checks(self):
        """Verify boolean check utility matches validation expectations."""
        assert is_valid_github_username("octocat") is True
        assert is_valid_github_username("Octocat") is True
        assert is_valid_github_username("12345") is True
        assert is_valid_github_username("-bad") is False
        assert is_valid_github_username("bad-") is False
        assert is_valid_github_username("bad--name") is False
        assert is_valid_github_username("") is False
        assert is_valid_github_username(None) is False

    def test_boundary_lengths(self):
        """Verify single character and 39 character username boundaries."""
        assert validate_github_username("a") == "a"
        assert validate_github_username("1") == "1"
        max_valid = "A" + "b" * 38
        assert validate_github_username(max_valid) == max_valid.lower()

    def test_sanitize_and_casing_roundtrip(self):
        """Ensure idempotency of repeated normalization calls."""
        raw = "   @SuperCoder99   "
        first_pass = normalize_github_username(raw)
        second_pass = normalize_github_username(first_pass)
        assert first_pass == "supercoder99"
        assert first_pass == second_pass
