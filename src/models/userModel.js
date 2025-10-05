import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, '../../users.json');

// Helper function to read users from JSON file
const readUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Helper function to write users to JSON file
const writeUsers = async (users) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

// Find user by email
export const findUserByEmail = async (email) => {
  const users = await readUsers();
  return users.find((user) => user.email === email.toLowerCase());
};

// Find user by ID
export const findUserById = async (id) => {
  const users = await readUsers();
  return users.find((user) => user.id === id);
};

// Create new user
export const createUser = async (email, password, name, idNumber) => {
  const users = await readUsers();

  // Check if user already exists
  const existingUser = users.find((user) => user.email === email.toLowerCase());
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Check if ID number already exists
  const existingIdNumber = users.find((user) => user.idNumber === idNumber);
  if (existingIdNumber) {
    throw new Error('ID number already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = {
    id: nanoid(),
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name.trim(),
    idNumber: idNumber,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);

  return newUser;
};

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Get user without password
export const getUserWithoutPassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get all users (without passwords)
export const getAllUsers = async () => {
  const users = await readUsers();
  return users.map((user) => getUserWithoutPassword(user));
};

// Load users (for backward compatibility)
export const loadUsers = async () => {
  return await readUsers();
};
