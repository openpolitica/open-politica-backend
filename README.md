# open-politica-backend

Backend del Proyecto Open Política construido en Node.js

## Instrucciones para ambientes de desarrollo

1. Crear dev.js localmente con _connection string_ a BD

`src/config/dev.js`

```
module.exports = {
  mongoURI:
    "mongodb+srv://...",
};
```

2. Lanzar script

`npm run dev`
