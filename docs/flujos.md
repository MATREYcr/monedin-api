# Flujos

## Flujo del padre
1. Se registra con email + password
2. Crea perfil del niño (username + password) → genera cuenta CHILD vinculada
3. Crea tareas para el niño (título, coins, fecha límite opcional)
4. Crea premios (título, imagen) y los asigna al niño con precio en coins
5. Cuando el niño marca una tarea como completada → aprueba o rechaza
6. Cuando el niño solicita canjear un premio → aprueba o rechaza

## Flujo del niño
1. Inicia sesión con username + password
2. Ve sus tareas pendientes y las marca como completadas
3. Espera aprobación del padre para recibir las coins
4. Explora premios disponibles y solicita canjear uno
5. Espera aprobación del padre para hacer efectivo el canje

## Estados de una tarea
```
PENDING → (niño marca done) → COMPLETED → (padre aprueba) → APPROVED
                                         → (padre rechaza) → PENDING
```

## Estados de una redención
```
PENDING → (padre aprueba) → APPROVED  (coins descontadas del saldo)
        → (padre rechaza) → REJECTED
```
