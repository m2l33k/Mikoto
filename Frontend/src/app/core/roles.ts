/* =====================================================================
   RBAC role model (frontend). Mirrors the backend roles in
   workflowbackend.md §1.3. Drives: login role selection, landing
   redirect, sidebar nav visibility, and read-only action gating.
   ===================================================================== */

export type RoleId = 'secops-admin' | 'netops-engineer' | 'compliance-auditor' | 'read-only';

export interface RoleMeta {
  id: RoleId;
  /** Human label shown in the UI (matches Access Control page names). */
  label: string;
  /** Short tag for chips. */
  short: string;
  /** Landing route after login. */
  home: string;
  /** One-line scope description. */
  scope: string;
  /** Allowed route paths (without leading slash). '*' = every page. */
  nav: string[];
}

/** Pages every authenticated operator can reach regardless of role. */
const COMMON = ['overview', 'settings'];

export const ROLES: Record<RoleId, RoleMeta> = {
  'secops-admin': {
    id: 'secops-admin',
    label: 'SecOps Administrator',
    short: 'SecOps',
    home: '/secops',
    scope: 'Full: certificates, policies, vault, mitigation',
    nav: ['*'],
  },
  'netops-engineer': {
    id: 'netops-engineer',
    label: 'NetOps Engineer',
    short: 'NetOps',
    home: '/netops',
    scope: 'Sessions, conformance, observability, RAN',
    nav: [
      ...COMMON,
      'topology',
      'registry',
      'subscribers',
      'sessions',
      'slicing',
      'ran',
      'netops',
      'anomaly',
      'alarms',
      'logs',
      'conformance',
      'observability',
    ],
  },
  'compliance-auditor': {
    id: 'compliance-auditor',
    label: 'Compliance Auditor',
    short: 'Auditor',
    home: '/audit',
    scope: 'Audit, reports, read-only security posture',
    nav: [...COMMON, 'audit', 'reports', 'conformance', 'observability', 'logs', 'pki'],
  },
  'read-only': {
    id: 'read-only',
    label: 'Read-Only',
    short: 'Viewer',
    home: '/viewer',
    scope: 'View all · no mutations',
    // Observational pages only — nothing with write actions.
    nav: [...COMMON, 'viewer', 'topology', 'observability'],
  },
};

export const ROLE_LIST: RoleMeta[] = Object.values(ROLES);

/** Coerce an unknown value to a valid role, defaulting to least privilege. */
export function toRole(value: string | null | undefined): RoleId {
  return value && value in ROLES ? (value as RoleId) : 'read-only';
}

/** Whether a role may reach a given route path (leading slash optional). */
export function roleCanSee(role: RoleId, path: string): boolean {
  const meta = ROLES[role];
  if (meta.nav.includes('*')) return true;
  const clean = path.replace(/^\//, '').split(/[/?#]/)[0];
  return meta.nav.includes(clean);
}
