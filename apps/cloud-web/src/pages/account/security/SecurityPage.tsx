import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import type { TabItem } from '@vritti/quantum-ui/Tabs';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { ChangePasswordTab } from './tabs/ChangePasswordTab';
import { LinkedAccountsTab } from './tabs/LinkedAccountsTab';
import { MfaTab } from './tabs/MfaTab';
import { SessionsTab } from './tabs/SessionsTab';

const tabs: TabItem[] = [
  { value: 'password', label: 'Password', content: <ChangePasswordTab /> },
  { value: 'sessions', label: 'Sessions', content: <SessionsTab /> },
  { value: 'mfa', label: 'Two-Factor Auth', content: <MfaTab /> },
  { value: 'linked', label: 'Linked Accounts', content: <LinkedAccountsTab /> },
];

export const SecurityPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Security" description="Manage your password, sessions, and authentication methods" />
    <Tabs tabs={tabs} defaultValue="password" />
  </div>
);
