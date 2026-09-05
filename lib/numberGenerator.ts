import { prisma } from './db';

/**
 * Auto-generates sequential numbers for POs, Bills, SOs, and Invoices.
 * Format: PREFIX-NNNN (e.g., PO-0001, BILL-0001, SO-0001, INV-0001)
 */

async function getNextNumber(prefix: string, model: 'purchaseOrder' | 'vendorBill' | 'salesOrder' | 'customerInvoice'): Promise<string> {
  let count = 0;

  switch (model) {
    case 'purchaseOrder':
      count = await prisma.purchaseOrder.count();
      break;
    case 'vendorBill':
      count = await prisma.vendorBill.count();
      break;
    case 'salesOrder':
      count = await prisma.salesOrder.count();
      break;
    case 'customerInvoice':
      count = await prisma.customerInvoice.count();
      break;
  }

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

export async function generatePONumber(): Promise<string> {
  return getNextNumber('PO', 'purchaseOrder');
}

export async function generateBillNumber(): Promise<string> {
  return getNextNumber('BILL', 'vendorBill');
}

export async function generateSONumber(): Promise<string> {
  return getNextNumber('SO', 'salesOrder');
}

export async function generateInvoiceNumber(): Promise<string> {
  return getNextNumber('INV', 'customerInvoice');
}
