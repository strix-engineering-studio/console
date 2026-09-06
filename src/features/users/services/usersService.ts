import { apiClient } from '@/lib/api/client';
import type { CreateUserFormValues, EditUserFormValues } from '../schemas';
import type { UserType } from '../types';

const USERS_ENDPOINT = '/api/users';

export const usersService = {
  async fetchUsers() {
    return apiClient.get<UserType[]>(USERS_ENDPOINT);
  },

  async fetchUserById(id: string) {
    return apiClient.get<UserType>(`${USERS_ENDPOINT}/${id}`);
  },

  async createUser(data: CreateUserFormValues) {
    return apiClient.post<UserType>(USERS_ENDPOINT, data);
  },

  async updateUser(id: string, data: Partial<EditUserFormValues>) {
    return apiClient.patch<UserType>(`${USERS_ENDPOINT}/${id}`, data);
  },

  async deleteUser(id: string) {
    return apiClient.delete<void>(`${USERS_ENDPOINT}/${id}`);
  },

  async updateUserStatus(
    id: string,
    status: UserType['status'],
    adminDetails: {
      adminId: string;
      adminName: string;
      reason?: string;
    },
  ) {
    return apiClient.patch<UserType>(`${USERS_ENDPOINT}/${id}/status`, {
      status,
      reason:
        adminDetails.reason ?? `${adminDetails.adminName} changed status`,
    });
  },

  async updateUserPreferences(
    id: string,
    preferences: UserType['preferences'],
  ) {
    return apiClient.patch<UserType>(`${USERS_ENDPOINT}/${id}/preferences`, {
      preferences,
    });
  },

  async updateUserChildren(
    id: string,
    children: UserType['children'],
  ) {
    return apiClient.patch<UserType>(`${USERS_ENDPOINT}/${id}/children`, {
      children,
    });
  },

  async updateCoinBalance(id: string, amount: number, reason: string) {
    return apiClient.patch<UserType>(`${USERS_ENDPOINT}/${id}/coins`, {
      amount,
      reason,
    });
  },
};

export default usersService;
