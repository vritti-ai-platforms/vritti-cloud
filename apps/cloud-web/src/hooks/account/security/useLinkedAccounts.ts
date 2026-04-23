import { type LinkedAccountsResponse, getLinkedAccounts } from '@services/account/security.service';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export const LINKED_ACCOUNTS_QUERY_KEY = ['account', 'security', 'linked-accounts'];

export function useLinkedAccounts() {
  return useQuery<LinkedAccountsResponse, AxiosError>({
    queryKey: LINKED_ACCOUNTS_QUERY_KEY,
    queryFn: getLinkedAccounts,
  });
}
