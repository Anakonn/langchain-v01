---
translated: true
---

# Cargador de Airbyte

>[Airbyte](https://github.com/airbytehq/airbyte) es una plataforma de integración de datos para tuberías ELT desde API, bases de datos y archivos a almacenes de datos y lagos. Tiene el catálogo más grande de conectores ELT a almacenes de datos y bases de datos.

Esto cubre cómo cargar cualquier origen de Airbyte en documentos de LangChain

## Instalación

Para usar `AirbyteLoader` necesitas instalar el paquete de integración `langchain-airbyte`.

```python
% pip install -qU langchain-airbyte
```

Nota: Actualmente, la biblioteca `airbyte` no admite Pydantic v2.
Por favor, degrada a Pydantic v1 para usar este paquete.

Nota: Este paquete también requiere actualmente Python 3.10+.

## Carga de Documentos

De forma predeterminada, `AirbyteLoader` cargará cualquier dato estructurado de un flujo y generará documentos con formato yaml.

```python
from langchain_airbyte import AirbyteLoader

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
)
docs = loader.load()
print(docs[0].page_content[:500])
```

```yaml
academic_degree: PhD
address:
  city: Lauderdale Lakes
  country_code: FI
  postal_code: '75466'
  province: New Jersey
  state: Hawaii
  street_name: Stoneyford
  street_number: '1112'
age: 44
blood_type: "O\u2212"
created_at: '2004-04-02T13:05:27+00:00'
email: bread2099+1@outlook.com
gender: Fluid
height: '1.62'
id: 1
language: Belarusian
name: Moses
nationality: Dutch
occupation: Track Worker
telephone: 1-467-194-2318
title: M.Sc.Tech.
updated_at: '2024-02-27T16:41:01+00:00'
weight: 6
```

También puedes especificar una plantilla de solicitud personalizada para dar formato a los documentos:

```python
from langchain_core.prompts import PromptTemplate

loader_templated = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)
docs_templated = loader_templated.load()
print(docs_templated[0].page_content)
```

```output
My name is Verdie and I am 1.73 meters tall.
```

## Carga Perezosa de Documentos

Una de las características poderosas de `AirbyteLoader` es su capacidad para cargar documentos grandes desde orígenes ascendentes. Cuando se trabaja con conjuntos de datos grandes, el comportamiento predeterminado de `.load()` puede ser lento y consumir mucha memoria. Para evitar esto, puedes usar el método `.lazy_load()` para cargar documentos de una manera más eficiente en términos de memoria.

```python
import time

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

start_time = time.time()
my_iterator = loader.lazy_load()
print(
    f"Just calling lazy load is quick! This took {time.time() - start_time:.4f} seconds"
)
```

```output
Just calling lazy load is quick! This took 0.0001 seconds
```

Y puedes iterar sobre los documentos a medida que se van generando:

```python
for doc in my_iterator:
    print(doc.page_content)
```

```output
My name is Andera and I am 1.91 meters tall.
My name is Jody and I am 1.85 meters tall.
My name is Zonia and I am 1.53 meters tall.
```

También puedes cargar perezosamente los documentos de manera asincrónica con `.alazy_load()`:

```python
loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

my_async_iterator = loader.alazy_load()

async for doc in my_async_iterator:
    print(doc.page_content)
```

```output
My name is Carmelina and I am 1.74 meters tall.
My name is Ali and I am 1.90 meters tall.
My name is Rochell and I am 1.83 meters tall.
```

## Configuración

`AirbyteLoader` se puede configurar con las siguientes opciones:

- `source` (str, requerido): El nombre del origen de Airbyte a cargar.
- `stream` (str, requerido): El nombre del flujo a cargar (los orígenes de Airbyte pueden devolver varios flujos)
- `config` (dict, requerido): La configuración para el origen de Airbyte
- `template` (PromptTemplate, opcional): Una plantilla de solicitud personalizada para dar formato a los documentos
- `include_metadata` (bool, opcional, predeterminado True): Si incluir todos los campos como metadatos en los documentos de salida

La mayor parte de la configuración estará en `config`, y puedes encontrar las opciones de configuración específicas en la "Referencia de campos de configuración" de cada origen en la [documentación de Airbyte](https://docs.airbyte.com/integrations/).
