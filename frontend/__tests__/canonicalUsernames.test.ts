import {
  sanitizeUsername,
  validateUsername,
  formatCanonicalUsername,
  isSameUsername,
} from '../utils/validation';

describe('Canonical GitHub Username Handling and Normalization', () => {
  describe('sanitizeUsername', () => {
    it('sanitizes and lowercases usernames consistently', () => {
      expect(sanitizeUsername('Octocat')).toBe('octocat');
      expect(sanitizeUsername('@Torvalds')).toBe('torvalds');
      expect(sanitizeUsername('  OCTOCAT  ')).toBe('octocat');
      expect(sanitizeUsername('  @Linus-Torvalds  ')).toBe('linus-torvalds');
      expect(sanitizeUsername('Mixed-Case-User-123')).toBe('mixed-case-user-123');
    });

    it('handles edge cases with symbols and spaces gracefully', () => {
      expect(sanitizeUsername('  @user!@#$%^&*()name  ')).toBe('user!@#$%^&*()name');
      expect(sanitizeUsername('')).toBe('');
      expect(sanitizeUsername('   ')).toBe('');
    });
  });

  describe('validateUsername', () => {
    it('validates mixed-case inputs and produces clean lowercase result', () => {
      const res1 = validateUsername('OctoCat');
      expect(res1.isValid).toBe(true);
      expect(res1.sanitized).toBe('octocat');

      const res2 = validateUsername('@Torvalds');
      expect(res2.isValid).toBe(true);
      expect(res2.sanitized).toBe('torvalds');

      const res3 = validateUsername('a');
      expect(res3.isValid).toBe(true);
      expect(res3.sanitized).toBe('a');
    });

    it('rejects invalid GitHub username syntaxes accurately', () => {
      const emptyRes = validateUsername('');
      expect(emptyRes.isValid).toBe(false);
      expect(emptyRes.error).toBeDefined();

      const hyphenStart = validateUsername('-invalid');
      expect(hyphenStart.isValid).toBe(false);

      const hyphenEnd = validateUsername('invalid-');
      expect(hyphenEnd.isValid).toBe(false);

      const doubleHyphen = validateUsername('bad--name');
      expect(doubleHyphen.isValid).toBe(false);

      const tooLong = validateUsername('a'.repeat(40));
      expect(tooLong.isValid).toBe(false);
    });
  });

  describe('formatCanonicalUsername', () => {
    it('preserves canonical casing returned by GitHub profile login for display', () => {
      expect(formatCanonicalUsername('octocat', 'Octocat')).toBe('Octocat');
      expect(formatCanonicalUsername('torvalds', 'Torvalds')).toBe('Torvalds');
      expect(formatCanonicalUsername('TORVALDS', 'LinusTorvalds')).toBe('LinusTorvalds');
    });

    it('falls back to lowercase sanitized input when no login returned', () => {
      expect(formatCanonicalUsername('Octocat')).toBe('octocat');
      expect(formatCanonicalUsername('@Torvalds')).toBe('torvalds');
      expect(formatCanonicalUsername('FREECODECAMP')).toBe('freecodecamp');
    });

    it('handles fallback with whitespace or null/undefined', () => {
      expect(formatCanonicalUsername('  @DanAbramov  ', undefined)).toBe('danabramov');
      expect(formatCanonicalUsername('  @DanAbramov  ', '')).toBe('danabramov');
    });
  });

  describe('isSameUsername', () => {
    it('handles identical usernames regardless of case variations', () => {
      expect(isSameUsername('Octocat', 'octocat')).toBe(true);
      expect(isSameUsername('TORVALDS', 'torvalds')).toBe(true);
      expect(isSameUsername('@octocat', 'OctoCat')).toBe(true);
      expect(isSameUsername('  @torvalds  ', 'Torvalds')).toBe(true);
    });

    it('returns false for distinct usernames', () => {
      expect(isSameUsername('octocat', 'torvalds')).toBe(false);
      expect(isSameUsername('developer1', 'developer2')).toBe(false);
      expect(isSameUsername('', 'octocat')).toBe(false);
      expect(isSameUsername('', '')).toBe(false);
    });
  });

  describe('URL search params & cache key determinism', () => {
    it('generates identical query params regardless of user typing casing', () => {
      const generateCompareUrl = (userA: string, userB: string) => {
        const u1 = sanitizeUsername(userA);
        const u2 = sanitizeUsername(userB);
        return `/compare?a=${encodeURIComponent(u1)}&b=${encodeURIComponent(u2)}`;
      };

      const url1 = generateCompareUrl('OctoCat', 'Torvalds');
      const url2 = generateCompareUrl('octocat', 'TORVALDS');
      const url3 = generateCompareUrl('@OCTOCAT', '@torvalds');

      expect(url1).toBe('/compare?a=octocat&b=torvalds');
      expect(url2).toBe('/compare?a=octocat&b=torvalds');
      expect(url3).toBe('/compare?a=octocat&b=torvalds');
      expect(url1).toBe(url2);
      expect(url2).toBe(url3);
    });
  });
});
