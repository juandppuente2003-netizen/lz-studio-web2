# LZ Studio — sitio independiente

Sitio público y panel de administración para la galería de LZ Studio. El código es propiedad del negocio y no depende de ChatGPT ni de ChatGPT Sites.

## Arquitectura

- **Next.js**: página pública y panel `/admin`.
- **Supabase**: usuarios, PostgreSQL y almacenamiento de fotografías.
- **GitHub**: repositorio fuente y control de versiones.
- **Vercel**: publicación automática desde GitHub y dominio personalizado.

Todos los componentes son sustituibles. Next.js puede alojarse en otro proveedor y Supabase puede migrarse o autoalojarse.

## Requisitos

- Node.js 20.9 o superior.
- Cuenta de GitHub.
- Proyecto de Supabase.
- Cuenta de Vercel para la publicación recomendada.

## Instalación local

1. Copia `.env.example` como `.env.local`.
2. En Supabase, abre **Project Settings > API** y coloca la URL y la llave publicable en `.env.local`.
3. Ejecuta `supabase/schema.sql` en **Supabase > SQL Editor**.
4. Instala las dependencias con `npm install`.
5. Inicia el proyecto con `npm run dev`.
6. Abre `http://localhost:3000`.

## Crear el administrador

1. En Supabase abre **Authentication > Users > Add user**.
2. Crea el usuario con el correo y contraseña del propietario.
3. En **SQL Editor** ejecuta:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'correo-del-administrador@dominio.com'
on conflict (user_id) do nothing;
```

El panel quedará disponible en `/admin`. No existe registro público de usuarios.

## Publicar desde GitHub en Vercel

1. Sube este proyecto a un repositorio privado de GitHub.
2. En Vercel selecciona **Add New > Project** e importa el repositorio.
3. Agrega las dos variables de `.env.example` en **Project Settings > Environment Variables**.
4. Pulsa **Deploy**.
5. Cada cambio enviado a la rama principal de GitHub producirá una nueva publicación automática.

## Dominio personalizado

En Vercel abre **Project Settings > Domains**, agrega el dominio y configura los registros DNS que indique Vercel. El certificado HTTPS se genera automáticamente después de validar el dominio.

## Entrega a un cliente

Transfiere o comparte estos cuatro elementos:

1. Repositorio de GitHub.
2. Proyecto de Vercel.
3. Proyecto de Supabase.
4. Cuenta del registrador del dominio.

El correo empresarial se contrata por separado con Google Workspace, Microsoft 365, Zoho u otro proveedor y se conecta mediante registros DNS del dominio.

## Seguridad y respaldos

- No subas `.env.local` ni contraseñas a GitHub.
- La base de datos usa Row Level Security: el público solo lee imágenes visibles y únicamente usuarios registrados en `admins` pueden modificar contenido.
- Las fotografías aceptadas son JPG, PNG y WebP de hasta 10 MB.
- Conserva respaldos periódicos de la base de datos y del bucket `gallery`.
