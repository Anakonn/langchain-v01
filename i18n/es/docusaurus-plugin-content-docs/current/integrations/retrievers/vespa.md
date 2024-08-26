---
translated: true
---

# Vespa

>[Vespa](https://vespa.ai/) es un motor de búsqueda y base de datos de vectores completamente equipado. Admite búsqueda de vectores (ANN), búsqueda léxica y búsqueda en datos estructurados, todo en la misma consulta.

Este cuaderno muestra cómo usar `Vespa.ai` como un recuperador de LangChain.

Para crear un recuperador, usamos [pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) para
crear una conexión a un servicio `Vespa`.

```python
%pip install --upgrade --quiet  pyvespa
```

```python
from vespa.application import Vespa

vespa_app = Vespa(url="https://doc-search.vespa.oath.cloud")
```

Esto crea una conexión a un servicio `Vespa`, aquí el servicio de búsqueda de documentación de Vespa.
Usando el paquete `pyvespa`, también puede conectarse a una
[instancia de Vespa Cloud](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
o a una
[instancia local de Docker](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html).

Después de conectarse al servicio, puede configurar el recuperador:

```python
from langchain_community.retrievers import VespaRetriever

vespa_query_body = {
    "yql": "select content from paragraph where userQuery()",
    "hits": 5,
    "ranking": "documentation",
    "locale": "en-us",
}
vespa_content_field = "content"
retriever = VespaRetriever(vespa_app, vespa_query_body, vespa_content_field)
```

Esto configura un recuperador de LangChain que recupera documentos de la aplicación Vespa.
Aquí, se recuperan hasta 5 resultados del campo `content` en el tipo de documento `paragraph`,
usando `doumentation` como método de clasificación. El `userQuery()` se reemplaza con la consulta real
pasada desde LangChain.

Consulte la [documentación de pyvespa](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query)
para obtener más información.

Ahora puede devolver los resultados y continuar usando los resultados en LangChain.

```python
retriever.invoke("what is vespa?")
```
