import { parseTemplateArgs, renderTemplate, applyTemplateToUrl, applyTemplateToHeaders } from './template';
import { parseTemplateConfig, mergeTemplateConfigs } from './template.config';

describe('parseTemplateArgs', () => {
  it('parses --template-var key=value', () => {
    const opts = parseTemplateArgs(['--template-var', 'env=prod', '--template-var', 'version=v2']);
    expect(opts.vars).toEqual({ env: 'prod', version: 'v2' });
  });

  it('parses --template-strict', () => {
    const opts = parseTemplateArgs(['--template-strict']);
    expect(opts.strict).toBe(true);
  });

  it('returns empty vars by default', () => {
    expect(parseTemplateArgs([]).vars).toEqual({});
  });
});

describe('renderTemplate', () => {
  it('substitutes known variables', () => {
    const result = renderTemplate('https://{{host}}/api', { vars: { host: 'example.com' } });
    expect(result).toBe('https://example.com/api');
  });

  it('leaves unknown vars intact in non-strict mode', () => {
    const result = renderTemplate('{{unknown}}', { vars: {} });
    expect(result).toBe('{{unknown}}');
  });

  it('throws in strict mode for unknown vars', () => {
    expect(() => renderTemplate('{{missing}}', { vars: {}, strict: true })).toThrow('missing');
  });
});

describe('applyTemplateToUrl', () => {
  it('renders url template', () => {
    expect(applyTemplateToUrl('/api/{{version}}/users', { vars: { version: 'v1' } })).toBe('/api/v1/users');
  });
});

describe('applyTemplateToHeaders', () => {
  it('renders header values', () => {
    const result = applyTemplateToHeaders({ Authorization: 'Bearer {{token}}' }, { vars: { token: 'abc' } });
    expect(result).toEqual({ Authorization: 'Bearer abc' });
  });
});

describe('parseTemplateConfig', () => {
  it('parses vars and strict', () => {
    const cfg = parseTemplateConfig({ vars: { env: 'staging' }, strict: true });
    expect(cfg.vars).toEqual({ env: 'staging' });
    expect(cfg.strict).toBe(true);
  });

  it('returns empty config for invalid input', () => {
    expect(parseTemplateConfig(null)).toEqual({});
  });
});

describe('mergeTemplateConfigs', () => {
  it('merges vars from multiple configs', () => {
    const result = mergeTemplateConfigs({ vars: { a: '1' } }, { vars: { b: '2' } });
    expect(result.vars).toEqual({ a: '1', b: '2' });
  });

  it('strict is true if any config sets it', () => {
    const result = mergeTemplateConfigs({ strict: false }, { strict: true });
    expect(result.strict).toBe(true);
  });
});
