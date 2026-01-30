// Tests for coachingEngine
import {
  analyzeWeaknesses,
  generateTrainingSession,
  evaluateDrillAnswer,
  getCategoryDisplayName,
  getSeverityLabel,
  DRILL_LIBRARY,
  WeaknessCategory,
  WEAKNESS_THRESHOLDS
} from '../lib/coachingEngine';

describe('analyzeWeaknesses', () => {
  test('returns empty array for no mistakes', () => {
    const stats = { mistakes: {} };
    const weaknesses = analyzeWeaknesses(stats);
    expect(weaknesses).toEqual([]);
  });

  test('ignores mistakes below threshold', () => {
    const stats = {
      mistakes: {
        '16_vs_10': { count: 5, correct: 'HIT', wrong: 'STAND' }
      }
    };
    const weaknesses = analyzeWeaknesses(stats);
    // 5 is below MIN_DECISIONS threshold of 10
    expect(weaknesses).toEqual([]);
  });

  test('identifies weakness when mistakes meet threshold', () => {
    const stats = {
      mistakes: {
        '16_vs_10': { count: 15, correct: 'HIT', wrong: 'STAND' }
      }
    };
    const weaknesses = analyzeWeaknesses(stats);
    expect(weaknesses.length).toBeGreaterThan(0);
    expect(weaknesses[0].mistakeCount).toBe(15);
  });

  test('sorts weaknesses by severity', () => {
    const stats = {
      mistakes: {
        '16_vs_10': { count: 15, correct: 'HIT', wrong: 'STAND' },
        '11_vs_6': { count: 30, correct: 'DOUBLE', wrong: 'HIT' }
      }
    };
    const weaknesses = analyzeWeaknesses(stats);
    // Higher mistake count should have higher severity
    expect(weaknesses[0].mistakeCount).toBeGreaterThanOrEqual(weaknesses[1]?.mistakeCount || 0);
  });
});

describe('generateTrainingSession', () => {
  test('generates session from weaknesses', () => {
    const weaknesses = [{
      category: WeaknessCategory.HARD_TOTALS,
      severity: 50,
      recommendedDrills: DRILL_LIBRARY.filter(d => d.category === WeaknessCategory.HARD_TOTALS).slice(0, 2)
    }];
    const session = generateTrainingSession(weaknesses);
    expect(session.drills.length).toBeGreaterThan(0);
    expect(session.focusAreas).toContain(WeaknessCategory.HARD_TOTALS);
  });

  test('generates general session with no weaknesses', () => {
    const session = generateTrainingSession([]);
    expect(session.drills.length).toBeGreaterThan(0);
    expect(session.focusAreas).toContain('general');
  });

  test('respects maxDrills option', () => {
    const session = generateTrainingSession([], { maxDrills: 2 });
    expect(session.drills.length).toBeLessThanOrEqual(2);
  });

  test('can focus on specific category', () => {
    const session = generateTrainingSession([], { focusCategory: WeaknessCategory.PAIRS });
    expect(session.focusAreas).toContain(WeaknessCategory.PAIRS);
    session.drills.forEach(drill => {
      expect(drill.category).toBe(WeaknessCategory.PAIRS);
    });
  });
});

describe('evaluateDrillAnswer', () => {
  test('evaluates correct answer', () => {
    const drill = DRILL_LIBRARY[0];
    const result = evaluateDrillAnswer(drill, 0, drill.scenarios[0].correctAction);
    expect(result.correct).toBe(true);
    expect(result.userAnswer).toBe(drill.scenarios[0].correctAction);
  });

  test('evaluates incorrect answer', () => {
    const drill = DRILL_LIBRARY[0];
    const wrongAnswer = drill.scenarios[0].correctAction === 'HIT' ? 'STAND' : 'HIT';
    const result = evaluateDrillAnswer(drill, 0, wrongAnswer);
    expect(result.correct).toBe(false);
    expect(result.correctAnswer).toBe(drill.scenarios[0].correctAction);
  });

  test('is case insensitive', () => {
    const drill = DRILL_LIBRARY[0];
    const result = evaluateDrillAnswer(drill, 0, drill.scenarios[0].correctAction.toLowerCase());
    expect(result.correct).toBe(true);
  });

  test('handles invalid scenario index', () => {
    const drill = DRILL_LIBRARY[0];
    const result = evaluateDrillAnswer(drill, 999, 'HIT');
    expect(result.correct).toBe(false);
    expect(result.error).toBe('Invalid scenario');
  });
});

describe('getCategoryDisplayName', () => {
  test('returns correct display names', () => {
    expect(getCategoryDisplayName(WeaknessCategory.HARD_TOTALS)).toBe('Hard Totals');
    expect(getCategoryDisplayName(WeaknessCategory.SOFT_TOTALS)).toBe('Soft Totals');
    expect(getCategoryDisplayName(WeaknessCategory.PAIRS)).toBe('Pair Splitting');
  });

  test('returns category for unknown', () => {
    expect(getCategoryDisplayName('unknown')).toBe('unknown');
  });
});

describe('getSeverityLabel', () => {
  test('returns critical for high severity', () => {
    expect(getSeverityLabel(80).label).toBe('Critical');
    expect(getSeverityLabel(80).color).toBe('destructive');
  });

  test('returns needs work for medium severity', () => {
    expect(getSeverityLabel(50).label).toBe('Needs Work');
    expect(getSeverityLabel(50).color).toBe('warning');
  });

  test('returns minor for low severity', () => {
    expect(getSeverityLabel(20).label).toBe('Minor');
    expect(getSeverityLabel(20).color).toBe('muted');
  });
});

describe('DRILL_LIBRARY', () => {
  test('has at least 20 drills', () => {
    expect(DRILL_LIBRARY.length).toBeGreaterThanOrEqual(20);
  });

  test('all drills have required fields', () => {
    DRILL_LIBRARY.forEach(drill => {
      expect(drill.id).toBeDefined();
      expect(drill.name).toBeDefined();
      expect(drill.description).toBeDefined();
      expect(drill.category).toBeDefined();
      expect(drill.type).toBeDefined();
      expect(drill.difficulty).toBeDefined();
      expect(drill.scenarios).toBeDefined();
      expect(drill.scenarios.length).toBeGreaterThan(0);
    });
  });

  test('all scenarios have required fields', () => {
    DRILL_LIBRARY.forEach(drill => {
      drill.scenarios.forEach(scenario => {
        expect(scenario.playerHand).toBeDefined();
        expect(scenario.dealerUpcard).toBeDefined();
        expect(scenario.correctAction).toBeDefined();
      });
    });
  });
});
