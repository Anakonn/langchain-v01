---
translated: true
---

# Ejemplo RAG en Intel Xeon

Esta plantilla realiza RAG utilizando Chroma y Text Generation Inference en los procesadores Intel® Xeon® Scalable.
Los procesadores Intel® Xeon® Scalable cuentan con aceleradores integrados para un mejor rendimiento por núcleo y un rendimiento de IA inigualable, con tecnologías de seguridad avanzadas para los requisitos de carga de trabajo más demandados, todo ello ofreciendo la mayor elección de la nube y portabilidad de aplicaciones, por favor, consulte [Intel® Xeon® Scalable Processors](https://www.intel.com/content/www/us/en/products/details/processors/xeon/scalable.html).

## Configuración del entorno

Para usar [🤗 text-generation-inference](https://github.com/huggingface/text-generation-inference) en los procesadores Intel® Xeon® Scalable, siga estos pasos:

### Inicie una instancia de servidor local en el servidor Intel Xeon:

```bash
model=Intel/neural-chat-7b-v3-3
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --shm-size 1g -p 8080:80 -v $volume:/data ghcr.io/huggingface/text-generation-inference:1.4 --model-id $model
```

Para modelos con puerta de enlace como `LLAMA-2`, deberá pasar -e HUGGING_FACE_HUB_TOKEN=\<token\> al comando docker run anterior con un token de lectura válido de Hugging Face Hub.

Siga este enlace [huggingface token](https://huggingface.co/docs/hub/security-tokens) para obtener el token de acceso y exportar `HUGGINGFACEHUB_API_TOKEN` con el token.

```bash
export HUGGINGFACEHUB_API_TOKEN=<token>
```

Envíe una solicitud para comprobar si el punto final está funcionando:

```bash
curl localhost:8080/generate -X POST -d '{"inputs":"Which NFL team won the Super Bowl in the 2010 season?","parameters":{"max_new_tokens":128, "do_sample": true}}'   -H 'Content-Type: application/json'
```

Para más detalles, consulte [text-generation-inference](https://github.com/huggingface/text-generation-inference).

## Poblar con datos

Si desea poblar la base de datos con algunos datos de ejemplo, puede ejecutar los siguientes comandos:

```shell
poetry install
poetry run python ingest.py
```

El script procesa y almacena secciones de los datos de los informes 10k de Edgar para Nike `nke-10k-2023.pdf` en una base de datos Chroma.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalarlo como el único paquete, puede hacer:

```shell
langchain app new my-app --package intel-rag-xeon
```

Si desea agregarlo a un proyecto existente, puede ejecutar:

```shell
langchain app add intel-rag-xeon
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from intel_rag_xeon import chain as xeon_rag_chain

add_routes(app, xeon_rag_chain, path="/intel-rag-xeon")
```

(Opcional) Ahora configuremos LangSmith. LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones LangChain. Puede registrarse en LangSmith [aquí](https://smith.langchain.com/). Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/intel-rag-xeon/playground](http://127.0.0.1:8000/intel-rag-xeon/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/intel-rag-xeon")
```
