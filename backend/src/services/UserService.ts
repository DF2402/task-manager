import { DatabaseConnection } from '../database/connection';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user';

export class UserService {
    async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
            const db = DatabaseConnection.getInstance();
            db.all(
                'SELECT * FROM User ORDER BY Name',
                (err: any, rows: User[]) => {
                    if (err) reject(err);
                    else resolve(rows || []);
        }
            );
    });
  }

    async getUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
            const db = DatabaseConnection.getInstance();
            db.get(
                'SELECT * FROM User WHERE id = ?',
                [id],
                (err: any, row: User) => {
                    if (err) reject(err);
                    else resolve(row || null);
        }
            );
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
            const db = DatabaseConnection.getInstance();
            db.get(
                'SELECT * FROM User WHERE Email = ?',
                [email],
                (err: any, row: User) => {
                    if (err) reject(err);
                    else resolve(row || null);
        }
      );
    });
  }

    async createUser(userData: CreateUserRequest): Promise<User> {
        const db = DatabaseConnection.getInstance();
        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run(
                'INSERT INTO User (Name, Email, Password) VALUES (?, ?, ?)',
                [userData.Name, userData.Email || null, userData.Password],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                }
            );
        });

        const newUser = await this.getUserById(result.lastID);
        if (!newUser) {
            throw new Error('Failed to create user');
        }
        return newUser;
    }

    async updateUser(id: number, userData: UpdateUserRequest): Promise<User | null> {
        const db = DatabaseConnection.getInstance();
        const result = await new Promise<{ changes: number }>((resolve, reject) => {
            db.run(
                'UPDATE User SET Name = COALESCE(?, Name), Email = COALESCE(?, Email), Password = COALESCE(?, Password), Active = COALESCE(?, Active) WHERE id = ?',
                [userData.Name, userData.Email, userData.Password, userData.Active, id],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
      }
            );
        });

        if (result.changes === 0) {
            return null;
        }

        return this.getUserById(id);
      }

    async deleteUser(id: number): Promise<boolean> {
        const db = DatabaseConnection.getInstance();
        const result = await new Promise<{ changes: number }>((resolve, reject) => {
            db.run(
                'DELETE FROM User WHERE id = ?',
                [id],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
        }
      );
    });

        return result.changes > 0;
  }

    async activateUser(id: number): Promise<User | null> {
        return this.updateUser(id, { Active: true });
  }

    async deactivateUser(id: number): Promise<User | null> {
    return this.updateUser(id, { Active: false });
  }
} 