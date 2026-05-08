# Auth — Better Auth + Roles

## Dos tipos de usuario
| Tipo | Login | Creación |
|---|---|---|
| PARENT | email + password | Se registra solo |
| CHILD | username + password | Solo el padre crea vía `POST /children` |

## Sesión
- Better Auth maneja sesiones via cookies (`credentials: true` en CORS)
- `AuthGuard` valida cada request automáticamente
- Usuario autenticado disponible con `@CurrentUser()` en cualquier handler

## Separación de acceso
- PARENT: solo puede ver/modificar datos de sus propios hijos (`parentId === currentUser.id`)
- CHILD: solo puede ver/modificar sus propios datos (`userId === currentUser.id`)
- Validar esto en el Service, no en el Controller

## Modelo de datos
```
User.familyRole: PARENT | CHILD
User.email        → solo PARENT
User.username     → solo CHILD
ChildProfile.parentId  → FK al User padre
ChildProfile.coins     → saldo de monedas del niño
```
