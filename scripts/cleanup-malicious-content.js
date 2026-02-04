// Database Cleanup Script - Clean Malicious Casino/Gambling Content from Meta Fields
// NO DELETES - Only overwrites malicious meta fields with empty string
// Run: node scripts/cleanup-malicious-content.js

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
async function connectDB() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUrl) {
    console.error('❌ MongoDB URI not found. Add MONGO_URL, MONGODB_URI, or MONGO_URI to your .env file.');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

const spamRegex = /casino|gambling|bet|poker|slot|free.*spin|withdrawal.*crypto|instant.*withdrawal|fast.*payout|no.*deposit.*crypto|cash.*out.*money|unleash.*fortune|soccer.*betting|betting.*sites|top.*betting|vip.*levels|exciting.*bonuses|soo-foo\.com|legends\s*bet|epic\s*winnings|crypto\s*loko|mgm\s*online|sky\s*sweeps|bovada|gacor|sports\s*betting|live\s*casino\s*slot/i;

function isMalicious(content) {
  if (!content || typeof content !== 'string') return false;
  return spamRegex.test(content);
}

async function cleanupDatabase() {
  await connectDB();

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Blog = mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  const SubCategory = mongoose.model('SubCategory', new mongoose.Schema({}, { strict: false }));

  console.log('\n🔍 Starting database cleanup (NO DELETES - only cleaning meta fields)...\n');

  // 1. Clean Products - meta fields only
  console.log('📦 Cleaning products meta fields...');
  const productsToClean = await Product.find({}).lean();
  let productCleaned = 0;
  for (const p of productsToClean) {
    const updates = {};
    if (p.metaTitle && isMalicious(p.metaTitle)) updates.metaTitle = '';
    if (p.metaDescription && isMalicious(p.metaDescription)) updates.metaDescription = '';
    if (p.metaKeywords && isMalicious(p.metaKeywords)) updates.metaKeywords = '';
    if (p.video && isMalicious(p.video)) updates.video = '';
    if (p.youtubeUrl && isMalicious(p.youtubeUrl)) updates.youtubeUrl = '';
    if (Object.keys(updates).length > 0) {
      await Product.updateOne({ _id: p._id }, { $set: updates });
      productCleaned++;
    }
  }
  console.log(`   ✅ Cleaned ${productCleaned} products`);

  // 2. Clean Blogs - meta fields only
  console.log('\n📝 Cleaning blogs meta fields...');
  const blogsToClean = await Blog.find({}).lean();
  let blogCleaned = 0;
  for (const b of blogsToClean) {
    const updates = {};
    if (b.metaTitle && isMalicious(b.metaTitle)) updates.metaTitle = '';
    if (b.metaDescription && isMalicious(b.metaDescription)) updates.metaDescription = '';
    if (b.metaKeywords && isMalicious(b.metaKeywords)) updates.metaKeywords = '';
    if (Object.keys(updates).length > 0) {
      await Blog.updateOne({ _id: b._id }, { $set: updates });
      blogCleaned++;
    }
  }
  console.log(`   ✅ Cleaned ${blogCleaned} blogs`);

  // 3. Clean Categories - meta fields only
  console.log('\n📂 Cleaning categories meta fields...');
  const categoriesToClean = await Category.find({}).lean();
  let categoryCleaned = 0;
  for (const c of categoriesToClean) {
    const updates = {};
    if (c.metatitle && isMalicious(c.metatitle)) updates.metatitle = '';
    if (c.metadescription && isMalicious(c.metadescription)) updates.metadescription = '';
    if (c.metakeywords && isMalicious(c.metakeywords)) updates.metakeywords = '';
    if (Object.keys(updates).length > 0) {
      await Category.updateOne({ _id: c._id }, { $set: updates });
      categoryCleaned++;
    }
  }
  console.log(`   ✅ Cleaned ${categoryCleaned} categories`);

  // 4. Clean SubCategories - meta fields only
  console.log('\n📁 Cleaning subcategories meta fields...');
  const subcatsToClean = await SubCategory.find({}).lean();
  let subcatCleaned = 0;
  for (const s of subcatsToClean) {
    const updates = {};
    if (s.metatitle && isMalicious(s.metatitle)) updates.metatitle = '';
    if (s.metadescription && isMalicious(s.metadescription)) updates.metadescription = '';
    if (s.metakeyword && isMalicious(s.metakeyword)) updates.metakeyword = '';
    if (Object.keys(updates).length > 0) {
      await SubCategory.updateOne({ _id: s._id }, { $set: updates });
      subcatCleaned++;
    }
  }
  console.log(`   ✅ Cleaned ${subcatCleaned} subcategories`);

  console.log('\n✅ Cleanup completed! No records deleted.\n');
  await mongoose.connection.close();
  process.exit(0);
}

cleanupDatabase().catch(error => {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
});
