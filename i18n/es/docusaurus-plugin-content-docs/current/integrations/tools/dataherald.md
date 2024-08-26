---
translated: true
---

# Dataherald

Este cuaderno explica cómo usar el componente dataherald.

Primero, debes configurar tu cuenta de Dataherald y obtener tu CLAVE API:

1. Ve a dataherald y regístrate [aquí](https://www.dataherald.com/)
2. Una vez que hayas iniciado sesión en tu Consola de Administración, crea una CLAVE API
3. pip install dataherald

Luego, necesitaremos establecer algunas variables de entorno:
1. Guarda tu CLAVE API en la variable de entorno DATAHERALD_API_KEY

```python
pip install dataherald
```

```python
import os

os.environ["DATAHERALD_API_KEY"] = ""
```

```python
from langchain_community.utilities.dataherald import DataheraldAPIWrapper
```

```python
dataherald = DataheraldAPIWrapper(db_connection_id="65fb766367dd22c99ce1a12d")
```

```python
dataherald.run("How many employees are in the company?")
```

```output
'select COUNT(*) from employees'
```
