import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PublicUser, SortOrder, User, UserSortBy } from "./types/user.types";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUsersQueryDto } from "./dto/get-users-query.dto";
import { PaginatedUsersDto } from "./dto/paginated-users.dto";
import { InMemoryStore } from "../../common/store/in-memory.store";


@Injectable()
export class UserService {
    constructor(private readonly store: InMemoryStore) {}

    async createUser(user: CreateUserDto): Promise<PublicUser> {
        const newUser: User = {
            ...user,
            id: crypto.randomUUID(),
            createdAt: Date.now(), // timestamp of creation
            updatedAt: Date.now(), // timestamp of last update
        };
        this.store.users.push(newUser);
        return this.toPublicUser(newUser);
    }

    async getUserById(id: string): Promise<PublicUser> {
        const user = this.store.users.find((user) => user.id === id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.toPublicUser(user);
    }

    async updateUser(id: string, user: PublicUser): Promise<PublicUser> {
        const userIndex = this.store.users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException('User not found');
        }
        this.store.users[userIndex] = {
            ...this.store.users[userIndex],
            ...user,
            updatedAt: Date.now(),
        };
        return this.toPublicUser(this.store.users[userIndex]);
    }

    async updateUserPassword(id: string, oldPassword: string, newPassword: string): Promise<PublicUser> {
        const user = this.store.users.find((user) => user.id === id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (user.password !== oldPassword) {
            throw new ForbiddenException('Old password is incorrect');
        }
        user.password = newPassword;
        user.updatedAt = Date.now();
        return this.toPublicUser(user);
    }

    async deleteUser(id: string): Promise<void> {
        const userIndex = this.store.users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException('User not found');
        }
        this.store.users.splice(userIndex, 1);

        // delete user from all articles
        for (const article of this.store.articles) {
            if (article.authorId === id) article.authorId = null;
        }
        // delete comments by this user
        this.store.comments = this.store.comments.filter((c) => c.authorId !== id);
    }

    getUsers(query: GetUsersQueryDto): PaginatedUsersDto {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? UserSortBy.CREATED_AT;
        const sortOrder = query.sortOrder ?? SortOrder.ASC;

        let list = [...this.store.users];
        list.sort((a, b) => this.compareUsersByField(a, b, sortBy, sortOrder));
        const total = list.length;
        const start = (page - 1) * limit;
        const data = list.slice(start, start + limit).map((u) => this.toPublicUser(u));

        return { total, page, limit, data };
    }

    private toPublicUser(user: User): PublicUser {
        const { password, ...publicUser } = user;
        return publicUser as PublicUser;
    }

    private compareUsersByField(a: User, b: User, sortBy: UserSortBy, order: SortOrder): number {
        const valueA = a[sortBy];
        const valueB = b[sortBy];
        let result = 0;

        if (typeof valueA === "number" && typeof valueB === "number") {
            result = valueA - valueB;
        } else {
            const stringValueA = String(valueA ?? "");
            const stringValueB = String(valueB ?? "");
            result = stringValueA.localeCompare(stringValueB, undefined, { sensitivity: "base" });
        }

        return order === SortOrder.DESC ? -result : result;
    }

}