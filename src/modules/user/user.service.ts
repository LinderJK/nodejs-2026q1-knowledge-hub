import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./types/user.types";
import { CreateUserDto } from "./dto/create-user.dto";


@Injectable()
export class UserService {
    private readonly userRepository: User[];
    constructor() {
        this.userRepository = [];
    }

    async createUser(user: CreateUserDto): Promise<User> {
        const newUser: User = {
            ...user,
            id: crypto.randomUUID(),
            createdAt: Date.now(), // timestamp of creation
            updatedAt: Date.now(), // timestamp of last update
        };
        this.userRepository.push(newUser);
        return newUser as User;
    }

    async getUserById(id: string): Promise<User> {
        const user = this.userRepository.find((user) => user.id === id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async updateUser(id: string, user: User): Promise<User> {
        const userIndex = this.userRepository.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException('User not found');
        }
        this.userRepository[userIndex] = {
            ...this.userRepository[userIndex],
            ...user,
            updatedAt: Date.now(),
        };
        return this.userRepository[userIndex];
    }

    async deleteUser(id: string): Promise<void> {
        const userIndex = this.userRepository.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException('User not found');
        }
        this.userRepository.splice(userIndex, 1);
    }

    async getUsers(): Promise<User[]> {
        return this.userRepository;
    }

}