# Hito 1 · ¿Qué dato de nuestro emprendimiento va a NoSQL?

**Grupo:** G02  **Emprendimiento:** KromaEvents (catálogo de eventos y reserva de cupos)

| Dato | ¿Por qué no encaja bien en una tabla? | Tipo NoSQL | Razón |
|---|---|---|---|
| Agenda o programa de cada evento (actividades por hora, ponentes o artistas, etiquetas) | Cada tipo de evento trae campos distintos: un concierto tiene artistas y repertorio, un taller tiene materiales y nivel, una feria tiene stands. En SQL serían muchas columnas vacías o varias tablas extra que siempre se consultan juntas. | Documental | La agenda se lee completa en una sola consulta (la página del evento) y cada documento puede tener su propia forma, con las actividades embebidas en un arreglo. |
| Registro de accesos en la puerta (escaneo de entradas: reserva, hora, puerta, dispositivo) | Crece sin límite: cada asistente genera uno o varios registros por evento y casi nunca se actualizan, solo se agregan y se cuentan por hora. | Columnar | Muchas escrituras por segundo durante el ingreso y lecturas por rangos de tiempo para reportes; una base columnar (Cassandra) guarda y resume series de tiempo mejor que una tabla con índices. |
| Cupos disponibles "en vivo" y carrito temporal de reserva (expira a los 10 minutos) | Es un dato de vida corta que se lee y se cambia en cada visita; guardarlo en PostgreSQL llenaría la base de filas temporales que luego hay que borrar. | Clave-valor | Se busca siempre por una clave (`evento:4:cupos`, `carrito:<userId>`), necesita respuestas en milisegundos y caducidad automática (TTL), justo lo que ofrece Redis. |

**Colección elegida:** `agendas` (documental, MongoDB)

```json
{
  "_id": "6af896924edbe3384b76d9bd",
  "eventoId": 4,
  "titulo": "Programa Noche de Jazz",
  "tipo": "concierto",
  "edadMinima": 18,
  "contacto": "jazz@kromaevents.com",
  "actividades": [
    { "hora": "19:00", "titulo": "Apertura de puertas" },
    { "hora": "20:00", "titulo": "Cuarteto Kroma", "ponenteId": "6af8a0c14edbe3384b76d9c1" },
    { "hora": "21:30", "titulo": "Cierre con jam session" }
  ],
  "etiquetas": ["jazz", "música en vivo"],
  "createdAt": "2026-11-14T17:12:50.739Z",
  "updatedAt": "2026-11-14T17:12:50.739Z"
}
```

`eventoId` es el `id` del evento en PostgreSQL: MongoDB solo guarda la referencia, no copia el nombre, la fecha ni el precio.

**Se queda en PostgreSQL:** usuarios, clientes, eventos (nombre, fecha, lugar, capacidad, cupos y precio), reservas con su historial, reseñas y categorías. Son datos con estructura fija, relaciones con claves foráneas (1:1, 1:N, N:M) y operaciones que necesitan transacciones ACID: reservar descuenta cupos y crea la reserva en una sola `$transaction`, y no se puede vender un cupo dos veces ni borrar un evento con reservas. Eso lo garantiza PostgreSQL con Prisma y no conviene moverlo.
