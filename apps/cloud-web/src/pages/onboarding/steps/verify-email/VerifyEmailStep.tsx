import type React from 'react';
import { useState } from 'react';
import { ChangeEmailForm } from './forms/ChangeEmailForm';
import { VerifyEmailForm } from './forms/VerifyEmailForm';

export const VerifyEmailStep: React.FC = () => {
  const [view, setView] = useState<'verify' | 'change'>('verify');

  return view === 'verify' ? (
    <VerifyEmailForm onChangeClick={() => setView('change')} />
  ) : (
    <ChangeEmailForm onBack={() => setView('verify')} />
  );
};
