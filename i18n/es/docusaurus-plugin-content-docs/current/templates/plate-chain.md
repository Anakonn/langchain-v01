---
translated: true
---

# Cadena de placas

Esta plantilla permite el análisis de datos de placas de laboratorio.

En el contexto de la bioquímica o la biología molecular, las placas de laboratorio son herramientas comúnmente utilizadas para mantener muestras en un formato de cuadrícula.

Esto puede analizar los datos resultantes en un formato estandarizado (por ejemplo, JSON) para un procesamiento posterior.

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para utilizar plate-chain, debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Crear un nuevo proyecto de LangChain e instalar plate-chain como el único paquete se puede hacer con:

```shell
langchain app new my-app --package plate-chain
```

Si desea agregar esto a un proyecto existente, simplemente ejecute:

```shell
langchain app add plate-chain
```

Luego agregue el siguiente código a su archivo `server.py`:

```python
from plate_chain import chain as plate_chain

add_routes(app, plate_chain, path="/plate-chain")
```

(Opcional) Para configurar LangSmith, que ayuda a rastrear, monitorear y depurar aplicaciones de LangChain, use el siguiente código:

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está en este directorio, puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto inicia la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Todas las plantillas se pueden ver en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Acceda al área de juegos en [http://127.0.0.1:8000/plate-chain/playground](http://127.0.0.1:8000/plate-chain/playground)

Puede acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/plate-chain")
```
