import dagre from '@dagrejs/dagre';
import { type Edge, type Node, Position } from '@xyflow/react';
import type {
  LegalEntity,
  OrgStructureResponse,
  SiteGroup,
  StructureSite,
  TaxRegistration,
} from '@/schemas/cloud/org-structure';
import type { GroupBandData } from './GroupBandNode';
import type { LEHeaderData } from './LEHeaderNode';
import type { LEPanelData, PanelTone } from './LEPanelNode';
import type { OrgNodeData } from './OrgNodeCard';
import type { SiteGroupNodeData } from './SiteGroupNodeCard';
import type { SiteNodeData } from './SiteNodeCard';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 164;
const GROUP_WIDTH = 220;
const GROUP_HEIGHT = 96;
const GROUP_RANK_GAP = 64;
const GROUP_NODE_SEP = 48;
const BAND_PAD = 28;
const BAND_LABEL_HEIGHT = 12;
const ORG_BAND_GAP = 72;
const BAND_LE_GAP = 110;
const PANEL_HEADER_INSET_X = 16;
const PANEL_HEADER_INSET_Y = 12;
const PANEL_HEADER_HEIGHT = 100;
const PANEL_PAD_X = 40;
const PANEL_PAD_BOTTOM = 24;
const PANEL_NEST_MARGIN = 16;
const SITE_GAP = 40;
const LE_GAP = 48;
const EMPTY_PANEL_HEIGHT = 148;
const EMPTY_PANEL_MIN_WIDTH = 340;

const REGIME_CHIP_PREFIX: Record<string, string> = {
  GST: 'GSTIN',
  VAT: 'VAT',
  SALES_TAX: 'TAX',
  NONE: 'REG',
};

