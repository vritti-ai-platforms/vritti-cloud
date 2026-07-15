import { useRoles } from '@hooks/cloud/roles';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { Empty } from '@vritti/quantum-ui/Empty';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/slug';
import type { ScopeType, SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { Building2, Factory, Landmark, Network, Plus, Shield, Store, Warehouse } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Role, RoleScopeSection, RoleSiteTypeGroup, RoleTemplateRow } from '@/schemas/cloud/roles';
import { AddRoleForm } from './components/AddRoleForm';
import { CustomRoleRow, TemplateRow } from './components/RoleRow';

type IconType = React.FC<{ className?: string }>;

// Per-scope presentation — mirrors the structure-graph / plan-overview SCOPE_META (design-token colors, no hardcoded values)
const SCOPE_META: Record<ScopeType, { title: string; desc: string; icon: IconType; color: string; bg: string }> = {
  ORG: {
    title: 'Organization',
    desc: 'Applies across the whole organization.',
    icon: Building2,
    color: 'text-foreground',
    bg: 'bg-foreground/10',
  },
  LE: {
    title: 'Legal Entity',
    desc: 'Scoped to a single legal entity.',
    icon: Landmark,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  SITE_GROUP: {
    title: 'Site Group',
    desc: 'Manages sites across a group.',
    icon: Network,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  SITE: {
    title: 'Site',
    desc: 'Assigned at an individual site.',
    icon: Store,
    color: 'text-success',
    bg: 'bg-success/10',
  },
};

// Sub-grouping presentation for SITE-scoped roles — every SITE role targets one site type
const SITE_TYPE_META: Record<SiteType, { label: string; icon: IconType }> = {
  OUTLET: { label: 'Outlet', icon: Store },
  WAREHOUSE: { label: 'Warehouse', icon: Warehouse },
  PRODUCTION: { label: 'Production', icon: Factory },
};

// Total roles in a section — templates + custom roles across the section and its site-type groups
function sectionCount(section: RoleScopeSection): number {
  const groupCount = section.siteTypeGroups.reduce((n, g) => n + g.templates.length + g.customRoles.length, 0);
  return section.templates.length + section.customRoles.length + groupCount;
}

export const RolesPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();

  const { data: sections } = useRoles(orgId);
  const addDialog = useDialog();

  // Opens the newly created custom role's view page (slug URL) to set its permissions
  function handleCreated(role: Role) {
    addDialog.close();
    navigate(buildSlug(role.name, role.id));
  }

  const actions = (
    <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
      Add Role
    </Button>
  );

  const isEmpty = sections.every((section) => sectionCount(section) === 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles"
        description="Enable role templates or add custom roles for your organization"
        actions={actions}
      />

      {isEmpty ? (
        <Empty
          icon={<Shield />}
          title="No roles available"
          description="Add a custom role to manage access control."
          action={actions}
        />
      ) : (
        <div className="flex flex-col gap-10">
          {sections.map((section, index) => (
            <RoleSection key={section.scope} section={section} index={index} orgId={orgId} />
          ))}
        </div>
      )}

      <Dialog
        handle={addDialog}
        icon={Shield}
        title="Add Role"
        description="Name the role and choose its scope. You'll set its permissions next."
        content={(close) => <AddRoleForm orgId={orgId} onCreated={handleCreated} onCancel={close} />}
      />
    </div>
  );
};

interface RoleListProps {
  orgId: string;
  templates: RoleTemplateRow[];
  customRoles: Role[];
}

// A settings-style divided list — template toggles first, then custom-role delete rows
const RoleList: React.FC<RoleListProps> = ({ orgId, templates, customRoles }) => (
  <div className="divide-y overflow-hidden rounded-lg border bg-card">
    {templates.map(({ template, role }) => (
      <TemplateRow key={template.code} orgId={orgId} template={template} role={role ?? undefined} />
    ))}
    {customRoles.map((role) => (
      <CustomRoleRow key={role.id} orgId={orgId} role={role} />
    ))}
  </div>
);

interface SiteTypeBlockProps {
  orgId: string;
  group: RoleSiteTypeGroup;
}

// One siteType sub-group under the SITE section — indented sub-header + its role rows
const SiteTypeBlock: React.FC<SiteTypeBlockProps> = ({ orgId, group }) => {
  const subMeta = SITE_TYPE_META[group.siteType];
  const SubIcon = subMeta.icon;

  return (
    <div className="flex flex-col gap-3 pl-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <SubIcon className="size-4 shrink-0" />
        <span className="text-xs font-medium tracking-tight text-foreground">{subMeta.label}</span>
        <Badge variant="outline" className="text-xs tabular-nums">
          {group.templates.length + group.customRoles.length}
        </Badge>
      </div>
      <RoleList orgId={orgId} templates={group.templates} customRoles={group.customRoles} />
    </div>
  );
};

interface RoleSectionProps {
  section: RoleScopeSection;
  index: number;
  orgId: string;
}

// One scope section — accent-tiled header with count + description, then its role rows (SITE splits by siteType)
const RoleSection: React.FC<RoleSectionProps> = ({ section, index, orgId }) => {
  const meta = SCOPE_META[section.scope];
  const Icon = meta.icon;
  const count = sectionCount(section);

  return (
    <section
      className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Scope header — accent icon tile, title, count badge, muted description, subtle divider */}
      <div className="flex items-center gap-3 border-b pb-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
          <Icon className={`size-5 ${meta.color}`} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{meta.title}</h2>
            <Badge variant="secondary" className="text-xs tabular-nums">
              {count}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{meta.desc}</p>
        </div>
      </div>

      {/* Body — per-section empty state, siteType sub-groups (SITE only), or a flat list */}
      {count === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
          No {meta.title.toLowerCase()} roles yet.
        </div>
      ) : section.siteTypeGroups.length > 0 ? (
        <div className="flex flex-col gap-6">
          {section.siteTypeGroups.map((group) => (
            <SiteTypeBlock key={group.siteType} orgId={orgId} group={group} />
          ))}
        </div>
      ) : (
        <RoleList orgId={orgId} templates={section.templates} customRoles={section.customRoles} />
      )}
    </section>
  );
};
