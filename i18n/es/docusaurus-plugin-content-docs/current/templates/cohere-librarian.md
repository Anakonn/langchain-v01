---
translated: true
---

# cohere-librarian

Esta plantilla convierte a Cohere en un bibliotecario.

Demuestra el uso de un enrutador para cambiar entre cadenas que pueden manejar diferentes cosas: una base de datos de vectores con incrustaciones de Cohere; un chatbot con un mensaje con algo de información sobre la biblioteca; y finalmente un chatbot RAG que tiene acceso a Internet.

Para una demostración más completa de la recomendación de libros, considera reemplazar books_with_blurbs.csv con una muestra más grande del siguiente conjunto de datos: https://www.kaggle.com/datasets/jdobrow/57000-books-with-metadata-and-blurbs/.

## Configuración del entorno

Establece la variable de entorno `COHERE_API_KEY` para acceder a los modelos de Cohere.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package cohere-librarian
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add cohere-librarian
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from cohere_librarian.chain import chain as cohere_librarian_chain

add_routes(app, cohere_librarian_chain, path="/cohere-librarian")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://localhost:8000/docs](http://localhost:8000/docs)
Podemos acceder al playground en [http://localhost:8000/cohere-librarian/playground](http://localhost:8000/cohere-librarian/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cohere-librarian")
```
