import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getCustomers,
  getCustomer,
  addCustomer,
  deleteCustomer,
  updateCustomer,
} from '../models/customerModel.js';

// Get user's customers
export const getAllCustomersController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const customers = await getCustomers(userId);
  const customerNames = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
  }));

  res.json({
    success: true,
    customers: customerNames,
  });
});

export const getCustomerController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const customer = await getCustomer(id, userId);
  res.json({ success: true, customer: customer });
});

// Add new customer
export const addCustomerController = asyncHandler(async (req, res) => {
  const { name, email, phone, company } = req.body;
  const userId = req.user.id;

  const customerData = {
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || '',
    company: company?.trim() || '',
  };

  const newCustomer = await addCustomer(customerData, userId);

  res.status(201).json({
    success: true,
    message: 'Customer added successfully',
    customer: newCustomer,
  });
});

// Delete customer
export const deleteCustomerController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const customer = await deleteCustomer(id, userId);

  if (!customer) {
    console.log('Delete customer failed - customer not found:', {
      userId: userId,
      customerId: id,
    });
    return res.status(404).json({
      success: false,
      error: 'Customer not found',
    });
  }

  res.json({
    success: true,
    message: 'Customer deleted successfully',
  });
});

// Update customer
export const updateCustomerController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company } = req.body;
  const userId = req.user.id;

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email.trim();
  if (phone !== undefined) updateData.phone = phone.trim();
  if (company !== undefined) updateData.company = company.trim();

  const customer = await updateCustomer(id, updateData, userId);

  if (!customer) {
    console.log('Update customer failed - customer not found:', {
      userId: userId,
      customerId: id,
    });
    return res.status(404).json({
      success: false,
      error: 'Customer not found',
    });
  }

  res.json({
    success: true,
    message: 'Customer updated successfully',
    customer,
  });
});
