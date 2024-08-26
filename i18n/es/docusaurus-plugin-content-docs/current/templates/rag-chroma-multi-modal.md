---
translated: true
---

# rag-chroma-multi-modal

Los LLM multimodales permiten a los asistentes visuales realizar preguntas y respuestas sobre imágenes.

Esta plantilla crea un asistente visual para presentaciones de diapositivas, que a menudo contienen elementos visuales como gráficos o figuras.

Utiliza incrustaciones OpenCLIP para incrustar todas las imágenes de las diapositivas y almacenarlas en Chroma.

Dada una pregunta, se recuperan las diapositivas relevantes y se pasan a GPT-4V para la síntesis de respuestas.

## Entrada

Proporcione un conjunto de diapositivas en formato pdf en el directorio `/docs`.

De forma predeterminada, esta plantilla tiene un conjunto de diapositivas sobre los ingresos del tercer trimestre de DataDog, una empresa de tecnología pública.

Algunos ejemplos de preguntas que se pueden hacer son:

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

Para crear un índice del conjunto de diapositivas, ejecute:

```shell
poetry install
python ingest.py
```

## Almacenamiento

Esta plantilla utilizará incrustaciones multimodales [OpenCLIP](https://github.com/mlfoundations/open_clip) para incrustar las imágenes.

Puede seleccionar diferentes opciones de modelos de incrustación (ver resultados [aquí](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv))).

La primera vez que ejecute la aplicación, descargará automáticamente el modelo de incrustación multimodal.

De forma predeterminada, LangChain utilizará un modelo de incrustación con un rendimiento moderado pero con requisitos de memoria más bajos, `ViT-H-14`.

Puede elegir modelos `OpenCLIPEmbeddings` alternativos en `rag_chroma_multi_modal/ingest.py`:

```python
vectorstore_mmembd = Chroma(
    collection_name="multi-modal-rag",
    persist_directory=str(re_vectorstore_path),
    embedding_function=OpenCLIPEmbeddings(
        model_name="ViT-H-14", checkpoint="laion2b_s32b_b79k"
    ),
)
```

## LLM

La aplicación recuperará imágenes en función de la similitud entre la entrada de texto y la imagen, que se asignan al espacio de incrustación multimodal. Luego, pasará las imágenes a GPT-4V.

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a GPT-4V de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add rag-chroma-multi-modal
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_chroma_multi_modal import chain as rag_chroma_multi_modal_chain

add_routes(app, rag_chroma_multi_modal_chain, path="/rag-chroma-multi-modal")
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

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
