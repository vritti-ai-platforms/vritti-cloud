import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SubdomainAvailability } from '@/schemas/cloud/organizations';
import { checkSubdomain } from '@/services/cloud/organizations.service';

type UseCheckSubdomainOptions = Omit<UseMutationOptions<SubdomainAvailability, AxiosError, string>, 'mutationFn'>;

// Mutation to check if a subdomain is available before org creation
export function useCheckSubdomain(options?: UseCheckSubdomainOptions) {
  return useMutation<SubdomainAvailability, AxiosError, string>({
    mutationFn: checkSubdomain,
    ...options,
  });
}
