import { db, doc, setDoc } from '../src/firebaseConfig.js';
import { INITIAL_TENANTS } from '../src/data/multiTenantData.js';
import { formatAliadoDoc } from '../src/services/aliadosService.js';

const DEMO_USER_DOCS = [
  {
    uid: 'owner-rest-1',
    name: 'Camilo Andrés Gómez',
    email: 'camilo.owner@milenia.co',
    restaurantId: '1',
    role: 'OWNER',
    position: 'Propietario General',
    phone: '+57 304-347-0984',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'staff-rest-1-101',
    name: 'Mateo Morales',
    email: 'mateo.pos@milenia.co',
    restaurantId: '1',
    role: 'STAFF',
    employeeId: '101',
    documentId: '101',
    position: 'Capitán de Meseros',
    phone: '+57 304-347-0984',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'owner-rest-5',
    name: 'Miguel Ángel Valderrama',
    email: 'miguel.owner@milenia.co',
    restaurantId: '5',
    role: 'OWNER',
    position: 'Propietario & Director General',
    phone: '+57 304-347-0984',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'staff-rest-3-12345',
    name: 'Alejandro Restrepo V.',
    email: 'alejandro.cajero@milenia.co',
    restaurantId: '3',
    role: 'STAFF',
    employeeId: '12345',
    documentId: '12345',
    position: 'Cajero Principal & Turno POS',
    phone: '+57 304-347-0984',
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  console.log(`Poblando la colección /aliados en Firestore...`);
  for (const tenant of INITIAL_TENANTS) {
    const formatted = formatAliadoDoc(tenant);
    console.log(`Insertando aliado: ${tenant.name} (id: ${tenant.id})...`);
    await setDoc(doc(db, 'aliados', String(tenant.id)), formatted, { merge: true });
  }

  console.log(`Poblando la colección /users en Firestore para RBAC...`);
  for (const u of DEMO_USER_DOCS) {
    console.log(`Insertando usuario: ${u.name} (rol: ${u.role}, restId: ${u.restaurantId})...`);
    await setDoc(doc(db, 'users', u.uid), u, { merge: true });
  }

  console.log('¡Colecciones /aliados y /users creadas y pobladas exitosamente en Firestore!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding Firestore:', err);
  process.exit(1);
});
