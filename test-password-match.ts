import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testPassword() {
  console.log('🔍 Testing password match...\n');
  
  const user = await prisma.user.findUnique({
    where: { email: 'client@nelsyfit.demo' },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    console.log('❌ User not found');
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ User found: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Has Password: ${user.password ? 'YES' : 'NO'}`);
  console.log(`   Password Length: ${user.password?.length || 0}`);
  console.log(`   Password Hash (first 20 chars): ${user.password?.substring(0, 20)}...`);

  if (user.password) {
    const testMatch = await bcrypt.compare('demo', user.password);
    console.log(`\n🔐 Password 'demo' matches: ${testMatch ? '✅ YES' : '❌ NO'}`);
    
    if (!testMatch) {
      console.log('\n⚠️  Password mismatch! Regenerating hash...');
      const newHash = await bcrypt.hash('demo', 10);
      console.log(`   New hash: ${newHash.substring(0, 20)}...`);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
      
      console.log('✅ Password hash updated in database');
      
      // Test again
      const verifyMatch = await bcrypt.compare('demo', newHash);
      console.log(`   Verification: ${verifyMatch ? '✅ Match confirmed' : '❌ Still not matching'}`);
    }
  }

  await prisma.$disconnect();
}

testPassword().catch(console.error);

