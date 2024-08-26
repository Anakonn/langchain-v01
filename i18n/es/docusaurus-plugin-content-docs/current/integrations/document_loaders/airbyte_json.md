---
translated: true
---

# Airbyte JSON (Obsoleto)

Nota: `AirbyteJSONLoader` está obsoleto. Por favor, use [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) en su lugar.

>[Airbyte](https://github.com/airbytehq/airbyte) es una plataforma de integración de datos para tuberías ELT desde API, bases de datos y archivos a almacenes de datos y lagos. Tiene el catálogo más grande de conectores ELT a almacenes de datos y bases de datos.

Esto cubre cómo cargar cualquier origen de Airbyte en un archivo JSON local que se pueda leer como un documento.

Requisitos previos:
Tener instalado Docker Desktop

Pasos:

1) Clonar Airbyte de GitHub - `git clone https://github.com/airbytehq/airbyte.git`

2) Cambiar al directorio de Airbyte - `cd airbyte`

3) Iniciar Airbyte - `docker compose up`

4) En tu navegador, visita http://localhost:8000. Se te pedirá un nombre de usuario y una contraseña. De forma predeterminada, ese es el usuario `airbyte` y la contraseña `password`.

5) Configurar cualquier origen que desees.

6) Establecer el destino como JSON local, con la ruta de destino especificada - digamos `/json_data`. Configurar la sincronización manual.

7) Ejecutar la conexión.

7) Para ver qué archivos se han creado, puedes navegar a: `file:///tmp/airbyte_local`

8) Encuentra tus datos y copia la ruta. Esa ruta debe guardarse en la variable de archivo a continuación. Debe comenzar con `/tmp/airbyte_local`

```python
from langchain_community.document_loaders import AirbyteJSONLoader
```

```python
!ls /tmp/airbyte_local/json_data/
```

```output
_airbyte_raw_pokemon.jsonl
```

```python
loader = AirbyteJSONLoader("/tmp/airbyte_local/json_data/_airbyte_raw_pokemon.jsonl")
```

```python
data = loader.load()
```

```python
print(data[0].page_content[:500])
```

```output
abilities:
ability:
name: blaze
url: https://pokeapi.co/api/v2/ability/66/

is_hidden: False
slot: 1


ability:
name: solar-power
url: https://pokeapi.co/api/v2/ability/94/

is_hidden: True
slot: 3

base_experience: 267
forms:
name: charizard
url: https://pokeapi.co/api/v2/pokemon-form/6/

game_indices:
game_index: 180
version:
name: red
url: https://pokeapi.co/api/v2/version/1/



game_index: 180
version:
name: blue
url: https://pokeapi.co/api/v2/version/2/



game_index: 180
version:
n
```
