export interface User {
  id: number;
  username: string;
  email: string;
  profilePhotoUrl?: string | null;
  favoriteSports?: string | null;
  createdAt: string;
  role: string;
}

export interface UpdateUserDto {
  username?: string | null;
  profilePhotoUrl?: string | null;
  favoriteSports?: string | null;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  role: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  message: string;
}
