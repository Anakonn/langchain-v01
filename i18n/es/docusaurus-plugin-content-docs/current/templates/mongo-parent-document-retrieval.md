---
translated: true
---

# Recuperación de documentos principales de mongo

Esta plantilla realiza RAG utilizando MongoDB y OpenAI.
Realiza una forma más avanzada de RAG llamada Recuperación de documentos principales.

En esta forma de recuperación, primero se divide un documento grande en trozos de tamaño medio.
A partir de ahí, esos trozos de tamaño medio se dividen en trozos pequeños.
Se crean incrustaciones para los trozos pequeños.
Cuando llega una consulta, se crea una incrustación para esa consulta y se compara con los trozos pequeños.
Pero en lugar de pasar los trozos pequeños directamente al LLM para la generación, se pasan los trozos de tamaño medio
de donde provienen los trozos más pequeños.
Esto ayuda a permitir una búsqueda más detallada, pero luego la transmisión de un contexto más amplio (que puede ser útil durante la generación).

## Configuración del entorno

Debe exportar dos variables de entorno, una siendo su URI de MongoDB, la otra siendo su CLAVE API de OpenAI.
Si no tiene un URI de MongoDB, consulte la sección `Configurar Mongo` al final para obtener instrucciones sobre cómo hacerlo.

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package mongo-parent-document-retrieval
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add mongo-parent-document-retrieval
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from mongo_parent_document_retrieval import chain as mongo_parent_document_retrieval_chain

add_routes(app, mongo_parent_document_retrieval_chain, path="/mongo-parent-document-retrieval")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si NO tiene un Índice de búsqueda de Mongo al que desee conectarse, consulte la sección `Configuración de MongoDB` a continuación antes de continuar.
Tenga en cuenta que debido a que la Recuperación de documentos principales utiliza una estrategia de indexación diferente, es probable que desee ejecutar esta nueva configuración.

Si tiene un índice de búsqueda de MongoDB al que desea conectarse, edite los detalles de conexión en `mongo_parent_document_retrieval/chain.py`.

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/mongo-parent-document-retrieval/playground](http://127.0.0.1:8000/mongo-parent-document-retrieval/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/mongo-parent-document-retrieval")
```

Para obtener contexto adicional, consulte [este cuaderno](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB).

## Configuración de MongoDB

Utilice este paso si necesita configurar su cuenta de MongoDB e ingerir datos.
Primero seguiremos las instrucciones estándar de configuración de MongoDB Atlas [aquí](https://www.mongodb.com/docs/atlas/getting-started/).

1. Crea una cuenta (si aún no lo has hecho)
2. Crea un nuevo proyecto (si aún no lo has hecho)
3. Ubica tu URI de MongoDB.

Esto se puede hacer yendo a la página de descripción general de la implementación y conectándose a tu base de datos.

Luego miramos los controladores disponibles.

Entre los cuales veremos que se enumera nuestro URI.

Vamos a establecer eso como una variable de entorno local:

```shell
export MONGO_URI=...
```

4. También vamos a establecer una variable de entorno para OpenAI (que usaremos como LLM)

```shell
export OPENAI_API_KEY=...
```

5. ¡Ahora ingresemos algunos datos! Podemos hacer eso moviéndonos a este directorio y ejecutando el código en `ingest.py`, por ejemplo:

```shell
python ingest.py
```

Tenga en cuenta que puede (¡y debe!) cambiar esto para ingerir los datos de su elección.

6. Ahora necesitamos configurar un índice vectorial en nuestros datos.

Primero podemos conectarnos al clúster donde se encuentra nuestra base de datos.

Luego podemos navegar hasta donde se enumeran todas nuestras colecciones.

Luego podemos encontrar la colección que queremos y mirar los índices de búsqueda de esa colección.

Probablemente esté vacío y queremos crear uno nuevo:

Usaremos el editor JSON para crearlo.

Y pegaremos el siguiente JSON:

```text
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "doc_level": [
        {
          "type": "token"
        }
      ],
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```

Desde allí, haga clic en "Siguiente" y luego en "Crear índice de búsqueda". Tomará un poco de tiempo, pero ¡luego debería tener un índice sobre sus datos!
