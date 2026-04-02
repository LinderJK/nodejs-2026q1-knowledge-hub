import { UserRole } from "../../../modules/user/types/user.types";

export const seedData = [
    {
        login: 'admin',
        password: 'admin',
        role: UserRole.ADMIN,
    },
    {
        login: 'editor',
        password: 'editor',
        role: UserRole.EDITOR,
    },
    {
        login: 'viewer',
        password: 'viewer',
        role: UserRole.VIEWER,
    },
    {
        login: 'viewer2',
        password: 'viewer2',
        role: UserRole.VIEWER,
    },
    {
        login: 'viewer3',
        password: 'viewer3',
        role: UserRole.VIEWER,
    },
    {
        login: 'viewer4',
        password: 'viewer4',
        role: UserRole.VIEWER,
    },
];