import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/config/database.js';
import User from './src/models/userModel.js';
import Customer from './src/models/customerModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Migration script to move data from JSON files to MongoDB
async function migrateData() {
  try {
    console.log('Starting migration from JSON files to MongoDB...');

    // Connect to database
    await connectDB();

    // Read existing users.json
    const usersFile = path.join(__dirname, 'users.json');
    const customersFile = path.join(__dirname, 'customers.json');

    let users = [];
    let customers = {};

    if (fs.existsSync(usersFile)) {
      const usersData = fs.readFileSync(usersFile, 'utf8');
      users = JSON.parse(usersData);
      console.log(`Found ${users.length} users in JSON file`);
    }

    if (fs.existsSync(customersFile)) {
      const customersData = fs.readFileSync(customersFile, 'utf8');
      customers = JSON.parse(customersData);
      console.log(`Found customers for ${Object.keys(customers).length} users`);
    }

    // Create user email to ID mapping
    const userEmailToId = new Map();

    // Migrate users
    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
          console.log(`User ${userData.email} already exists, skipping...`);
          userEmailToId.set(userData.email, existingUser._id);
          continue;
        }

        // Create new user
        const user = new User({
          email: userData.email,
          password: userData.password, // Already hashed
          name: userData.name,
        });

        // Skip password hashing since it's already hashed
        user.password = userData.password;
        await user.save();

        userEmailToId.set(userData.email, user._id);
        console.log(`Migrated user: ${userData.email}`);
      } catch (error) {
        console.error(`Error migrating user ${userData.email}:`, error.message);
      }
    }

    // Migrate customers
    for (const [userEmail, userCustomers] of Object.entries(customers)) {
      const userId = userEmailToId.get(userEmail);
      if (!userId) {
        console.log(
          `No user found for email ${userEmail}, skipping customers...`
        );
        continue;
      }

      for (const customerData of userCustomers) {
        try {
          const customer = new Customer({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone || '',
            company: customerData.company || '',
            user: userId,
          });

          await customer.save();
          console.log(
            `Migrated customer: ${customerData.name} for user ${userEmail}`
          );
        } catch (error) {
          console.error(
            `Error migrating customer ${customerData.name}:`,
            error.message
          );
        }
      }
    }

    console.log('Migration completed successfully!');
    console.log('You can now delete the JSON files if everything looks good.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData();
}

export { migrateData };
