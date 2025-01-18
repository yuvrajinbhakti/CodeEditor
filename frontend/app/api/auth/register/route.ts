// // pages/api/auth/register.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import bcrypt from 'bcryptjs';
// import { connectToDatabase } from '../../../lib/mongodb';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const { username, email, password } = req.body;

//     // Validate input
//     if (!username || !email || !password) {
//       return res.status(400).json({ message: 'Please fill all fields' });
//     }

//     const { db } = await connectToDatabase();

//     // Check if user already exists
//     const existingUser = await db.collection('users').findOne({ 
//       $or: [{ email }, { username }] 
//     });

//     if (existingUser) {
//       return res.status(409).json({ message: 'User already exists' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create user
//     const result = await db.collection('users').insertOne({
//       username,
//       email,
//       password: hashedPassword,
//       createdAt: new Date()
//     });

//     res.status(201).json({ 
//       message: 'User registered successfully',
//       userId: result.insertedId 
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Server error during registration' });
//   }
// }

// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   if (req.method !== 'POST') {
//     return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
//   }

//   try {
//     const body = await req.json();
//     console.log('🚀 Incoming Registration Request Body:', JSON.stringify(body, null, 2));

//     const response = await fetch('http://localhost:8083/api/auth/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     console.log('🌐 Backend Response Status:', response.status);

//     const data = await response.text();
//     console.log('📦 Raw Backend Response:', data);

//     try {
//       const parsedData = JSON.parse(data);

//       if (response.ok) {
//         return NextResponse.json(parsedData, { status: response.status });
//       } else {
//         console.error('❌ Backend Error Response:', parsedData);
//         return NextResponse.json(parsedData, { status: response.status });
//       }
//     } catch (parseError) {
//       console.error('🔍 Response Parsing Error:', parseError);
//       console.error('Raw Unparseable Response:', data);
      
//       return NextResponse.json({ 
//         message: 'Unexpected server response format', 
//         rawResponse: data 
//       }, { status: 500 });
//     }
//   } catch (error) {
//     console.error('🚨 Full Registration Error:', error);
//     return NextResponse.json({ 
//       message: 'Server error during registration', 
//       error: error instanceof Error ? error.message : 'Unknown error' 
//     }, { status: 500 });
//   }
// }



// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
// import { UserSchema } from '@/lib/models/User';
import { UserSchema } from '@/lib/models/user';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = UserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.errors }, 
        { status: 400 }
      );
    }

    const { username, email, password } = body;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' }, 
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await usersCollection.insertOne({
      username,
      email,
      hashedPassword
    });

    return NextResponse.json(
      { 
        message: 'User registered successfully', 
        userId: result.insertedId 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}