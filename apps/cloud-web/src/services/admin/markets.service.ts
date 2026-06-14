import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type {
  CreateMarketData,
  Market,
  MarketCountry,
  MarketsTableResponse,
  UpdateMarketData,
} from '@/schemas/admin/markets';

// Fetches markets for the data table — server applies filter/sort state
export function getMarkets(): Promise<MarketsTableResponse> {
  return axios.get<MarketsTableResponse>('admin-api/markets/table').then((r) => r.data);
}

// Fetches a single market by ID
export function getMarket(id: string): Promise<Market> {
  return axios.get<Market>(`admin-api/markets/${id}`).then((r) => r.data);
}

// Creates a new market
export function createMarket(data: CreateMarketData): Promise<CreateResponse<Market>> {
  return axios.post<CreateResponse<Market>>('admin-api/markets', data).then((r) => r.data);
}

// Updates a market by ID
export function updateMarket({ id, data }: { id: string; data: UpdateMarketData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/markets/${id}`, data).then((r) => r.data);
}

// Deletes a market by ID
export function deleteMarket(id: string): Promise<void> {
  return axios.delete(`admin-api/markets/${id}`).then(() => undefined);
}

// Fetches all countries with their assignment state for a market
export function getMarketCountries(marketId: string): Promise<MarketCountry[]> {
  return axios.get<MarketCountry[]>(`admin-api/markets/${marketId}/countries`).then((r) => r.data);
}

// Assigns a country to a market
export function assignMarketCountry({
  marketId,
  countryId,
}: {
  marketId: string;
  countryId: string;
}): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/markets/${marketId}/countries`, { countryId }).then((r) => r.data);
}

// Unassigns a country from a market
export function unassignMarketCountry({ marketId, countryId }: { marketId: string; countryId: string }): Promise<void> {
  return axios.delete(`admin-api/markets/${marketId}/countries/${countryId}`).then(() => undefined);
}
