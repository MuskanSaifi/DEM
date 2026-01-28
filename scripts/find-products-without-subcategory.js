// Script to find products without subcategory assigned
// Run: node scripts/find-products-without-subcategory.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const Product = require('../src/models/Product').default || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
const SubCategory = require('../src/models/SubCategory').default || mongoose.model('SubCategory', new mongoose.Schema({}, { strict: false }));

async function findProductsWithoutSubcategory() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB connection string not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all products without subcategory
    const productsWithoutSubcategory = await Product.find({
      $or: [
        { subCategory: null },
        { subCategory: { $exists: false } },
        { subCategory: '' }
      ]
    })
    .select('_id name productslug city state category userId createdAt')
    .populate('category', 'name')
    .populate('userId', 'fullname email')
    .lean();

    console.log(`\n📊 Total Products WITHOUT SubCategory: ${productsWithoutSubcategory.length}\n`);

    if (productsWithoutSubcategory.length > 0) {
      console.log('='.repeat(80));
      console.log('PRODUCTS WITHOUT SUBCATEGORY:');
      console.log('='.repeat(80));

      productsWithoutSubcategory.forEach((product, index) => {
        console.log(`\n${index + 1}. Product ID: ${product._id}`);
        console.log(`   Name: ${product.name || 'N/A'}`);
        console.log(`   Slug: ${product.productslug || 'N/A'}`);
        console.log(`   City: ${product.city || 'N/A'}`);
        console.log(`   State: ${product.state || 'N/A'}`);
        console.log(`   Category: ${product.category?.name || 'N/A'}`);
        console.log(`   User: ${product.userId?.fullname || 'N/A'} (${product.userId?.email || 'N/A'})`);
        console.log(`   Created At: ${product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}`);
        console.log(`   Product URL: https://www.dialexportmart.com/products/${product._id}`);
      });

      // Group by category
      const byCategory = {};
      productsWithoutSubcategory.forEach(product => {
        const catName = product.category?.name || 'No Category';
        if (!byCategory[catName]) {
          byCategory[catName] = [];
        }
        byCategory[catName].push(product);
      });

      console.log('\n' + '='.repeat(80));
      console.log('GROUPED BY CATEGORY:');
      console.log('='.repeat(80));
      Object.keys(byCategory).forEach(catName => {
        console.log(`\n${catName}: ${byCategory[catName].length} products`);
      });

      // Group by city
      const byCity = {};
      productsWithoutSubcategory.forEach(product => {
        const city = product.city || 'No City';
        if (!byCity[city]) {
          byCity[city] = [];
        }
        byCity[city].push(product);
      });

      console.log('\n' + '='.repeat(80));
      console.log('GROUPED BY CITY:');
      console.log('='.repeat(80));
      Object.keys(byCity).forEach(city => {
        console.log(`\n${city}: ${byCity[city].length} products`);
      });

    } else {
      console.log('✅ All products have subcategory assigned!');
    }

    // Also check products with invalid subcategory (subcategory doesn't exist)
    console.log('\n' + '='.repeat(80));
    console.log('CHECKING FOR PRODUCTS WITH INVALID SUBCATEGORY...');
    console.log('='.repeat(80));

    const allProducts = await Product.find({ subCategory: { $ne: null, $exists: true } })
      .select('_id name subCategory')
      .lean();

    const subcategoryIds = [...new Set(allProducts.map(p => p.subCategory?.toString()).filter(Boolean))];
    const validSubcategories = await SubCategory.find({ _id: { $in: subcategoryIds } })
      .select('_id')
      .lean();

    const validSubcategoryIds = new Set(validSubcategories.map(s => s._id.toString()));

    const productsWithInvalidSubcategory = allProducts.filter(p => {
      const subCatId = p.subCategory?.toString();
      return subCatId && !validSubcategoryIds.has(subCatId);
    });

    if (productsWithInvalidSubcategory.length > 0) {
      console.log(`\n⚠️  Found ${productsWithInvalidSubcategory.length} products with INVALID subcategory (subcategory doesn't exist):\n`);
      productsWithInvalidSubcategory.forEach((product, index) => {
        console.log(`${index + 1}. Product ID: ${product._id}`);
        console.log(`   Name: ${product.name || 'N/A'}`);
        console.log(`   Invalid SubCategory ID: ${product.subCategory}`);
      });
    } else {
      console.log('\n✅ All products with subcategory have valid subcategory IDs');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findProductsWithoutSubcategory();
