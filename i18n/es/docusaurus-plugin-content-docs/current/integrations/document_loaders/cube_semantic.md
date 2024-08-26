---
translated: true
---

# Capa semántica de Cube

Este cuaderno demuestra el proceso de recuperar los metadatos del modelo de datos de Cube en un formato adecuado para pasarlos a LLM como incrustaciones, mejorando así la información contextual.

### Acerca de Cube

[Cube](https://cube.dev/) es la Capa Semántica para construir aplicaciones de datos. Ayuda a los ingenieros de datos y a los desarrolladores de aplicaciones a acceder a los datos de los almacenes de datos modernos, organizarlos en definiciones coherentes y entregarlos a cada aplicación.

El modelo de datos de Cube proporciona estructura y definiciones que se utilizan como contexto para que LLM entienda los datos y genere consultas correctas. LLM no necesita navegar por uniones complejas y cálculos de métricas porque Cube abstrae esos y proporciona una interfaz simple que opera en la terminología a nivel empresarial, en lugar de los nombres de tablas y columnas SQL. Esta simplificación ayuda a LLM a ser menos propenso a errores y a evitar alucinaciones.

### Ejemplo

**Argumentos de entrada (obligatorios)**

`Cube Semantic Loader` requiere 2 argumentos:

- `cube_api_url`: La URL del API REST de implementación de su Cube. Consulte la [documentación de Cube](https://cube.dev/docs/http-api/rest#configuration-base-path) para obtener más información sobre la configuración de la ruta base.

- `cube_api_token`: El token de autenticación generado en función del secreto de la API de su Cube. Consulte la [documentación de Cube](https://cube.dev/docs/security#generating-json-web-tokens-jwt) para obtener instrucciones sobre cómo generar JSON Web Tokens (JWT).

**Argumentos de entrada (opcionales)**

- `load_dimension_values`: Si se deben cargar o no los valores de dimensión para cada dimensión de cadena.

- `dimension_values_limit`: Número máximo de valores de dimensión a cargar.

- `dimension_values_max_retries`: Número máximo de reintentos para cargar los valores de dimensión.

- `dimension_values_retry_delay`: Retraso entre reintentos para cargar los valores de dimensión.

```python
import jwt
from langchain_community.document_loaders import CubeSemanticLoader

api_url = "https://api-example.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1/meta"
cubejs_api_secret = "api-secret-here"
security_context = {}
# Read more about security context here: https://cube.dev/docs/security
api_token = jwt.encode(security_context, cubejs_api_secret, algorithm="HS256")

loader = CubeSemanticLoader(api_url, api_token)

documents = loader.load()
```

Devuelve una lista de documentos con los siguientes atributos:

- `page_content`
- `metadata`
  - `table_name`
  - `column_name`
  - `column_data_type`
  - `column_title`
  - `column_description`
  - `column_values`
  - `cube_data_obj_type`

```python
# Given string containing page content
page_content = "Users View City, None"

# Given dictionary containing metadata
metadata = {
    "table_name": "users_view",
    "column_name": "users_view.city",
    "column_data_type": "string",
    "column_title": "Users View City",
    "column_description": "None",
    "column_member_type": "dimension",
    "column_values": [
        "Austin",
        "Chicago",
        "Los Angeles",
        "Mountain View",
        "New York",
        "Palo Alto",
        "San Francisco",
        "Seattle",
    ],
    "cube_data_obj_type": "view",
}
```
