import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  // Usuario admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@cheil.pe' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@cheil.pe',
      password: hashedPassword,
      rol: 'admin',
    },
  });
  console.log('✓ Usuario creado:', usuario.email);

  // Categorías
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nombre: 'Electrónica' },
      update: {},
      create: {
        nombre: 'Electrónica',
        descripcion: 'Dispositivos electrónicos',
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Ropa' },
      update: {},
      create: { nombre: 'Ropa', descripcion: 'Prendas de vestir' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Hogar' },
      update: {},
      create: { nombre: 'Hogar', descripcion: 'Artículos para el hogar' },
    }),
  ]);
  console.log(
    '✓ Categorías creadas:',
    categorias.map((c) => c.nombre).join(', '),
  );

  // Productos
  const productos = await Promise.all([
    prisma.producto.upsert({
      where: { nombre: 'Laptop HP 15"' },
      update: {},
      create: {
        nombre: 'Laptop HP 15"',
        descripcion: 'Laptop con procesador Intel Core i5',
        precio: 2500.0,
        stock: 10,
        categoriaId: categorias[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { nombre: 'Polo básico blanco' },
      update: {},
      create: {
        nombre: 'Polo básico blanco',
        descripcion: 'Polo de algodón 100%',
        precio: 45.0,
        stock: 50,
        categoriaId: categorias[1].id,
      },
    }),
    prisma.producto.upsert({
      where: { nombre: 'Silla de oficina' },
      update: {},
      create: {
        nombre: 'Silla de oficina',
        descripcion: 'Silla ergonómica con soporte lumbar',
        precio: 350.0,
        stock: 5,
        categoriaId: categorias[2].id,
      },
    }),
  ]);
  console.log(
    '✓ Productos creados:',
    productos.map((p) => p.nombre).join(', '),
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
