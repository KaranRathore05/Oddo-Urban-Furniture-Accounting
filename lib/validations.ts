import { z } from 'zod';

// --- Auth Schemas ---

export const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  loginId: z.string().min(6, 'Login ID must be 6-12 characters').max(12, 'Login ID must be 6-12 characters'),
  email: z.string().email('Invalid email format'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits'),
  role: z.enum(['USER', 'ADMIN'], { message: 'Select a role' }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must include at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// --- Contact Schemas ---

export const contactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  type: z.enum(['CUSTOMER', 'VENDOR', 'BOTH'], { message: 'Select a valid contact type' }),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits').optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().optional().or(z.literal('')),
});

// --- Product Schemas ---

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  type: z.enum(['GOODS', 'SERVICE'], { message: 'Select a valid product type' }),
  salesPrice: z.number().positive('Sales price must be positive'),
  cost: z.number().positive('Cost must be positive'),
  category: z.string().optional().or(z.literal('')),
});

// --- Purchase Order Schemas ---

export const purchaseOrderLineSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  qty: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Select a vendor'),
  date: z.string().min(1, 'Date is required'),
  lines: z.array(purchaseOrderLineSchema).min(1, 'At least one line item is required'),
});

// --- Sales Order Schemas ---

export const salesOrderLineSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  qty: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  taxPct: z.number().min(0, 'Tax % cannot be negative').default(0),
});

export const salesOrderSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  date: z.string().min(1, 'Date is required'),
  lines: z.array(salesOrderLineSchema).min(1, 'At least one line item is required'),
});

// --- Payment Schemas ---

export const paymentSchema = z.object({
  method: z.enum(['CASH', 'BANK'], { message: 'Select a payment method' }),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
});

// --- Types ---

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type SalesOrderInput = z.infer<typeof salesOrderSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
