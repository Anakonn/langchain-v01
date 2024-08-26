---
translated: true
---

# rag-gpt-crawler

GPT-crawler crawleará sitios web para producir archivos para usar en GPTs personalizados u otras aplicaciones (RAG).

Esta plantilla usa [gpt-crawler](https://github.com/BuilderIO/gpt-crawler) para construir una aplicación RAG

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Rastreo

Ejecuta GPT-crawler para extraer contenido de un conjunto de URLs, usando el archivo de configuración en el repositorio de GPT-crawler.

Aquí hay un ejemplo de configuración para el caso de uso de la documentación de LangChain:

```javascript
export const config: Config = {
  url: "https://python.langchain.com/docs/use_cases/",
  match: "https://python.langchain.com/docs/use_cases/**",
  selector: ".docMainContainer_gTbr",
  maxPagesToCrawl: 10,
  outputFileName: "output.json",
};
```

Luego, ejecútalo como se describe en el [gpt-crawler](https://github.com/BuilderIO/gpt-crawler) README:

```shell
npm start
```

Y copia el archivo `output.json` en la carpeta que contiene este README.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalarlo como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-gpt-crawler
```

Si quieres agregarlo a un proyecto existente, puedes ejecutar:

```shell
langchain app add rag-gpt-crawler
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_chroma import chain as rag_gpt_crawler

add_routes(app, rag_gpt_crawler, path="/rag-gpt-crawler")
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

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-gpt-crawler/playground](http://127.0.0.1:8000/rag-gpt-crawler/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-gpt-crawler")
```
