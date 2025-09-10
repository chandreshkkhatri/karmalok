/**
 * Script to update existing users with the "basic" plan
 * Run with: node scripts/update-user-plans.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/karmalok';

async function updateUserPlans() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    console.log('Updating users without plan field...');
    
    // Update all users that don't have a plan field to have "basic" plan
    const result = await usersCollection.updateMany(
      { plan: { $exists: false } }, // Users without plan field
      { 
        $set: { 
          plan: 'basic',
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with basic plan`);
    
    // Get stats
    const totalUsers = await usersCollection.countDocuments();
    const basicUsers = await usersCollection.countDocuments({ plan: 'basic' });
    const proUsers = await usersCollection.countDocuments({ plan: 'pro' });
    const enterpriseUsers = await usersCollection.countDocuments({ plan: 'enterprise' });
    
    console.log('\n📊 Plan Statistics:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Basic plan: ${basicUsers}`);
    console.log(`Pro plan: ${proUsers}`);
    console.log(`Enterprise plan: ${enterpriseUsers}`);
    
  } catch (error) {
    console.error('❌ Error updating user plans:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  updateUserPlans()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { updateUserPlans };