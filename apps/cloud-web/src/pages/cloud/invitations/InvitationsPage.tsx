import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Typography } from '@vritti/quantum-ui/Typography';
import { MailOpen } from 'lucide-react';
import type React from 'react';

// Stub page for pending org invitations
export const InvitationsPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Pending Invitations" description="Invitation requests to join organizations" />
    <div className="py-16 text-center">
      <MailOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <Typography variant="body1" intent="muted">
        No pending invitations.
      </Typography>
    </div>
  </div>
);
