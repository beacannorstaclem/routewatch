export type AuthScheme = 'none' | 'bearer' | 'basic' | 'header';

export interface AuthConfig {
  scheme: AuthScheme;
  token?: string;
  username?: string;
  password?: string;
  headerName?: string;
  headerValue?: string;
}

export function applyAuth(headers: Record<string, string>, auth: AuthConfig): Record<string, string> {
  const result = { ...headers };
  switch (auth.scheme) {
    case 'bearer':
      if (!auth.token) throw new Error('Bearer auth requires a token');
      result['Authorization'] = `Bearer ${auth.token}`;
      break;
    case 'basic': {
      if (!auth.username || !auth.password) throw new Error('Basic auth requires username and password');
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      result['Authorization'] = `Basic ${encoded}`;
      break;
    }
    case 'header':
      if (!auth.headerName || !auth.headerValue) throw new Error('Header auth requires headerName and headerValue');
      result[auth.headerName] = auth.headerValue;
      break;
    case 'none':
    default:
      break;
  }
  return result;
}

export function parseAuthArgs(args: Record<string, unknown>): AuthConfig {
  const scheme = (args['auth'] as AuthScheme) || 'none';
  return {
    scheme,
    token: args['token'] as string | undefined,
    username: args['username'] as string | undefined,
    password: args['password'] as string | undefined,
    headerName: args['header-name'] as string | undefined,
    headerValue: args['header-value'] as string | undefined,
  };
}
