import { flattenObject, applyFlatten, parseFlattenArgs } from './flatten';

describe('flattenObject', () => {
  it('flattens nested object with default delimiter', () => {
    const result = flattenObject({ a: { b: { c: 1 } } });
    expect(result).toEqual({ 'a.b.c': 1 });
  });

  it('uses custom delimiter', () => {
    const result = flattenObject({ a: { b: 2 } }, { delimiter: '_' });
    expect(result).toEqual({ a_b: 2 });
  });

  it('respects maxDepth', () => {
    const result = flattenObject({ a: { b: { c: 3 } } }, { maxDepth: 1 });
    expect(result).toEqual({ 'a.b': { c: 3 } });
  });

  it('leaves non-object values as-is', () => {
    const result = flattenObject({ x: 1, y: 'hello', z: [1, 2] });
    expect(result).toEqual({ x: 1, y: 'hello', z: [1, 2] });
  });

  it('handles empty object', () => {
    expect(flattenObject({})).toEqual({});
  });
});

describe('applyFlatten', () => {
  it('returns original object when no options set', () => {
    const obj = { a: { b: 1 } };
    expect(applyFlatten(obj, {})).toBe(obj);
  });

  it('flattens when delimiter is set', () => {
    const result = applyFlatten({ a: { b: 1 } }, { delimiter: '.' });
    expect(result).toEqual({ 'a.b': 1 });
  });
});

describe('parseFlattenArgs', () => {
  it('parses delimiter and depth from args', () => {
    const result = parseFlattenArgs({ 'flatten-delimiter': '/', 'flatten-depth': 2 });
    expect(result).toEqual({ delimiter: '/', maxDepth: 2 });
  });

  it('returns empty options when args absent', () => {
    expect(parseFlattenArgs({})).toEqual({});
  });
});
