import { ROLE_LIST, ROLES, roleCanSee, toRole } from './roles';

describe('toRole', () => {
  it('returns valid role ids unchanged', () => {
    expect(toRole('secops-admin')).toBe('secops-admin');
    expect(toRole('netops-engineer')).toBe('netops-engineer');
    expect(toRole('compliance-auditor')).toBe('compliance-auditor');
    expect(toRole('read-only')).toBe('read-only');
  });

  it('defaults to least privilege for unknown or missing values', () => {
    expect(toRole('root')).toBe('read-only');
    expect(toRole('')).toBe('read-only');
    expect(toRole(null)).toBe('read-only');
    expect(toRole(undefined)).toBe('read-only');
  });
});

describe('roleCanSee', () => {
  it('grants secops-admin (wildcard) every page', () => {
    expect(roleCanSee('secops-admin', '/secrets')).toBe(true);
    expect(roleCanSee('secops-admin', '/access')).toBe(true);
    expect(roleCanSee('secops-admin', 'anything-at-all')).toBe(true);
  });

  it('limits netops-engineer to its nav scope', () => {
    expect(roleCanSee('netops-engineer', '/netops')).toBe(true);
    expect(roleCanSee('netops-engineer', '/sessions')).toBe(true);
    expect(roleCanSee('netops-engineer', '/secrets')).toBe(false);
    expect(roleCanSee('netops-engineer', '/access')).toBe(false);
  });

  it('keeps read-only out of mutating pages', () => {
    expect(roleCanSee('read-only', '/viewer')).toBe(true);
    expect(roleCanSee('read-only', '/key-rotation')).toBe(false);
    expect(roleCanSee('read-only', '/policies')).toBe(false);
  });

  it('accepts paths with or without a leading slash, query, or fragment', () => {
    expect(roleCanSee('read-only', 'topology')).toBe(true);
    expect(roleCanSee('read-only', '/topology?zoom=3')).toBe(true);
    expect(roleCanSee('read-only', '/topology#map')).toBe(true);
    expect(roleCanSee('read-only', '/topology/site/42')).toBe(true);
  });
});

describe('ROLES model integrity', () => {
  it('lists all four roles', () => {
    expect(ROLE_LIST).toHaveLength(4);
  });

  it('lets every role reach its own home route', () => {
    for (const meta of ROLE_LIST) {
      expect(roleCanSee(meta.id, meta.home)).toBe(true);
    }
  });

  it('includes the common pages in every non-wildcard role', () => {
    for (const meta of ROLE_LIST) {
      if (ROLES[meta.id].nav.includes('*')) continue;
      expect(roleCanSee(meta.id, '/overview')).toBe(true);
      expect(roleCanSee(meta.id, '/settings')).toBe(true);
    }
  });
});
