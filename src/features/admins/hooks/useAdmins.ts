import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminUsersService } from '../services/adminUsersService';
import type { AdminUserFormData } from '../schemas';
import { QUERY_KEYS } from '@/lib/constants/QUERY_KEYS';
import type { IAdminUser } from '../types';

export const useAdminUsersQuery = () => {
  return useQuery<IAdminUser[]>({
    queryKey: [QUERY_KEYS.ADMIN_USERS],
    queryFn: async () => {
      const response = await adminUsersService.fetchAdminUsers();
      return response.data ?? [];
    },
  });
};


export const useAdminUserQuery = (id: string) => {
  return useQuery<IAdminUser | null>({
    queryKey: [QUERY_KEYS.ADMIN_USERS, id],
    queryFn: async () => {
      const response = await adminUsersService.fetchAdminUser(id);
      return response.data ?? null;
    },
    enabled: !!id,
  });
};


export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IAdminUser, Error, AdminUserFormData>({
    mutationFn: async (data) => {
      const response = await adminUsersService.createAdminUser(data);

      if (!response.data) {
        throw new Error('Admin user creation returned no data.');
      }

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_USERS],
      });

      toast.success('Admin user created successfully.');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
};


export const useUpdateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IAdminUser,
    Error,
    {
      id: string;
      data: Partial<AdminUserFormData>;
    }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await adminUsersService.updateAdminUser(id, data);

      if (!response.data) {
        throw new Error('Admin user update returned no data.');
      }

      return response.data;
    },

    onSuccess: (adminUser) => {
      if (!adminUser) return;

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_USERS],
      });

      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.ADMIN_USERS,
          adminUser.id,
        ],
      });

      toast.success(
        `${adminUser.fullName} updated successfully.`
      );
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
};


export const useDeleteAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await adminUsersService.deleteAdminUser(id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_USERS],
      });

      toast.success('Admin user deleted successfully.');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
};


export const useToggleAdminStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IAdminUser,
    Error,
    {
      id: string;
      isActive: boolean;
    }
  >({
    mutationFn: async ({ id, isActive }) => {
      const response = await adminUsersService.updateAdminStatus(id, isActive);

      if (!response.data) {
        throw new Error('Admin status update returned no data.');
      }

      return response.data;
    },

    onSuccess: (adminUser) => {
      if (!adminUser) return;

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_USERS],
      });

      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.ADMIN_USERS,
          adminUser.id,
        ],
      });

      toast.success(
        `Admin ${adminUser.isActive ? 'activated' : 'deactivated'} successfully.`
      );
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
};
