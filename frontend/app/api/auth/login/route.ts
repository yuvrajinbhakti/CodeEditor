// import axios, { AxiosError } from 'axios';

// // Base URL for your backend API
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083';

// interface LoginResponse {
//   token: string;
//   user_id: string;
// }

// interface User {
//   id: string;
//   email: string;
// }

// interface ApiError {
//   message: string;
// }

// const handleApiError = (error: unknown): never => {
//   if (axios.isAxiosError(error)) {
//     const axiosError = error as AxiosError<ApiError>;
//     if (axiosError.response) {
//       // The request was made and the server responded with a status code
//       throw new Error(axiosError.response.data.message || 'An unexpected error occurred');
//     } else if (axiosError.request) {
//       // The request was made but no response was received
//       throw new Error('No response received from server');
//     } else {
//       // Something happened in setting up the request
//       throw new Error('Error setting up the request');
//     }
//   }
  
//   // If it's not an axios error, throw a generic error
//   throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
// };

// export const login = async (email: string, password: string): Promise<LoginResponse> => {
//   try {
//     const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, {
//       email,
//       password,
//     });
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// };

// export const register = async (email: string, password: string): Promise<void> => {
//   try {
//     await axios.post(`${API_BASE_URL}/register`, {
//       email,
//       password,
//     });
//   } catch (error) {
//     handleApiError(error);
//   }
// };

// export const verifyToken = async (token: string): Promise<User> => {
//   try {
//     const response = await axios.get<User>(`${API_BASE_URL}/verify-token`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// };

// // Optional: Create a configured axios instance
// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Optional: Add an interceptor to attach token to requests
// export const setAuthToken = (token?: string) => {
//   if (token) {
//     apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete apiClient.defaults.headers.common['Authorization'];
//   }
// };



// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { createToken, comparePasswords } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    // Compare passwords
    const isValidPassword = await comparePasswords(
      password, 
      user.hashedPassword
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken(user._id.toString());

    // Set cookie and return response
    const response = NextResponse.json(
      { message: 'Login successful' }, 
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}