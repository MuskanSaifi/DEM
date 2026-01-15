// Database Cleanup Script - Remove Malicious Casino/Gambling Content
// Run this script to clean your database

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Malicious patterns to detect
const maliciousPatterns = [
  /casino/i,
  /gambling/i,
  /bet/i,
  /poker/i,
  /slot/i,
  /free.*spin/i,
  /withdrawal.*crypto/i,
  /instant.*withdrawal/i,
  /fast.*payout/i,
  /no.*deposit.*crypto/i,
  /cash.*out.*money/i,
  /unleash.*fortune/i,
  /soccer.*betting/i,
  /betting.*sites/i,
  /top.*betting/i,
  /vip.*levels/i,
  /exciting.*bonuses/i,
  /soo-foo\.com/i
];

// Check if content contains malicious patterns
function isMalicious(content) {
  if (!content || typeof content !== 'string') return false;
  return maliciousPatterns.some(pattern => pattern.test(content));
}

async function cleanupDatabase() {
  await connectDB();
  
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Blog = mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  
  console.log('\n🔍 Starting database cleanup...\n');
  
  // 1. Find malicious products
  console.log('📦 Checking products...');
  const maliciousProducts = await Product.find({
    $or: [
      { name: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { description: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { metaTitle: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { metaDescription: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { metaKeywords: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { video: { $regex: /soo-foo\.com|betting|casino|gambling/i } },
      { youtubeUrl: { $regex: /soo-foo\.com|betting|casino|gambling/i } }
    ]
  }).lean();
  
  console.log(`   Found ${maliciousProducts.length} malicious products`);
  
  if (maliciousProducts.length > 0) {
    console.log('\n   Malicious products:');
    maliciousProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name || 'No name'} (ID: ${product._id})`);
      if (product.metaTitle) console.log(`      Meta Title: ${product.metaTitle.substring(0, 60)}...`);
      if (product.metaDescription) console.log(`      Meta Desc: ${product.metaDescription.substring(0, 60)}...`);
    });
    
    // Delete malicious products
    const deleteResult = await Product.deleteMany({
      _id: { $in: maliciousProducts.map(p => p._id) }
    });
    console.log(`\n   ✅ Deleted ${deleteResult.deletedCount} malicious products`);
  }
  
  // 2. Clean meta fields in remaining products
  console.log('\n🧹 Cleaning meta fields in products...');
  const productsToClean = await Product.find({
    $or: [
      { metaTitle: { $exists: true, $ne: null } },
      { metaDescription: { $exists: true, $ne: null } },
      { metaKeywords: { $exists: true, $ne: null } }
    ]
  }).lean();
  
  let cleanedCount = 0;
  for (const product of productsToClean) {
    const updates = {};
    let needsUpdate = false;
    
    if (product.metaTitle && isMalicious(product.metaTitle)) {
      updates.metaTitle = '';
      needsUpdate = true;
    }
    if (product.metaDescription && isMalicious(product.metaDescription)) {
      updates.metaDescription = '';
      needsUpdate = true;
    }
    if (product.metaKeywords && isMalicious(product.metaKeywords)) {
      updates.metaKeywords = '';
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await Product.updateOne({ _id: product._id }, { $unset: updates });
      cleanedCount++;
    }
  }
  console.log(`   ✅ Cleaned ${cleanedCount} products with malicious meta fields`);
  
  // 3. Check blogs
  console.log('\n📝 Checking blogs...');
  const maliciousBlogs = await Blog.find({
    $or: [
      { title: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { content: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { metaTitle: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } },
      { metaDescription: { $regex: /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com/i } }
    ]
  }).lean();
  
  console.log(`   Found ${maliciousBlogs.length} malicious blogs`);
  
  if (maliciousBlogs.length > 0) {
    console.log('\n   Malicious blogs:');
    maliciousBlogs.forEach((blog, index) => {
      console.log(`   ${index + 1}. ${blog.title || 'No title'} (ID: ${blog._id})`);
    });
    
    const deleteResult = await Blog.deleteMany({
      _id: { $in: maliciousBlogs.map(b => b._id) }
    });
    console.log(`\n   ✅ Deleted ${deleteResult.deletedCount} malicious blogs`);
  }
  
  console.log('\n✅ Database cleanup completed!\n');
  await mongoose.connection.close();
  process.exit(0);
}

// Run cleanup
cleanupDatabase().catch(error => {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
});
