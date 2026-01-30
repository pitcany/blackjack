// Tests for syncService merge logic
import { mergeStats, mergeHistory } from '../lib/syncService';

describe('mergeStats', () => {
  test('returns local stats when server is empty', () => {
    const local = { handsPlayed: 10, handsWon: 5 };
    const server = {};
    const result = mergeStats(local, server);
    expect(result).toEqual(local);
  });

  test('returns server stats when local is empty', () => {
    const local = {};
    const server = { handsPlayed: 10, handsWon: 5 };
    const result = mergeStats(local, server);
    expect(result).toEqual(server);
  });

  test('takes max value for numeric stats', () => {
    const local = { handsPlayed: 10, handsWon: 5 };
    const server = { handsPlayed: 15, handsWon: 3 };
    const result = mergeStats(local, server);
    expect(result.handsPlayed).toBe(15);
    expect(result.handsWon).toBe(5);
  });

  test('merges nested objects recursively', () => {
    const local = {
      game: { played: 10, won: 5 },
      strategy: { decisions: 20 }
    };
    const server = {
      game: { played: 15, won: 3 },
      strategy: { decisions: 25, correct: 20 }
    };
    const result = mergeStats(local, server);
    expect(result.game.played).toBe(15);
    expect(result.game.won).toBe(5);
    expect(result.strategy.decisions).toBe(25);
    expect(result.strategy.correct).toBe(20);
  });

  test('adds new keys from server', () => {
    const local = { handsPlayed: 10 };
    const server = { handsPlayed: 5, blackjacks: 3 };
    const result = mergeStats(local, server);
    expect(result.handsPlayed).toBe(10);
    expect(result.blackjacks).toBe(3);
  });

  test('handles null/undefined gracefully', () => {
    expect(mergeStats(null, { a: 1 })).toEqual({ a: 1 });
    expect(mergeStats({ a: 1 }, null)).toEqual({ a: 1 });
    expect(mergeStats(undefined, { a: 1 })).toEqual({ a: 1 });
  });
});

describe('mergeHistory', () => {
  test('returns local hands when server is empty', () => {
    const local = [{ timestamp: 1000, result: 'win' }];
    const server = [];
    const result = mergeHistory(local, server);
    expect(result).toEqual(local);
  });

  test('returns server hands when local is empty', () => {
    const local = [];
    const server = [{ timestamp: 1000, result: 'win' }];
    const result = mergeHistory(local, server);
    expect(result).toEqual(server);
  });

  test('deduplicates hands by timestamp', () => {
    const local = [{ timestamp: 1000, result: 'win' }];
    const server = [{ timestamp: 1000, result: 'win' }, { timestamp: 2000, result: 'lose' }];
    const result = mergeHistory(local, server);
    expect(result).toHaveLength(2);
    expect(result.find(h => h.timestamp === 1000)).toBeDefined();
    expect(result.find(h => h.timestamp === 2000)).toBeDefined();
  });

  test('sorts by timestamp descending (newest first)', () => {
    const local = [{ timestamp: 1000 }, { timestamp: 3000 }];
    const server = [{ timestamp: 2000 }];
    const result = mergeHistory(local, server);
    expect(result[0].timestamp).toBe(3000);
    expect(result[1].timestamp).toBe(2000);
    expect(result[2].timestamp).toBe(1000);
  });

  test('caps at 200 hands', () => {
    const local = Array.from({ length: 150 }, (_, i) => ({ timestamp: i }));
    const server = Array.from({ length: 100 }, (_, i) => ({ timestamp: i + 150 }));
    const result = mergeHistory(local, server);
    expect(result).toHaveLength(200);
  });

  test('handles null/undefined gracefully', () => {
    expect(mergeHistory(null, [{ timestamp: 1 }])).toEqual([{ timestamp: 1 }]);
    expect(mergeHistory([{ timestamp: 1 }], null)).toEqual([{ timestamp: 1 }]);
    expect(mergeHistory(undefined, undefined)).toEqual([]);
  });
});
