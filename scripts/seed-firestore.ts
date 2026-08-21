import { db, collection, doc, setDoc } from '../src/firebaseConfig.js';
import { INITIAL_TENANTS } from '../src/data/multiTenantData.js';
import { formatAliadoDoc } from '../src/services/aliadosService.js';

async function seed() {
  console.log(`Poblando la colección /aliados en Firestore...`);
  for (const tenant of INITIAL_TENANTS) {
    const formatted = formatAliadoDoc(tenant);
    console.log(`Insertando aliado: ${tenant.name} (id: ${tenant.id})...`);
    await setDoc(doc(db, 'aliados', String(tenant.id)), formatted);
  }
  console.log('¡Colección /aliados creada y poblada exitosamente en Firestore!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding /aliados:', err);
  process.exit(1);
});
