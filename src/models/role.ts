// Role model
export interface Role {
  id: number;
  name: string;
  chat_id: number;
}

// UserRole model
export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  chat_id: number;
}
