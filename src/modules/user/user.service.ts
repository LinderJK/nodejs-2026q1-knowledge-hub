import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PublicUser, User } from "./types/user.types";
import { CreateUserDto } from "./dto/create-user.dto";
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
    }

    async getUsers(): Promise<PublicUser[]> {
            return this.store.users.map((user) => this.toPublicUser(user));
    }

    private toPublicUser(user: User): PublicUser {
        const { password, ...publicUser } = user;
        return publicUser as PublicUser;
    }

}