export function setCookie(name: string, value: string, options: {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
} = {}): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    const expires =
      typeof options.expires === 'number'
        ? new Date(Date.now() + options.expires * 1000).toUTCString()
        : options.expires.toUTCString();
    cookieString += `; expires=${expires}`;
  }

  cookieString += `; path=${options.path || '/'}`;

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += `; secure`;
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}
