import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- 1. Chart of Accounts (6 accounts) ---
  const accounts = await Promise.all([
    prisma.account.upsert({
      where: { name: 'Cash' },
      update: {},
      create: { name: 'Cash', type: 'ASSET', isSeeded: true },
    }),
    prisma.account.upsert({
      where: { name: 'Bank' },
      update: {},
      create: { name: 'Bank', type: 'ASSET', isSeeded: true },
    }),
    prisma.account.upsert({
      where: { name: 'Debtors' },
      update: {},
      create: { name: 'Debtors', type: 'ASSET', isSeeded: true },
    }),
    prisma.account.upsert({
      where: { name: 'Creditors' },
      update: {},
      create: { name: 'Creditors', type: 'LIABILITY', isSeeded: true },
    }),
    prisma.account.upsert({
      where: { name: 'Sales Income' },
      update: {},
      create: { name: 'Sales Income', type: 'INCOME', isSeeded: true },
    }),
    prisma.account.upsert({
      where: { name: 'Purchase Expense' },
      update: {},
      create: { name: 'Purchase Expense', type: 'EXPENSE', isSeeded: true },
    }),
  ]);

  console.log(`  ✅ ${accounts.length} accounts seeded`);

  // Map accounts by name for journal creation
  const accountMap = Object.fromEntries(accounts.map(a => [a.name, a]));

  // --- 2. Journals (4 journals) ---
  const journals = await Promise.all([
    prisma.journal.upsert({
      where: { name: 'Sales Journal' },
      update: {},
      create: { name: 'Sales Journal', type: 'SALES', defaultAccountId: accountMap['Sales Income'].id },
    }),
    prisma.journal.upsert({
      where: { name: 'Purchase Journal' },
      update: {},
      create: { name: 'Purchase Journal', type: 'PURCHASE', defaultAccountId: accountMap['Purchase Expense'].id },
    }),
    prisma.journal.upsert({
      where: { name: 'Bank Journal' },
      update: {},
      create: { name: 'Bank Journal', type: 'BANK', defaultAccountId: accountMap['Bank'].id },
    }),
    prisma.journal.upsert({
      where: { name: 'Cash Journal' },
      update: {},
      create: { name: 'Cash Journal', type: 'CASH', defaultAccountId: accountMap['Cash'].id },
    }),
  ]);

  console.log(`  ✅ ${journals.length} journals seeded`);

  // --- 3. Contacts (2 contacts) ---
  const contacts = await Promise.all([
    prisma.contact.upsert({
      where: { id: 'vendor-rahul-sharma' },
      update: {},
      create: {
        id: 'vendor-rahul-sharma',
        name: 'Rahul Sharma',
        type: 'VENDOR',
        email: 'rahul@example.com',
        mobile: '9876543210',
        city: 'Mumbai',
        state: 'Maharashtra',
      },
    }),
    prisma.contact.upsert({
      where: { id: 'customer-nimesh-pathak' },
      update: {},
      create: {
        id: 'customer-nimesh-pathak',
        name: 'Nimesh Pathak',
        type: 'CUSTOMER',
        email: 'nimesh@example.com',
        mobile: '9876543211',
        city: 'Pune',
        state: 'Maharashtra',
      },
    }),
  ]);

  console.log(`  ✅ ${contacts.length} contacts seeded`);

  // --- 4. Products (2 products) ---
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'product-wooden-chair' },
      update: {},
      create: {
        id: 'product-wooden-chair',
        name: 'Wooden Chair',
        type: 'GOODS',
        salesPrice: 3500,
        cost: 2000,
        category: 'Furniture',
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-office-chair' },
      update: {},
      create: {
        id: 'product-office-chair',
        name: 'Office Chair',
        type: 'GOODS',
        salesPrice: 4000,
        cost: 2500,
        category: 'Furniture',
      },
    }),
  ]);

  console.log(`  ✅ ${products.length} products seeded`);

  // --- 5. Admin User ---
  const passwordHash = await bcrypt.hash('Demo@1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@urbanfurniture.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@urbanfurniture.com',
      mobile: '9999999999',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`  ✅ Admin user seeded: ${user.email}`);
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
