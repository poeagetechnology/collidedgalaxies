// export-firestore-to-shiprocket-csv-client.js
// Node.js script to export Firestore products/variants to Shiprocket-compatible CSV using Firebase client SDK
// Usage: node scripts/export-firestore-to-shiprocket-csv-client.js
// NOTE: Your Firestore rules must allow public read access to the products collection for this to work!

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Firebase public config (from .env)
const firebaseConfig = {
  apiKey: 'AIzaSyB0EauSBfzLcvzuwPlel55wXQSVfj89P3Y',
  authDomain: 'coga-670f5.firebaseapp.com',
  projectId: 'coga-670f5',
  storageBucket: 'coga-670f5.firebasestorage.app',
  messagingSenderId: '521411021199',
  appId: '1:521411021199:web:d436758790f48c0004e3fa',
  measurementId: 'G-7TT62HXKQP',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const csvHeader = [
  'Product Name',
  'SKU',
  'Parent SKU',
  'Brand',
  'Category',
  'Description',
  'MRP',
  'Selling Price',
  'Stock',
  'Length (cm)',
  'Breadth (cm)',
  'Height (cm)',
  'Weight (kg)',
  'HSN',
  'EAN/UPC',
  'Image URL',
  'Variant',
  'Variant Value',
  'Product ID',
  'Variant ID',
];

function escapeCsv(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function exportToCsv() {
  const productsSnap = await getDocs(collection(db, 'products'));
  const rows = [csvHeader];

  productsSnap.forEach(doc => {
    const product = doc.data();
    const productId = product.numericId || '';
    const brand = product.brand || '';
    const category = product.category || '';
    const description = product.description || '';
    const hsn = product.hsn || '';
    const parentSku = product.parentSku || '';
    const length = product.length || '';
    const breadth = product.breadth || '';
    const height = product.height || '';
    const variants = product.variants || [];

    for (const variant of variants) {
      const row = [
        escapeCsv(product.title || ''),
        escapeCsv(variant.sku || ''),
        escapeCsv(parentSku),
        escapeCsv(brand),
        escapeCsv(category),
        escapeCsv(description),
        escapeCsv(variant.price || ''),
        escapeCsv(variant.price || ''),
        escapeCsv(variant.quantity || ''),
        escapeCsv(length),
        escapeCsv(breadth),
        escapeCsv(height),
        escapeCsv(variant.weight || ''),
        escapeCsv(hsn),
        '',
        escapeCsv(variant.image || ''),
        'Size',
        escapeCsv(variant.size || ''),
        escapeCsv(productId),
        escapeCsv(variant.numericId || ''),
      ];
      rows.push(row);
    }
  });

  const csvContent = rows.map(r => r.join(',')).join('\n');
  const outPath = path.join(process.cwd(), 'shiprocket-products-export.csv');
  fs.writeFileSync(outPath, csvContent, 'utf8');
  console.log(`Exported ${rows.length - 1} variants to ${outPath}`);
}

exportToCsv().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
