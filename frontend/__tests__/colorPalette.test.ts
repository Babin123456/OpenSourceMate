import {
  COLOR_BLIND_SAFE_PALETTE,
  ACCESSIBLE_STATUS_PALETTE,
  getColorForIndex,
  getSvgPatternId,
} from '../utils/colorPalette';

describe('Color Blind Safe Categorical Palette (Okabe-Ito / Wong)', () => {
  it('contains 8 distinct accessible categorical colors', () => {
    expect(COLOR_BLIND_SAFE_PALETTE.length).toBe(8);
  });

  it('guarantees unique hex fill colors across all palette entries', () => {
    const fills = COLOR_BLIND_SAFE_PALETTE.map((c) => c.fill.toLowerCase());
    const uniqueFills = new Set(fills);
    expect(uniqueFills.size).toBe(COLOR_BLIND_SAFE_PALETTE.length);
  });

  it('provides secondary identifiers (symbols and textures) so color is never the only signal', () => {
    COLOR_BLIND_SAFE_PALETTE.forEach((color) => {
      expect(color.symbol).toBeDefined();
      expect(color.symbol.length).toBeGreaterThan(0);
      expect(color.pattern).toBeDefined();
      expect(color.name).toBeDefined();
      expect(color.stroke).toBeDefined();
    });
  });

  it('includes proper high-contrast text color tokens for both dark and light modes', () => {
    COLOR_BLIND_SAFE_PALETTE.forEach((color) => {
      expect(color.text).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(color.lightText).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(color.fill).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(color.stroke).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('resolves colors deterministically using getColorForIndex', () => {
    const color0 = getColorForIndex(0);
    expect(color0.name).toBe("Blue");
    expect(color0.fill).toBe("#0072B2");

    const color1 = getColorForIndex(1);
    expect(color1.name).toBe("Orange");
    expect(color1.fill).toBe("#E69F00");

    // Wraparound test
    const color8 = getColorForIndex(8);
    expect(color8).toEqual(color0);

    const negativeIndex = getColorForIndex(-1);
    expect(negativeIndex).toEqual(color1);
  });

  it('provides accessible status palettes with symbols for easy, medium, and hard', () => {
    expect(ACCESSIBLE_STATUS_PALETTE.easy.symbol).toBe("✓");
    expect(ACCESSIBLE_STATUS_PALETTE.medium.symbol).toBe("◆");
    expect(ACCESSIBLE_STATUS_PALETTE.hard.symbol).toBe("▲");
    expect(ACCESSIBLE_STATUS_PALETTE.neutral.symbol).toBe("●");

    // Colors must not be simple identical red/green hue clashes
    expect(ACCESSIBLE_STATUS_PALETTE.easy.fill).toBe("#009E73"); // Bluish Green
    expect(ACCESSIBLE_STATUS_PALETTE.hard.fill).toBe("#D55E00"); // Vermilion
  });

  it('generates consistent SVG pattern IDs', () => {
    const patternId = getSvgPatternId("stripes", "chart-custom");
    expect(patternId).toBe("chart-custom-pattern-stripes");
  });
});
