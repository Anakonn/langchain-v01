---
translated: true
---

# rag-aws-bedrock

Esta plantilla está diseñada para conectarse con el servicio AWS Bedrock, un servidor administrado que ofrece un conjunto de modelos de fundación.

Utiliza principalmente `Anthropic Claude` para la generación de texto y `Amazon Titan` para el incrustado de texto, y utiliza FAISS como el almacén de vectores.

Para obtener más contexto sobre la canalización RAG, consulte [este cuaderno](https://github.com/aws-samples/amazon-bedrock-workshop/blob/main/03_QuestionAnswering/01_qa_w_rag_claude.ipynb).

## Configuración del entorno

Antes de poder usar este paquete, asegúrese de haber configurado `boto3` para que funcione con su cuenta de AWS.

Para obtener más detalles sobre cómo configurar y configurar `boto3`, visite [esta página](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration).

Además, necesita instalar el paquete `faiss-cpu` para trabajar con el almacén de vectores FAISS:

```bash
pip install faiss-cpu
```

También debe establecer las siguientes variables de entorno para reflejar su perfil y región de AWS (si no está usando el perfil de AWS `default` y la región `us-east-1`):

* `AWS_DEFAULT_REGION`
* `AWS_PROFILE`

## Uso

Primero, instale la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete:

```shell
langchain app new my-app --package rag-aws-bedrock
```

Para agregar este paquete a un proyecto existente:

```shell
langchain app add rag-aws-bedrock
```

Luego, agregue el siguiente código a su archivo `server.py`:

```python
from rag_aws_bedrock import chain as rag_aws_bedrock_chain

add_routes(app, rag_aws_bedrock_chain, path="/rag-aws-bedrock")
```

(Opcional) Si tiene acceso a LangSmith, puede configurarlo para rastrear, monitorear y depurar aplicaciones de LangChain. Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en [http://localhost:8000](http://localhost:8000)

Puede ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) y acceder al área de juegos en [http://127.0.0.1:8000/rag-aws-bedrock/playground](http://127.0.0.1:8000/rag-aws-bedrock/playground).

Puede acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-bedrock")
```
