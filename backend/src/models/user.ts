export interface User {
    id: number;
    Name: string;
    Email: string | null;
    Password: string;
    Created_At: string;
    On_boarded_at: string | null;
    Active: boolean;
}

export interface CreateUserRequest {
    Name: string;
    Email?: string;
    Password: string;
}

export interface UpdateUserRequest {
    Name?: string;
    Email?: string;
    Password?: string;
    On_boarded_at?: string;
    Active?: boolean;
}

export interface LoginRequest {
    Email: string;
    Password: string;
}

export interface UserResponse {
    id: number;
    Name: string;
    Email: string | null;
    Created_At: string;
    On_boarded_at: string | null;
    Active: boolean;
} 