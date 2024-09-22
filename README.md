# Proyecto  API de Hotel

Esta es una API de un hotel sencilla construida utilizando Node.JS. Esta API te permite crear, actualizar, ver y eliminar reservaciones, clientes y habitaciones del hotel

## Tabla de Contenidos
- [Proyecto  API de Hotel](#proyecto--api-de-hotel)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Características](#características)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación](#instalación)
  - [Uso](#uso)
    - [Ejecutar el Servidor Backend](#ejecutar-el-servidor-backend)
  - [Tecnologías](#tecnologías)
  - [Endpoints de la API](#endpoints-de-la-api)
  - [Contribuyendo](#contribuyendo)

## Características

- **Reservaciones:**
- Crear nuevas reservaciones con ID de cliente, ID de habitacion, fecha de llegada y fecha de salida
- Ver una lista de todas las reservaciones.
- Eliminar reservaciones de la lista.
- Actualizar datos de la reservacion
- Filtrar por fecha de llegada, fecha de salida,ID de cliente e ID de habitacion
- **Clientes:**
- Agregar nuevos clientes con nombre, telefono y  correo electronico
- Ver una lista de todos los clientes
- Eliminar clientes de la lista
- Actualizar datos del cliente
- Filtrar por nombre, telefono y email
- **Habitaciones:**
- Crear nuevas habitaciones con numero, tipo, descripcion, precio por noche y disponibilidad
- Ver una lista de todas las habitaciones
- Eliminar habitaciones de la lista
- Actualizar datos de la habitacion
- Filtrar por tipo, descripcion, disponibilidad, precio y numero

## Requisitos Previos

Antes de comenzar, asegúrate de cumplir con los siguientes requisitos:

- Tener Node.js y pnpm instalados en tu máquina.
- Tener MongoDB instalado y en funcionamiento.

## Instalación

1. Clona el repositorio:
    ```sh
    git clone https://github.com/coloco0954/hotel-api/
    ```

2. Navega al directorio del proyecto:
    ```sh
    cd hotel-api
    ```

3. Instala las dependencias:
    ```sh
    pnpm install
    ```

## Uso

### Ejecutar el Servidor Backend

1. Crea un archivo `.env` y añade tu cadena de conexión de MongoDB:
    ```env
    MONGODB_URI=tu_cadena_de_conexión_de_mongodb
    ```
2. En el archivo `.env` añade el puerto en el que quieres que se ejecute la aplicacion
   ```env
   PORT=tu_puerto
   ```

3. Inicia el servidor backend:
    ```sh
    pnpm run dev
    ```

   El servidor backend se ejecutará en `http://localhost:3001`.

## Tecnologías

- Backend: Node.js, Express, Mongoose
- Validaciones: Express-validator
- Base de Datos: MongoDB

## Endpoints de la API

Para revisar los endpoints de la API, consulta los archivos en la carpeta `requests/api`.

## Contribuyendo

¡Las contribuciones son siempre bienvenidas! Por favor, sigue estos pasos para contribuir:

1. Haz un fork del repositorio.
2. Crea tu rama de característica:
    ```sh
    git checkout -b feature/TuCaracteristica
    ```
3. Realiza tus cambios y haz un commit:
    ```sh
    git commit -m 'Agrega una característica'
    ```
4. Empuja a la rama:
    ```sh
    git push origin feature/TuCaracteristica
    ```
5. Abre un pull request.
