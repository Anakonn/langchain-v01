---
translated: true
---

# Bedrock JCVD 🕺🥋

## Resumen

Plantilla LangChain que usa [Claude de Anthropic en Amazon Bedrock](https://aws.amazon.com/bedrock/claude/) para comportarse como JCVD.

> ¡Soy el Fred Astaire de los chatbots! 🕺

## Configuración del entorno

### Credenciales de AWS

Esta plantilla usa [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html), el SDK de AWS para Python, para llamar a [Amazon Bedrock](https://aws.amazon.com/bedrock/). Debes configurar tanto las credenciales de AWS como una región de AWS para poder hacer solicitudes.

> Para obtener información sobre cómo hacer esto, consulta la [documentación de AWS Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) (Guía del desarrollador > Credenciales).

### Modelos base

De forma predeterminada, esta plantilla usa [Claude v2 de Anthropic](https://aws.amazon.com/about-aws/whats-new/2023/08/claude-2-foundation-model-anthropic-amazon-bedrock/) (`anthropic.claude-v2`).

> Para solicitar acceso a un modelo específico, consulta la [Guía del usuario de Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) (Acceso a modelos).

Para usar un modelo diferente, establece la variable de entorno `BEDROCK_JCVD_MODEL_ID`. Hay una lista de modelos base disponible en la [Guía del usuario de Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html) (Usar la API > Operaciones de la API > Ejecutar inferencia > ID de modelos base).

> La lista completa de modelos disponibles (incluidos los modelos base y [personalizados](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html))) está disponible en la [Consola de Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/using-console.html) en **Modelos base** o llamando a [`aws bedrock list-foundation-models`](https://docs.aws.amazon.com/cli/latest/reference/bedrock/list-foundation-models.html).

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package bedrock-jcvd
```

Si quieres agregar esto a un proyecto existente, puedes ejecutar:

```shell
langchain app add bedrock-jcvd
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from bedrock_jcvd import chain as bedrock_jcvd_chain

add_routes(app, bedrock_jcvd_chain, path="/bedrock-jcvd")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, puedes iniciar una instancia de LangServe directamente con:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

También podemos acceder al playground en [http://127.0.0.1:8000/bedrock-jcvd/playground](http://127.0.0.1:8000/bedrock-jcvd/playground)
