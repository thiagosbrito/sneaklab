const postgres = require('postgres');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

async function performDataMigration() {
  const sql = postgres(process.env.DATABASE_POOLER_URL, {
    prepare: false,
  });
  
  try {
    console.log('🚀 Starting data migration to UUID schema...');
    
    // Step 1: Backup existing data
    console.log('\n📦 Step 1: Backing up existing data...');
    const backupData = {};
    
    const tablesToBackup = [
      'products', 'categories', 'brands', 'order_items', 'orders', 
      'wishlist', 'about_us_section', 'hero_section', 'showcase_section',
      'profiles', 'shopping_bags'
    ];
    
    for (const table of tablesToBackup) {
      try {
        const data = await sql.unsafe(`SELECT * FROM ${table}`);
        backupData[table] = data;
        console.log(`   ✅ ${table}: ${data.length} records`);
      } catch (error) {
        console.log(`   ⚠️  ${table}: Table not found or empty`);
        backupData[table] = [];
      }
    }
    
    // Save backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `data_backup_${timestamp}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`   💾 Backup saved to: ${backupFile}`);
    
    // Step 2: Drop existing tables and apply new schema
    console.log('\n🗑️  Step 2: Dropping existing tables...');
    
    // Drop tables in reverse dependency order
    const dropOrder = [
      'order_items', 'wishlist', 'products', 'categories', 'brands',
      'about_us_section', 'hero_section', 'showcase_section', 'shopping_bags', 'orders', 'profiles'
    ];
    
    for (const table of dropOrder) {
      try {
        await sql.unsafe(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`   ✅ Dropped ${table}`);
      } catch (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    }
    
    // Step 3: Apply new schema migration
    console.log('\n🏗️  Step 3: Creating new UUID-based schema...');
    const migrationSQL = fs.readFileSync('supabase/migrations/0000_lovely_paibok.sql', 'utf8');
    
    // Split by statement breakpoints and execute each statement
    const statements = migrationSQL.split('--> statement-breakpoint').filter(stmt => stmt.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await sql.unsafe(statement);
          console.log(`   ✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          console.log(`   ❌ Failed statement ${i + 1}: ${error.message}`);
        }
      }
    }
    
    // Step 4: Migrate data with UUID conversion
    console.log('\n📊 Step 4: Migrating data with UUID conversion...');
    
    // Create ID mapping for referential integrity
    const idMap = {};
    
    // Migrate base tables first (no dependencies)
    if (backupData.categories?.length > 0) {
      console.log('   📂 Migrating categories...');
      for (const cat of backupData.categories) {
        const newUuid = crypto.randomUUID();
        idMap[`categories_${cat.id}`] = newUuid;
        
        await sql`
          INSERT INTO categories (id, name, slug, description, "imageURL", "showInMenu", created_at)
          VALUES (${newUuid}, ${cat.name}, ${cat.slug}, ${cat.description}, 
                  ${cat.imageURL}, ${cat.showInMenu}, ${cat.created_at})
        `;
      }
      console.log(`   ✅ Migrated ${backupData.categories.length} categories`);
    }
    
    if (backupData.brands?.length > 0) {
      console.log('   🏷️  Migrating brands...');
      for (const brand of backupData.brands) {
        const newUuid = crypto.randomUUID();
        idMap[`brands_${brand.id}`] = newUuid;
        
        await sql`
          INSERT INTO brands (id, name, logo, created_at)
          VALUES (${newUuid}, ${brand.name}, ${brand.logo}, ${brand.created_at})
        `;
      }
      console.log(`   ✅ Migrated ${backupData.brands.length} brands`);
    }
    
    // Migrate products (depends on categories and brands)
    if (backupData.products?.length > 0) {
      console.log('   🛍️  Migrating products...');
      for (const product of backupData.products) {
        const newUuid = crypto.randomUUID();
        idMap[`products_${product.id}`] = newUuid;
        
        const categoryUuid = idMap[`categories_${product.categoryID}`];
        const brandUuid = product.brandID ? idMap[`brands_${product.brandID}`] : null;
        
        await sql`
          INSERT INTO products (id, name, description, "imageURL", "brandID", "categoryID", 
                               "isAvailable", price, "promoPrice", created_at)
          VALUES (${newUuid}, ${product.name}, ${product.description}, ${product.imageURL},
                  ${brandUuid}, ${categoryUuid}, ${product.isAvailable}, 
                  ${product.price}, ${product.promoPrice}, ${product.created_at})
        `;
      }
      console.log(`   ✅ Migrated ${backupData.products.length} products`);
    }
    
    // Migrate other tables...
    const simpleTables = ['about_us_section', 'hero_section', 'showcase_section'];
    for (const tableName of simpleTables) {
      if (backupData[tableName]?.length > 0) {
        console.log(`   📄 Migrating ${tableName}...`);
        for (const record of backupData[tableName]) {
          const newUuid = crypto.randomUUID();
          // Create dynamic insert based on table structure
          const columns = Object.keys(record).filter(k => k !== 'id');
          const values = columns.map(col => record[col]);
          
          const columnNames = ['id', ...columns].map(c => `"${c}"`).join(', ');
          const placeholders = [newUuid, ...values];
          
          await sql.unsafe(`
            INSERT INTO ${tableName} (${columnNames})
            VALUES (${placeholders.map((_, i) => '$' + (i + 1)).join(', ')})
          `, placeholders);
        }
        console.log(`   ✅ Migrated ${backupData[tableName].length} ${tableName} records`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 ID mapping saved for reference: ${backupFile}`);
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

performDataMigration();