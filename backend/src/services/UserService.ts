import { DatabaseConnection } from '../database/connection';
import { User, CreateUserRequest, UpdateUserRequest, UserResponse } from '../models/user';

export class UserService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllUsers(): Promise<UserResponse[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all('SELECT id, Name, Email, Created_At, On_boarded_at, Active FROM User ORDER BY id DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as UserResponse[]);
        }
      });
    });
  }

  async getUserById(id: number): Promise<UserResponse | null> {
    return new Promise((resolve, reject) => {
      this.getDb().get('SELECT id, Name, Email, Created_At, On_boarded_at, Active FROM User WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as UserResponse || null);
        }
      });
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.getDb().get('SELECT * FROM User WHERE Email = ?', [email], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as User || null);
        }
      });
    });
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return new Promise((resolve, reject) => {
      // 簡單的密碼處理（實際應用中應該使用 bcrypt 加密）
      const now = new Date().toISOString();
      
      this.getDb().run(
        'INSERT INTO User (Name, Email, Password, Created_At, Active) VALUES (?, ?, ?, ?, ?)',
        [data.Name, data.Email || null, data.Password, now, 1],
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              Name: data.Name,
              Email: data.Email || null,
              Created_At: now,
              On_boarded_at: null,
              Active: true
            });
          }
        }
      );
    });
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse | null> {
    return new Promise((resolve, reject) => {
      const updateFields = [];
      const updateValues = [];

      if (data.Name !== undefined) {
        updateFields.push('Name = ?');
        updateValues.push(data.Name);
      }
      if (data.Email !== undefined) {
        updateFields.push('Email = ?');
        updateValues.push(data.Email);
      }
      if (data.Password !== undefined) {
        updateFields.push('Password = ?');
        updateValues.push(data.Password);
      }
      if (data.On_boarded_at !== undefined) {
        updateFields.push('On_boarded_at = ?');
        updateValues.push(data.On_boarded_at);
      }
      if (data.Active !== undefined) {
        updateFields.push('Active = ?');
        updateValues.push(data.Active ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return this.getUserById(id);
      }

      updateValues.push(id);

      this.getDb().run(
        `UPDATE User SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null);
          } else {
            // 回傳更新後的用戶資料（不包含密碼）
            resolve({
              id: id,
              Name: data.Name || '',
              Email: data.Email || null,
              Created_At: '',
              On_boarded_at: data.On_boarded_at || null,
              Active: data.Active !== undefined ? data.Active : true
            });
          }
        }
      );
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM User WHERE id = ?', [id], function(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async activateUser(id: number): Promise<UserResponse | null> {
    const now = new Date().toISOString();
    return this.updateUser(id, { Active: true, On_boarded_at: now });
  }

  async deactivateUser(id: number): Promise<UserResponse | null> {
    return this.updateUser(id, { Active: false });
  }
} 