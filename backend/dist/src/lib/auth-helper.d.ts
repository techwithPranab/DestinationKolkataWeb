import { NextRequest } from 'next/server';
interface AuthUser {
    userId: string;
    role: string;
    email: string;
    name?: string;
}
export declare function getAuthenticatedUser(req: NextRequest): Promise<AuthUser>;
export {};
//# sourceMappingURL=auth-helper.d.ts.map