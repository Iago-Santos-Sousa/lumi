import api from "./api";

import {
  IClient,
  IClientPaginated,
  IClientPaginatedParams,
} from "../types/clients";

export const clientApi = () => ({
  getClients: async (
    params: IClientPaginatedParams,
  ): Promise<IClientPaginated> => {
    const query = new URLSearchParams();

    query.set("page", String(params.page));

    query.set("limit", String(params.limit));

    if (params.client_number !== undefined) {
      query.set("client_number", String(params.client_number));
    }

    if (params.initial_date) {
      query.set("initial_date", params.initial_date);
    }

    if (params.final_date) {
      query.set("final_date", params.final_date);
    }

    const response = await api.get(`/client?${query.toString()}`);
    return response.data;
  },

  getClientById: async (clientId: number): Promise<IClient> => {
    const response = await api.get(`/client/${clientId}`);
    return response.data;
  },
});
