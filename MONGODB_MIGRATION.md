# MongoDB Migration Guide

Your JWT application has been successfully migrated from JSON file storage to MongoDB with Mongoose!

## What Changed

### Database Connection

- Added MongoDB connection configuration in `src/config/database.js`
- Updated `src/config/index.js` to include `MONGODB_URI` environment variable
- Modified `server.js` to connect to MongoDB on startup

### Models

- **User Model** (`src/models/userModel.js`): Now uses Mongoose schema with validation
- **Customer Model** (`src/models/customerModel.js`): New Mongoose model for customers with user relationships

### Controllers

- Updated `src/controllers/authController.js` to use async/await with Mongoose
- Updated `src/controllers/customerController.js` to use MongoDB operations
- Updated route handlers in `src/routes/customers.js`

## Environment Setup

Make sure your `.env` file contains:

```
MONGODB_URI=your_mongodb_connection_string
```

## Migration (Optional)

If you have existing data in `users.json` and `customers.json`, you can migrate it using:

```bash
node migrate-to-mongodb.js
```

This script will:

1. Read your existing JSON files
2. Create users in MongoDB (skipping duplicates)
3. Create customers linked to users
4. Preserve all existing data

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Customers Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  phone: String (optional),
  company: String (optional),
  user: ObjectId (ref to User, required),
  createdAt: Date,
  updatedAt: Date
}
```

## Key Benefits

1. **Data Persistence**: No more data loss on server restarts
2. **Scalability**: MongoDB handles large datasets efficiently
3. **Relationships**: Proper user-customer relationships with foreign keys
4. **Validation**: Mongoose schema validation for data integrity
5. **Indexing**: Optimized queries with database indexes
6. **Atomic Operations**: Database transactions for data consistency

## Testing

Your existing API endpoints will work exactly the same:

- `POST /api/auth/signup` - Create user
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/customers` - Get user's customers
- `POST /api/customers` - Add customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## Cleanup

After successful migration and testing, you can safely delete:

- `users.json`
- `customers.json`
- `migrate-to-mongodb.js` (optional)
- `MONGODB_MIGRATION.md` (optional)
