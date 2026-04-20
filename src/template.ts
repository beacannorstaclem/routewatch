export interface TemplateVars = Record<string, string>;

export interface TemplateOptions {
  vars: TemplateVars;
  strict?: boolean;
}

export function parseTemplateArgs(args: string[]): TemplateOptions {
  const vars: TemplateVars = {};
  let strict = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template-var' && args[i + 1]) {
      const [k, v] = args[++i].split('=');
      if (k && v !== undefined) vars[k] = v;
    } else if (args[i] === '--template-strict') {
      strict = true;
    }
  }
  return { vars, strict };
}

export function renderTemplate(template: string, options: TemplateOptions): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    if (key in options.vars) return options.vars[key];
    if (options.strict) throw new Error(`Template variable not found: ${key}`);
    return match;
  });
}

export function applyTemplateToUrl(url: string, options: TemplateOptions): string {
  return renderTemplate(url, options);
}

export function applyTemplateToHeaders(
  headers: Record<string, string>,
  options: TemplateOptions
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k, renderTemplate(v, options)])
  );
}
