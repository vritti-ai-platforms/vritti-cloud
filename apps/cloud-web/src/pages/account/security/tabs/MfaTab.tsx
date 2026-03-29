import { Badge } from '@vritti/quantum-ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Typography } from '@vritti/quantum-ui/Typography';

export const MfaTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Two-Factor Authentication</CardTitle>
      <CardDescription>Add extra security to your account</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-3">
        <Badge variant="default">Coming Soon</Badge>
        <Typography variant="body2" intent="muted">
          TOTP, passkey, and backup code support coming soon.
        </Typography>
      </div>
    </CardContent>
  </Card>
);
