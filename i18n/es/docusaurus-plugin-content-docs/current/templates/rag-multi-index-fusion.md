---
translated: true
---

# RAG con Múltiples Índices (Fusión)

Una aplicación de QA que consulta múltiples recuperadores específicos de dominio y selecciona los documentos más relevantes de todos los resultados recuperados.

## Configuración del Entorno

Esta aplicación consulta PubMed, ArXiv, Wikipedia y [Kay AI](https://www.kay.ai) (para archivos SEC).

Deberá crear una cuenta gratuita en Kay AI y [obtener su clave API aquí](https://www.kay.ai).
Luego, establezca la variable de entorno:

```bash
export KAY_API_KEY="<YOUR_API_KEY>"
```

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-multi-index-fusion
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-multi-index-fusion
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_multi_index_fusion import chain as rag_multi_index_fusion_chain

add_routes(app, rag_multi_index_fusion_chain, path="/rag-multi-index-fusion")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-multi-index-fusion/playground](http://127.0.0.1:8000/rag-multi-index-fusion/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-index-fusion")
```
