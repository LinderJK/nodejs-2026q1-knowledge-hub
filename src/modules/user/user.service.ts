import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PublicUser, User } from "./types/user.types";
import { CreateUserDto } from "./dto/create-user.dto";


@Injectable()
export class UserService {
    private readonly userRepository: User[];
    constructor() {
        this.userRepository = [];
    }

    async createUser(user: CreateUserDto): Promise<PublicUser> {
        const newUser: User = {
            ...user,
            id: crypto.randomUUID(),
            createdAt: Date.now(), // timestamp of creation
            updatedAt: Date.now(), // timestamp of last update
        };
        this.userRepository.push(newUser);
        return this.toPublicUser(newUser);
    }

    async getUserById(id: string): Promise<PublicUser> {
        const user = this.userRepository.find((user) => user.id === id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.toPublicUser(user);
    }

    async updateUser(id: string, user: PublicUser): Promise<PublicUser> {
        const userIndex = this.userRepository.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException('User not found');
        }
        this.userRepository[userIndex] = {
            ...this.userRepository[userIndex],
            ...user,
            updatedAt: Date.now(),
        };
        return this.toPublicUser(this.userRepository[userIndex]);
    }

    async updateUserPassword(id: string, oldPassword: string, newPassword: string): Promise<PublicUser> {
        const user = this.userRepository.find((user) => user.id === id);
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
        const userIndex = this.userRepository.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException('User not found');
        }
        this.userRepository.splice(userIndex, 1);
    }

    async getUsers(): Promise<PublicUser[]> {
            return this.userRepository.map((user) => this.toPublicUser(user));
    }

    private toPublicUser(user: User): PublicUser {
        const { password, ...publicUser } = user;
        return publicUser as PublicUser;
    }

}