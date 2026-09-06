import { prisma } from '@/lib/prisma';
import { Gender, MembershipType, UserStatus } from '@/features/users/types/users.enums';
import type { UserCreateData, UserType, UserUpdateData } from '@/features/users/types';

const DEFAULT_WORKSPACE = {
  name: 'Default Workspace',
  slug: 'default-workspace',
};

const ensureDefaultWorkspace = async () =>
  prisma.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE.slug },
    update: {},
    create: DEFAULT_WORKSPACE,
  });

const normalizeUser = (user: any): UserType => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  mobileNo: user.mobileNo ?? '',
  firebaseUid: user.firebaseUid ?? undefined,
  fcmToken: user.fcmToken ?? undefined,
  membershipType:
    (user.membershipType as MembershipType) ?? MembershipType.FREE,
  status: (user.status as UserStatus) ?? UserStatus.ACTIVE,
  isActive: user.isActive ?? true,
  isExpert: user.isExpert ?? false,
  dateOfBirth: user.dateOfBirth ?? new Date(),
  gender: (user.gender as Gender) ?? Gender.OTHER,
  preferences:
    user.preferences && typeof user.preferences === 'object'
      ? (user.preferences as UserType['preferences'])
      : undefined,
  children:
    Array.isArray(user.children) ? (user.children as UserType['children']) : undefined,
  lastLoginAt: user.lastLoginAt?.toISOString(),
  lastActiveAt: user.lastActiveAt?.toISOString(),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const userRepository = {
  async findAll(): Promise<UserType[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map(normalizeUser);
  },

  async findById(id: string): Promise<UserType | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? normalizeUser(user) : null;
  },

  async findByEmail(email: string): Promise<UserType | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? normalizeUser(user) : null;
  },

  async create(input: UserCreateData & { workspaceId?: string }): Promise<UserType> {
    const workspace = await ensureDefaultWorkspace();

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        mobileNo: input.mobileNo,
        membershipType: input.membershipType ?? MembershipType.FREE,
        status: UserStatus.ACTIVE,
        isActive: true,
        isExpert: false,
        gender: input.gender ?? Gender.OTHER,
        preferences: {
          themeMode: 'system',
          languageCode: 'en',
          notificationsEnabled: true,
          emailNotificationsEnabled: true,
          smsNotificationsEnabled: false,
          biometricEnabled: false,
        },
        workspaceId: input.workspaceId ?? workspace.id,
      },
    });

    return normalizeUser(user);
  },

  async update(id: string, input: UserUpdateData): Promise<UserType | null> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: input.fullName,
        email: input.email,
        mobileNo: input.mobileNo,
        membershipType: input.membershipType,
        status: input.status,
        isActive: input.isActive,
        isExpert: input.isExpert,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        preferences: (input.preferences ?? undefined) as any,
        children: (input.children ?? undefined) as any,
      },
    });

    return normalizeUser(user);
  },

  async remove(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
};

export default userRepository;