export type DetailKind = 'org' | 'le' | 'group' | 'site';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StructureLayoutCallbacks {
  onAddRegistration?: (legalEntityId: string) => void;
  onOpenDetail?: (kind: DetailKind, id: string, name: string) => void;
  onAddChildGroup?: (parentId: string) => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

export interface StructureLayout {
  nodes: Node[];
  edges: Edge[];
}

function truncateTaxNumber(value: string): string {
  return value.length > 8 ? `${value.slice(0, 2)}…${value.slice(-3)}` : value;
}

function buildRegistrationChip(
  site: StructureSite,
  leById: Map<string, LegalEntity>,
  regById: Map<string, TaxRegistration>,
): string | null {
  if (!site.registrationId) return null;
  const registration = regById.get(site.registrationId);
  if (!registration) return null;
  const regime = site.legalEntityId ? leById.get(site.legalEntityId)?.taxRegime : undefined;
  return `${REGIME_CHIP_PREFIX[regime ?? 'NONE']} ${truncateTaxNumber(registration.taxNumber)}`;
}

// Approximate single-line header-pill width so a panel is never narrower than its own header
function estimateHeaderWidth(name: string): number {
  return Math.max(432, 220 + Math.ceil(name.length * 8));
}

export function buildStructureLayout(
  structure: OrgStructureResponse,
  callbacks: StructureLayoutCallbacks,
): StructureLayout {
  const { organization, legalEntities, taxRegistrations, siteGroups, sites } = structure;
  const leById = new Map(legalEntities.map((le) => [le.id, le]));
  const regById = new Map(taxRegistrations.map((reg) => [reg.id, reg]));
  const groupById = new Map(siteGroups.map((group) => [group.id, group]));

  const childGroups = new Map<string, SiteGroup[]>();
  const rootGroups: SiteGroup[] = [];
  for (const group of siteGroups) {
    if (group.parentId && groupById.has(group.parentId)) {
      const children = childGroups.get(group.parentId) ?? [];
      children.push(group);
      childGroups.set(group.parentId, children);
    } else {
      rootGroups.push(group);
    }
  }

  const membersByGroup = new Map<string, StructureSite[]>();
  for (const site of sites) {
    if (!site.groupId || !groupById.has(site.groupId)) continue;
    const members = membersByGroup.get(site.groupId) ?? [];
    members.push(site);
    membersByGroup.set(site.groupId, members);
  }

  // ── Management band: dagre over the org node + the group tree ──
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'TB', nodesep: GROUP_NODE_SEP, ranksep: GROUP_RANK_GAP });
  graph.setNode(organization.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  for (const group of siteGroups) {
    graph.setNode(group.id, { width: GROUP_WIDTH, height: GROUP_HEIGHT });
    graph.setEdge(group.parentId && groupById.has(group.parentId) ? group.parentId : organization.id, group.id);
  }
  dagre.layout(graph);

  const orgPos = graph.node(organization.id);
  const orgNode: Node<OrgNodeData> = {
    id: organization.id,
    type: 'orgNode',
    position: { x: orgPos.x - NODE_WIDTH / 2, y: orgPos.y - NODE_HEIGHT / 2 },
    sourcePosition: Position.Bottom,
    data: {
      id: organization.id,
      name: organization.name,
      code: organization.code,
      legalEntityCount: legalEntities.length,
      siteCount: sites.length,
      siteGroupCount: siteGroups.length,
      onOpenDetail: callbacks.onOpenDetail,
    },
  };

  const distinctLeCount = (members: StructureSite[]): number =>
    new Set(members.map((site) => site.legalEntityId).filter((id): id is string => !!id)).size;

  const groupNodes: Node<SiteGroupNodeData>[] = siteGroups.map((group) => {
    const pos = graph.node(group.id);
    const members = membersByGroup.get(group.id) ?? [];
    const childCount = (childGroups.get(group.id) ?? []).length;
    return {
      id: group.id,
      type: 'siteGroupNode',
      position: { x: pos.x - GROUP_WIDTH / 2, y: pos.y - GROUP_HEIGHT / 2 },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      data: {
        id: group.id,
        name: group.name,
        code: group.code,
        childCount,
        siteCount: members.length,
        leCount: distinctLeCount(members),
        onAddChildGroup: callbacks.onAddChildGroup,
        onEditGroup: callbacks.onEditGroup,
        onDeleteGroup: callbacks.onDeleteGroup,
        onOpenDetail: callbacks.onOpenDetail,
      },
    };
  });

  // ── Edges: org → root groups and group → sub-group (solid), group → member site (dotted, crosses panels) ──
  const edges: Edge[] = [];
  for (const group of siteGroups) {
    const source = group.parentId && groupById.has(group.parentId) ? group.parentId : organization.id;
    edges.push({
      id: `g-${source}-${group.id}`,
      source,
      target: group.id,
      type: 'treeEdge',
      zIndex: -10,
      style: { stroke: 'var(--color-primary)', strokeWidth: 1.5 },
    });
  }
  for (const site of sites) {
    if (!site.groupId || !groupById.has(site.groupId)) continue;
    edges.push({
      id: `m-${site.groupId}-${site.id}`,
      source: site.groupId,
      target: site.id,
      type: 'smoothstep',
      zIndex: -10,
      style: {
        stroke: 'var(--color-primary)',
        strokeWidth: 1.5,
        strokeDasharray: '2 6',
        strokeLinecap: 'round',
        opacity: 0.75,
      },
    });
  }

  // ── Band rect behind the group cards ──
  let bandNode: Node<GroupBandData> | null = null;
  let bandBottom = orgNode.position.y + NODE_HEIGHT;
  if (groupNodes.length > 0) {
    const minX = Math.min(...groupNodes.map((n) => n.position.x));
    const maxX = Math.max(...groupNodes.map((n) => n.position.x + GROUP_WIDTH));
    const minY = Math.min(...groupNodes.map((n) => n.position.y));
    const maxY = Math.max(...groupNodes.map((n) => n.position.y + GROUP_HEIGHT));
    const rect: Rect = {
      x: minX - BAND_PAD,
      y: minY - BAND_PAD - BAND_LABEL_HEIGHT,
      width: maxX - minX + BAND_PAD * 2,
      height: maxY - minY + BAND_PAD * 2 + BAND_LABEL_HEIGHT,
    };
    bandNode = {
      id: 'site-group-band',
      type: 'groupBand',
      position: { x: rect.x, y: rect.y },
      style: { width: rect.width, height: rect.height, pointerEvents: 'none' },
      zIndex: -40,
      draggable: false,
      selectable: false,
      focusable: false,
      data: { label: 'Site groups — management' },
    };
    bandBottom = rect.y + rect.height;
  }

  // ── Money + sites: LE panels wrap their member sites (via legalEntityId); subsidiaries nest via le.parentId ──
  const membersByLe = new Map<string, StructureSite[]>();
  for (const site of sites) {
    if (!site.legalEntityId || !leById.has(site.legalEntityId)) continue;
    const members = membersByLe.get(site.legalEntityId) ?? [];
    members.push(site);
    membersByLe.set(site.legalEntityId, members);
  }

  const childLEs = new Map<string, LegalEntity[]>();
  const rootLEs: LegalEntity[] = [];
  for (const le of legalEntities) {
    if (le.parentId && leById.has(le.parentId)) {
      const children = childLEs.get(le.parentId) ?? [];
      children.push(le);
      childLEs.set(le.parentId, children);
    } else {
      rootLEs.push(le);
    }
  }

  const siteNodes: Node<SiteNodeData>[] = [];
  const boundsByLe = new Map<string, Rect>();

  const pushSiteNode = (site: StructureSite, x: number, y: number) => {
    siteNodes.push({
      id: site.id,
      type: 'siteNode',
      position: { x, y },
      targetPosition: Position.Top,
      data: {
        id: site.id,
        name: site.name,
        code: site.code,
        type: site.type,
        timezone: site.timezone,
        registrationChip: buildRegistrationChip(site, leById, regById),
        groupName: site.groupId ? (groupById.get(site.groupId)?.name ?? null) : null,
        onOpenDetail: callbacks.onOpenDetail,
      },
    });
  };

  // Lays an LE panel out as a row of member site cards with nested child panels beneath, returning its bounds
  const layoutLeTree = (le: LegalEntity, x: number, y: number): Rect => {
    const members = membersByLe.get(le.id) ?? [];
    const children = childLEs.get(le.id) ?? [];

    const contentTop = y + PANEL_HEADER_HEIGHT;
    let cursorX = x + PANEL_PAD_X;
    for (const site of members) {
      pushSiteNode(site, cursorX, contentTop);
      cursorX += NODE_WIDTH + SITE_GAP;
    }
    const siteRowRight = members.length > 0 ? cursorX - SITE_GAP : x;
    const siteRowBottom = members.length > 0 ? contentTop + NODE_HEIGHT : contentTop - PANEL_NEST_MARGIN;

    let childCursorX = x + PANEL_NEST_MARGIN;
    let childBottom = siteRowBottom;
    const childTop = siteRowBottom + PANEL_NEST_MARGIN;
    for (const child of children) {
      const childRect = layoutLeTree(child, childCursorX, childTop);
      childCursorX = childRect.x + childRect.width + PANEL_NEST_MARGIN * 2;
      childBottom = Math.max(childBottom, childRect.y + childRect.height);
    }
    const childRowRight = children.length > 0 ? childCursorX - PANEL_NEST_MARGIN : x;

    const contentRight = Math.max(siteRowRight + PANEL_PAD_X, childRowRight);
    const isEmpty = members.length === 0 && children.length === 0;
    const width = Math.max(contentRight - x, estimateHeaderWidth(le.name), isEmpty ? EMPTY_PANEL_MIN_WIDTH : 0);
    const height = isEmpty ? EMPTY_PANEL_HEIGHT : childBottom + PANEL_PAD_BOTTOM - y;
    const rect: Rect = { x, y, width, height };
    boundsByLe.set(le.id, rect);
    return rect;
  };

  const leTop = bandBottom + (groupNodes.length > 0 ? BAND_LE_GAP : ORG_BAND_GAP);
  let leCursorX = 0;
  let leSpanMinX = Number.POSITIVE_INFINITY;
  let leSpanMaxX = Number.NEGATIVE_INFINITY;
  for (const le of rootLEs) {
    const rect = layoutLeTree(le, leCursorX, leTop);
    leSpanMinX = Math.min(leSpanMinX, rect.x);
    leSpanMaxX = Math.max(leSpanMaxX, rect.x + rect.width);
    leCursorX = rect.x + rect.width + LE_GAP;
  }

  // Center the LE row under the management band / org node
  if (rootLEs.length > 0) {
    const anchorCenter = bandNode
      ? bandNode.position.x + Number(bandNode.style?.width ?? 0) / 2
      : orgNode.position.x + NODE_WIDTH / 2;
    const shift = anchorCenter - (leSpanMinX + leSpanMaxX) / 2;
    for (const node of siteNodes) {
      node.position = { ...node.position, x: node.position.x + shift };
    }
    for (const rect of boundsByLe.values()) {
      rect.x += shift;
    }
  }

  // ── Panels + floating header pills ──
  const registrationCounts = new Map<string, number>();
  for (const reg of taxRegistrations) {
    registrationCounts.set(reg.legalEntityId, (registrationCounts.get(reg.legalEntityId) ?? 0) + 1);
  }

  const panelNodes: Node<LEPanelData>[] = [];
  const headerNodes: Node<LEHeaderData>[] = [];

  const pushLe = (le: LegalEntity, depth: number) => {
    const rect = boundsByLe.get(le.id);
    if (!rect) return;
    const members = membersByLe.get(le.id) ?? [];
    const children = childLEs.get(le.id) ?? [];
    const tone: PanelTone = depth === 0 ? 'neutral' : 'nested';
    panelNodes.push({
      id: `le-${le.id}`,
      type: 'lePanel',
      position: { x: rect.x, y: rect.y },
      style: { width: rect.width, height: rect.height, pointerEvents: 'none' },
      zIndex: -20 + Math.min(depth, 15),
      draggable: false,
      selectable: false,
      focusable: false,
      data: { tone, empty: members.length === 0 && children.length === 0 },
    });
    headerNodes.push({
      id: `le-header-${le.id}`,
      type: 'leHeader',
      position: { x: rect.x + PANEL_HEADER_INSET_X, y: rect.y + PANEL_HEADER_INSET_Y },
      zIndex: 50,
      draggable: false,
      selectable: false,
      focusable: false,
      data: {
        legalEntity: le,
        relationship: depth === 0 ? 'LEGAL_ENTITY' : 'SUBSIDIARY',
        registrationCount: registrationCounts.get(le.id) ?? 0,
        maxWidth: rect.width - PANEL_HEADER_INSET_X * 2,
        onAddRegistration: callbacks.onAddRegistration,
        onOpenDetail: callbacks.onOpenDetail,
      },
    });
    for (const child of children) {
      pushLe(child, depth + 1);
    }
  };
  for (const le of rootLEs) {
    pushLe(le, 0);
  }

  const nodes: Node[] = [
    ...(bandNode ? [bandNode] : []),
    ...panelNodes,
    orgNode,
    ...groupNodes,
    ...siteNodes,
    ...headerNodes,
  ];
  return { nodes, edges };
}
