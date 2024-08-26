---
translated: true
---

# RAG con Vector de Escala de Tiempo usando búsqueda híbrida

Esta plantilla muestra cómo usar timescale-vector con el recuperador de consulta propia para realizar una búsqueda híbrida de similitud y tiempo.
Esto es útil siempre que sus datos tengan un componente de tiempo fuerte. Algunos ejemplos de este tipo de datos son:
- Artículos de noticias (política, negocios, etc.)
- Publicaciones de blog, documentación u otro material publicado (público o privado).
- Publicaciones en redes sociales
- Registros de cambios de cualquier tipo
- Mensajes

Estos elementos a menudo se buscan tanto por similitud como por tiempo. Por ejemplo: Muéstrame todas las noticias sobre camionetas Toyota de 2022.

[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) proporciona un rendimiento superior al buscar incrustaciones dentro de un marco de tiempo determinado al aprovechar el particionamiento automático de tablas para aislar los datos de los rangos de tiempo específicos.

El recuperador de consulta propia de Langchain permite deducir los rangos de tiempo (así como otros criterios de búsqueda) a partir del texto de las consultas de los usuarios.

## ¿Qué es Timescale Vector?

**[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) es PostgreSQL++ para aplicaciones de IA.**

Timescale Vector le permite almacenar y consultar de manera eficiente miles de millones de incrustaciones vectoriales en `PostgreSQL`.
- Mejora `pgvector` con una búsqueda de similitud más rápida y precisa en 1000 millones+ de vectores a través del algoritmo de indexación inspirado en DiskANN.
- Permite una búsqueda rápida de vectores basada en el tiempo a través del particionamiento y la indexación automáticos basados en el tiempo.
- Proporciona una interfaz SQL familiar para consultar incrustaciones vectoriales y datos relacionales.

Timescale Vector es PostgreSQL en la nube para IA que se escala con usted desde el POC hasta la producción:
- Simplifica las operaciones al permitirle almacenar metadatos relacionales, incrustaciones vectoriales y datos de series temporales en una sola base de datos.
- Se beneficia de la sólida base de PostgreSQL con funciones empresariales como copias de seguridad y replicación en streaming, alta disponibilidad y seguridad a nivel de fila.
- Permite una experiencia sin preocupaciones con seguridad y cumplimiento empresarial.

### Cómo acceder a Timescale Vector

Timescale Vector está disponible en [Timescale](https://www.timescale.com/products?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral), la plataforma PostgreSQL en la nube. (No hay versión de autoalojamiento por el momento).

- Los usuarios de LangChain obtienen un período de prueba gratuito de 90 días para Timescale Vector.
- Para comenzar, [regístrese](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) en Timescale, cree una nueva base de datos y ¡siga este cuaderno!
- Consulte las [instrucciones de instalación](https://github.com/timescale/python-vector) para obtener más detalles sobre el uso de Timescale Vector en Python.

## Configuración del entorno

Esta plantilla usa Timescale Vector como un almacén de vectores y requiere que `TIMESCALES_SERVICE_URL`. Regístrese para obtener una prueba gratuita de 90 días [aquí](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) si aún no tiene una cuenta.

Para cargar el conjunto de datos de muestra, establezca `LOAD_SAMPLE_DATA=1`. Para cargar su propio conjunto de datos, consulte la sección a continuación.

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-timescale-hybrid-search-time
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-timescale-hybrid-search-time
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_timescale_hybrid_search.chain import chain as rag_timescale_hybrid_search_chain

add_routes(app, rag_timescale_hybrid_search_chain, path="/rag-timescale-hybrid-search")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-timescale-hybrid-search/playground](http://127.0.0.1:8000/rag-timescale-hybrid-search/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-hybrid-search")
```

## Carga de su propio conjunto de datos

Para cargar su propio conjunto de datos, deberá modificar el código en la sección `DATASET SPECIFIC CODE` de `chain.py`.
Este código define el nombre de la colección, cómo cargar los datos y la descripción en lenguaje humano tanto del
contenido de la colección como de todos los metadatos. Las descripciones en lenguaje humano son utilizadas por el recuperador de consulta propia
para ayudar al LLM a convertir la pregunta en filtros sobre los metadatos al buscar los datos en Timescale-vector.
