---
translated: true
---

# rag-mongo

Esta plantilla realiza RAG utilizando MongoDB y OpenAI.

## Configuración del entorno

Debe exportar dos variables de entorno, una siendo su URI de MongoDB y la otra siendo su CLAVE API de OpenAI.
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
langchain app new my-app --package rag-mongo
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-mongo
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_mongo import chain as rag_mongo_chain

add_routes(app, rag_mongo_chain, path="/rag-mongo")
```

Si desea configurar una canalización de ingesta, puede agregar el siguiente código a su archivo `server.py`:

```python
from rag_mongo import ingest as rag_mongo_ingest

add_routes(app, rag_mongo_ingest, path="/rag-mongo-ingest")
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

Si NO tiene un índice de búsqueda de MongoDB al que desee conectarse, consulte la sección `Configuración de MongoDB` a continuación antes de continuar.

Si tiene un índice de búsqueda de MongoDB al que desea conectarse, edite los detalles de conexión en `rag_mongo/chain.py`.

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-mongo/playground](http://127.0.0.1:8000/rag-mongo/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-mongo")
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

6. Ahora necesitamos configurar un índice de vector en nuestros datos.

Primero podemos conectarnos al clúster donde se encuentra nuestra base de datos.

Luego navegamos a donde se enumeran todas nuestras colecciones.

Luego encontramos la colección que queremos y miramos los índices de búsqueda de esa colección.

Probablemente esté vacío y queremos crear uno nuevo:

Usaremos el editor JSON para crearlo.

Y pegaremos el siguiente JSON:

```text
 {
   "mappings": {
     "dynamic": true,
     "fields": {
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
