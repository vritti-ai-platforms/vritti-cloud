import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { CountriesTableResponse, Country, CreateCountryData, UpdateCountryData } from '@/schemas/admin/countries';

// Fetches countries for the data table — server applies filter/sort state
export function getCountries(): Promise<CountriesTableResponse> {
  return axios.get<CountriesTableResponse>('admin-api/countries/table').then((r) => r.data);
}

// Creates a new country
export function createCountry(data: CreateCountryData): Promise<CreateResponse<Country>> {
  return axios.post<CreateResponse<Country>>('admin-api/countries', data).then((r) => r.data);
}

// Updates a country by ID
export function updateCountry({ id, data }: { id: string; data: UpdateCountryData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/countries/${id}`, data).then((r) => r.data);
}

// Deletes a country by ID
export function deleteCountry(id: string): Promise<void> {
  return axios.delete(`admin-api/countries/${id}`).then(() => undefined);
}
