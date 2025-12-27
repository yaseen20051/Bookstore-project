// fix_admin.js - Script to fix admin login credentials
const bcrypt = require('bcrypt');
const db = require('./database/connection');

async function fixAdmin() {
    try {
        console.log('🔧 Fixing admin login credentials...');
        
        // Generate a proper bcrypt hash for password 'admin123'
        const password = 'admin123';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        console.log('✅ Generated password hash:', passwordHash);
        console.log('✅ Hash length:', passwordHash.length, '(should be 60)');
        
        // Delete existing admin user if exists
        console.log('🗑️ Removing existing admin user...');
        await db.query('DELETE FROM Admins WHERE username = "admin"');
        
        // Insert new admin user with proper hash
        console.log('➕ Creating new admin user...');
        const [result] = await db.query(
            'INSERT INTO Admins (username, password_hash, email) VALUES (?, ?, ?)',
            ['admin', passwordHash, 'admin@example.com']
        );
        
        console.log('✅ Admin user created successfully!');
        console.log('📋 Admin Credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Admin ID:', result.insertId);
        
        // Verify the user was created
        const [admin] = await db.query('SELECT * FROM Admins WHERE username = "admin"');
        if (admin.length > 0) {
            console.log('✅ Admin user verified in database');
            
            // Test password verification
            const testPassword = await bcrypt.compare('admin123', admin[0].password_hash);
            if (testPassword) {
                console.log('✅ Password verification test passed');
            } else {
                console.log('❌ Password verification test failed');
            }
        }
        
        console.log('🎉 Admin login fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Error fixing admin:', error);
    } finally {
        process.exit(0);
    }
}

// Run the fix
fixAdmin();
