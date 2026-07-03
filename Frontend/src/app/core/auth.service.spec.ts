import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

const KEY = 'ztn.session';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function create(): AuthService {
    TestBed.configureTestingModule({});
    return TestBed.inject(AuthService);
  }

  it('starts unauthenticated with least-privilege defaults', () => {
    const auth = create();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.role()).toBe('read-only');
    expect(auth.isReadOnly()).toBe(true);
    expect(auth.home()).toBe('/viewer');
  });

  it('login persists the session and updates the role signals', () => {
    const auth = create();
    auth.login('alice@core', 'production', true, 'secops-admin');

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.role()).toBe('secops-admin');
    expect(auth.isReadOnly()).toBe(false);
    expect(auth.home()).toBe('/secops');

    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.identity).toBe('alice@core');
    expect(stored.role).toBe('secops-admin');
  });

  it('logout clears the session and storage', () => {
    const auth = create();
    auth.login('alice@core', 'production', true, 'secops-admin');
    auth.logout();

    expect(auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('restores a persisted session on construction', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        identity: 'bob@noc',
        environment: 'staging',
        mtls: false,
        since: 123,
        role: 'netops-engineer',
      }),
    );
    const auth = create();
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.role()).toBe('netops-engineer');
  });

  it('coerces legacy sessions without a valid role to read-only', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ identity: 'old@user', environment: 'prod', mtls: true, since: 1 }),
    );
    const auth = create();
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.role()).toBe('read-only');
  });

  it('treats corrupted storage as unauthenticated', () => {
    localStorage.setItem(KEY, '{not-json');
    const auth = create();
    expect(auth.isAuthenticated).toBe(false);
  });
});
