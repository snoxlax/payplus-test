import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUSTOMERS_FILE = path.join(__dirname, '../../customers.json');

// Helper function to read customers from JSON file
const readCustomers = async () => {
  try {
    const data = await fs.readFile(CUSTOMERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty object
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

// Helper function to write customers to JSON file
const writeCustomers = async (customers) => {
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
};

// Get customers for a specific user
export const getCustomers = async (userId) => {
  const customers = await readCustomers();
  return customers[userId] || [];
};

export const getCustomer = async (customerId, userId) => {
  const customers = await readCustomers();
  return customers[userId].find((customer) => customer.id === customerId);
};

// Add a new customer
export const addCustomer = async (customerData, userId) => {
  const customers = await readCustomers();

  if (!customers[userId]) {
    customers[userId] = [];
  }

  const newCustomer = {
    id: nanoid(),
    ...customerData,
    createdAt: new Date().toISOString(),
  };

  customers[userId].push(newCustomer);
  await writeCustomers(customers);

  return newCustomer;
};

// Delete a customer
export const deleteCustomer = async (customerId, userId) => {
  const customers = await readCustomers();

  if (!customers[userId]) {
    return null;
  }

  const customerIndex = customers[userId].findIndex(
    (customer) => customer.id === customerId
  );
  if (customerIndex === -1) {
    return null;
  }

  const deletedCustomer = customers[userId].splice(customerIndex, 1)[0];
  await writeCustomers(customers);

  return deletedCustomer;
};

// Update a customer
export const updateCustomer = async (customerId, updateData, userId) => {
  const customers = await readCustomers();

  if (!customers[userId]) {
    return null;
  }

  const customerIndex = customers[userId].findIndex(
    (customer) => customer.id === customerId
  );
  if (customerIndex === -1) {
    return null;
  }

  customers[userId][customerIndex] = {
    ...customers[userId][customerIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  await writeCustomers(customers);

  return customers[userId][customerIndex];
};

// Find customer by ID
export const findCustomerById = async (customerId, userId) => {
  const customers = await readCustomers();

  if (!customers[userId]) {
    return null;
  }

  return customers[userId].find((customer) => customer.id === customerId);
};
