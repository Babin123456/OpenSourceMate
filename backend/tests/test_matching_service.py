import unittest
from datetime import datetime, timedelta, timezone

from app.services.matching_service import (
    calculate_issue_score,
    categorize_issue_freshness,
)


class TestMatchingService(unittest.TestCase):
    def test_skill_match_increases_score(self):
        issue = {
            "language": "Python",
            "labels": [],
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "comments": 2,
        }

        result = calculate_issue_score(issue, ["Python", "TypeScript"])

        self.assertGreaterEqual(result["score"], 40)
        self.assertTrue(any("Python" in reason for reason in result["reasons"]))

    def test_good_first_issue_and_help_wanted_bonus(self):
        issue = {
            "language": None,
            "labels": ["good first issue", "help wanted"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "comments": 1,
        }

        result = calculate_issue_score(issue, ["Python"])

        self.assertGreaterEqual(result["score"], 40)
        self.assertTrue(
            any("good first issue" in reason for reason in result["reasons"])
        )
        self.assertTrue(
            any(
                "help wanted" in reason.lower()
                or "looking for contributors" in reason
                for reason in result["reasons"]
            )
        )

    def test_recent_activity_bonus(self):
        issue = {
            "language": None,
            "labels": [],
            "updated_at": (
                datetime.now(timezone.utc) - timedelta(days=5)
            ).isoformat().replace("+00:00", "Z"),
            "comments": 20,
        }

        result = calculate_issue_score(issue, ["Python"])

        self.assertGreaterEqual(result["score"], 10)
        self.assertTrue(
            any("active recently" in reason for reason in result["reasons"])
        )

    def test_score_never_exceeds_100(self):
        issue = {
            "language": "Python",
            "labels": ["good first issue", "help wanted"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "comments": 0,
        }

        result = calculate_issue_score(issue, ["Python"])

        self.assertLessEqual(result["score"], 100)

    def test_manageable_comment_count_bonus(self):
        issue = {
            "language": None,
            "labels": [],
            "updated_at": (
                datetime.now(timezone.utc) - timedelta(days=200)
            ).isoformat().replace("+00:00", "Z"),
            "comments": 3,
        }

        result = calculate_issue_score(issue, ["Go"])

        self.assertEqual(result["score"], 10)
        self.assertTrue(
            any(
                "manageable discussion" in reason
                for reason in result["reasons"]
            )
        )

    def test_freshness_active_within_14_days(self):
        now = datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc)
        recent_date = (now - timedelta(days=3)).isoformat()

        freshness = categorize_issue_freshness(recent_date, now=now)
        self.assertEqual(freshness["status"], "Active")
        self.assertFalse(freshness["is_stale"])
        self.assertEqual(freshness["days_ago"], 3)
        self.assertEqual(freshness["label"], "Updated 3d ago")

    def test_freshness_recent_between_15_and_60_days(self):
        now = datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc)
        date_30d = (now - timedelta(days=30)).isoformat()

        freshness = categorize_issue_freshness(date_30d, now=now)
        self.assertEqual(freshness["status"], "Recent")
        self.assertFalse(freshness["is_stale"])
        self.assertEqual(freshness["days_ago"], 30)

    def test_freshness_stale_over_60_days(self):
        now = datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc)
        date_100d = (now - timedelta(days=100)).isoformat()

        freshness = categorize_issue_freshness(date_100d, now=now)
        self.assertEqual(freshness["status"], "Stale")
        self.assertTrue(freshness["is_stale"])
        self.assertEqual(freshness["days_ago"], 100)

    def test_freshness_unknown_on_none_or_invalid(self):
        freshness_none = categorize_issue_freshness(None)
        self.assertEqual(freshness_none["status"], "Unknown")
        self.assertFalse(freshness_none["is_stale"])

        freshness_invalid = categorize_issue_freshness("not-a-date")
        self.assertEqual(freshness_invalid["status"], "Unknown")
        self.assertFalse(freshness_invalid["is_stale"])

    def test_calculate_score_includes_freshness(self):
        issue = {
            "language": "Python",
            "labels": ["good first issue"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "comments": 2,
        }

        result = calculate_issue_score(issue, ["Python"])
        self.assertIn("freshness", result)
        self.assertEqual(result["freshness"]["status"], "Active")


if __name__ == "__main__":
    unittest.main()
