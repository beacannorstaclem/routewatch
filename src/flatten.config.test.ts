import { parseFlattenConfig, loadFlattenConfig } from './flatten.config';

describe('parseFlattenConfig', () => {
  it('parses valid config', () => {
    expect(parseFlattenConfig({ delimiter: '-', maxDepth: 3 })).toEqual({
      delimiter: '-',
      maxDepth: 3,
    });
  });

  it('returns empty object for null input', () => {
    expect(parseFlattenConfig(null)).toEqual({});
  });

  it('ignores invalid types', () => {
    expect(parseFlattenConfig({ delimiter: 99, maxDepth: 'deep' })).toEqual({});
  });
});

describe('loadFlattenConfig', () => {
  it('reads flatten key from config', () => {
    expect(loadFlattenConfig({ flatten: { delimiter: '/', maxDepth: 1 } })).toEqual({
      delimiter: '/',
      maxDepth: 1,
    });
  });

  it('returns empty when flatten key missing', () => {
    expect(loadFlattenConfig({})).toEqual({});
  });
});
