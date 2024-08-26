---
translated: true
---

# rag-aws-kendra

Esta plantilla es una aplicación que utiliza Amazon Kendra, un servicio de búsqueda impulsado por aprendizaje automático, y Anthropic Claude para la generación de texto. La aplicación recupera documentos utilizando una cadena de recuperación para responder a preguntas de sus documentos.

Utiliza la biblioteca `boto3` para conectarse con el servicio Bedrock.

Para obtener más información sobre la construcción de aplicaciones RAG con Amazon Kendra, consulte [esta página](https://aws.amazon.com/blogs/machine-learning/quickly-build-high-accuracy-generative-ai-applications-on-enterprise-data-using-amazon-kendra-langchain-and-large-language-models/).

## Configuración del entorno

Asegúrese de configurar y configurar `boto3` para que funcione con su cuenta de AWS.

Puede seguir la guía [aquí](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration).

También debe tener un índice de Kendra configurado antes de usar esta plantilla.

Puede usar [esta plantilla de Cloudformation](https://github.com/aws-samples/amazon-kendra-langchain-extensions/blob/main/kendra_retriever_samples/kendra-docs-index.yaml) para crear un índice de muestra.

Esto incluye datos de muestra que contienen la documentación en línea de AWS para Amazon Kendra, Amazon Lex y Amazon SageMaker. Alternativamente, puede usar su propio índice de Amazon Kendra si ha indexado su propio conjunto de datos.

Las siguientes variables de entorno deben estar configuradas:

* `AWS_DEFAULT_REGION` - Esto debe reflejar la región de AWS correcta. El valor predeterminado es `us-east-1`.
* `AWS_PROFILE` - Esto debe reflejar su perfil de AWS. El valor predeterminado es `default`.
* `KENDRA_INDEX_ID` - Esto debe tener el ID de índice de la Kendra index. Tenga en cuenta que el ID de índice es un valor alfanumérico de 36 caracteres que se puede encontrar en la página de detalles del índice.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-aws-kendra
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-aws-kendra
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_aws_kendra.chain import chain as rag_aws_kendra_chain

add_routes(app, rag_aws_kendra_chain, path="/rag-aws-kendra")
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

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-aws-kendra/playground](http://127.0.0.1:8000/rag-aws-kendra/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-kendra")
```
