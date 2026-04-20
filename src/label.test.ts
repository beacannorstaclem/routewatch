import { parseLabelArgs, applyLabels, formatLabels } from './label'
import { parseLabelConfig, labelConfigToOptions } from './label.config'

describe('parseLabelArgs', () => {
  it('parses comma-separated key=value string', () => {
    const opts = parseLabelArgs({ label: 'env=prod,team=api' })
    expect(opts.labels).toEqual({ env: 'prod', team: 'api' })
  })

  it('parses array of key=value strings', () => {
    const opts = parseLabelArgs({ label: ['env=staging', 'owner=alice'] })
    expect(opts.labels).toEqual({ env: 'staging', owner: 'alice' })
  })

  it('parses object directly', () => {
    const opts = parseLabelArgs({ label: { env: 'dev' } })
    expect(opts.labels).toEqual({ env: 'dev' })
  })

  it('returns empty labels when no arg', () => {
    const opts = parseLabelArgs({})
    expect(opts.labels).toEqual({})
  })

  it('captures prefix', () => {
    const opts = parseLabelArgs({ label: 'x=1', 'label-prefix': 'rw' })
    expect(opts.prefix).toBe('rw')
  })
})

describe('applyLabels', () => {
  it('merges labels onto object', () => {
    const result = applyLabels({ url: '/api' }, { labels: { env: 'prod' } })
    expect(result.labels).toEqual({ env: 'prod' })
    expect(result.url).toBe('/api')
  })

  it('applies prefix to label keys', () => {
    const result = applyLabels({}, { labels: { env: 'prod' }, prefix: 'rw' })
    expect(result.labels).toHaveProperty('rw/env', 'prod')
  })

  it('merges with existing labels', () => {
    const result = applyLabels({ labels: { old: 'val' } }, { labels: { new: 'x' } })
    expect(result.labels).toEqual({ old: 'val', new: 'x' })
  })
})

describe('formatLabels', () => {
  it('formats label map as key=value pairs', () => {
    expect(formatLabels({ env: 'prod', team: 'api' })).toBe('env=prod, team=api')
  })

  it('returns empty string for no labels', () => {
    expect(formatLabels({})).toBe('')
  })
})

describe('parseLabelConfig', () => {
  it('parses valid config object', () => {
    const cfg = parseLabelConfig({ labels: { env: 'prod' }, prefix: 'rw' })
    expect(cfg.labels).toEqual({ env: 'prod' })
    expect(cfg.prefix).toBe('rw')
  })

  it('returns empty config for invalid input', () => {
    expect(parseLabelConfig(null)).toEqual({})
  })
})

describe('labelConfigToOptions', () => {
  it('converts config to options', () => {
    const opts = labelConfigToOptions({ labels: { a: 'b' }, prefix: 'p' })
    expect(opts.labels).toEqual({ a: 'b' })
    expect(opts.prefix).toBe('p')
  })
})
