import { z } from 'zod';

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: '8 to 64 characters',
    test: (value) => value.length >= 8 && value.length <= 64,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'At least one special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(64, 'Use no more than 64 characters.')
  .regex(/[A-Z]/, 'Add at least one uppercase letter.')
  .regex(/[a-z]/, 'Add at least one lowercase letter.')
  .regex(/\d/, 'Add at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Add at least one special character.');

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const addressSchema = z.object({
  line1: z
    .string()
    .trim()
    .min(1, 'Enter an address.')
    .max(120, 'Use no more than 120 characters.'),
  line2: z
    .string()
    .trim()
    .max(120, 'Use no more than 120 characters.')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, 'Enter a city.')
    .max(60, 'Use no more than 60 characters.'),
  state: z
    .string()
    .trim()
    .min(1, 'Enter a state.')
    .max(60, 'Use no more than 60 characters.'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter exactly 6 digits.'),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'Choose a delivery address.'),
  paymentMethod: z.enum(['CARD', 'UPI', 'NET_BANKING', 'CASH_ON_DELIVERY']),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'Use at least 2 characters.')
      .max(50, 'Use no more than 50 characters.'),
    lastName: z
      .string()
      .trim()
      .min(2, 'Use at least 2 characters.')
      .max(50, 'Use no more than 50 characters.'),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email.')
      .max(120, 'Use no more than 120 characters.')
      .email('Enter a valid email address.'),
    phone: z.string().regex(/^\d{10}$/, 'Enter exactly 10 digits.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .superRefine((values, context) => {
    if (values.confirmPassword && values.confirmPassword !== values.password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(50, 'Use no more than 50 characters.'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(50, 'Use no more than 50 characters.'),
  phone: z.string().regex(/^\d{10}$/, 'Enter exactly 10 digits.'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .superRefine((values, context) => {
    if (values.newPassword === values.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'Choose a password different from your current password.',
      });
    }
    if (
      values.confirmPassword &&
      values.confirmPassword !== values.newPassword
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export const reviewSchema = z.object({
  rating: z.coerce.number().int('Choose a rating.').min(1).max(5),
  comment: z
    .string()
    .max(1000, 'Use no more than 1000 characters.')
    .optional()
    .or(z.literal('')),
});

export const adminProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(150, 'Use no more than 150 characters.'),
  description: z
    .string()
    .trim()
    .min(1, 'Enter a product description.')
    .max(2000, 'Use no more than 2000 characters.'),
  price: z.coerce
    .number({ invalid_type_error: 'Enter a price.' })
    .positive('Price must be greater than zero.')
    .refine(
      (value) =>
        Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(String(value)),
      'Use no more than 2 decimal places.',
    ),
  stockQuantity: z.coerce
    .number({ invalid_type_error: 'Enter a stock quantity.' })
    .int('Enter a whole number.')
    .min(0, 'Stock cannot be negative.'),
  categoryId: z.coerce.number().int().positive('Choose a category.'),
  imageUrl: z
    .string()
    .trim()
    .max(255, 'Use no more than 255 characters.')
    .refine(
      (value) => value === '' || z.string().url().safeParse(value).success,
      'Enter a valid image URL.',
    )
    .optional()
    .or(z.literal('')),
});

export const adminStockSchema = z.object({
  stockQuantity: z.coerce
    .number({ invalid_type_error: 'Enter a stock quantity.' })
    .int('Enter a whole number.')
    .min(0, 'Stock cannot be negative.'),
});

export const adminCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a category name.')
    .max(80, 'Use no more than 80 characters.'),
  description: z
    .string()
    .trim()
    .max(255, 'Use no more than 255 characters.')
    .optional()
    .or(z.literal('')),
});
