---
translated: true
---

# Agente de Funciones de OpenAI - Gmail

¿Has tenido problemas para llegar a cero en la bandeja de entrada?

Usando esta plantilla, puedes crear y personalizar tu propio asistente de IA para administrar tu cuenta de Gmail. Utilizando las herramientas predeterminadas de Gmail, puede leer, buscar y redactar correos electrónicos para responder en tu nombre. También tiene acceso a un motor de búsqueda de Tavily, por lo que puede buscar información relevante sobre cualquier tema o persona en el hilo del correo electrónico antes de escribir, asegurándose de que los borradores incluyan toda la información relevante necesaria para sonar bien informado.

## Los detalles

Este asistente utiliza el soporte de [llamada de funciones](https://python.langchain.com/docs/modules/chains/how_to/openai_functions) de OpenAI para seleccionar e invocar de manera confiable las herramientas que has proporcionado.

Esta plantilla también importa directamente de [langchain-core](https://pypi.org/project/langchain-core/) y [`langchain-community`](https://pypi.org/project/langchain-community/) cuando corresponde. Hemos reestructurado LangChain para que puedas seleccionar las integraciones específicas necesarias para tu caso de uso. Si bien aún puedes importar de `langchain` (estamos haciendo que esta transición sea compatible hacia atrás), hemos separado los hogares de la mayoría de las clases para reflejar la propiedad y hacer que tus listas de dependencias sean más ligeras. La mayoría de las integraciones que necesitas se pueden encontrar en el paquete `langchain-community`, y si solo estás usando las API básicas de expresión, incluso puedes construir solo en función de `langchain-core`.

## Configuración del entorno

Deben establecerse las siguientes variables de entorno:

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Establece la variable de entorno `TAVILY_API_KEY` para acceder a la búsqueda de Tavily.

Crea un archivo [`credentials.json`](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application) que contenga tu ID de cliente de OAuth de Gmail. Para personalizar la autenticación, consulta la sección [Personalizar autenticación](#personalizar-autenticación) a continuación.

*Nota: la primera vez que ejecutes esta aplicación, te obligará a pasar por un flujo de autenticación de usuario.*

(Opcional): Establece `GMAIL_AGENT_ENABLE_SEND` en `true` (o modifica el archivo `agent.py` en esta plantilla) para darle acceso a la herramienta "Enviar". Esto le dará a tu asistente permisos para enviar correos electrónicos en tu nombre sin tu revisión explícita, lo cual no se recomienda.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package openai-functions-agent-gmail
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add openai-functions-agent-gmail
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from openai_functions_agent import agent_executor as openai_functions_agent_chain

add_routes(app, openai_functions_agent_chain, path="/openai-functions-agent-gmail")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/openai-functions-agent-gmail/playground](http://127.0.0.1:8000/openai-functions-agent/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-agent-gmail")
```

## Personalizar autenticación

```python
from langchain_community.tools.gmail.utils import build_resource_service, get_gmail_credentials

# Can review scopes here https://developers.google.com/gmail/api/auth/scopes
# For instance, readonly scope is 'https://www.googleapis.com/auth/gmail.readonly'
credentials = get_gmail_credentials(
    token_file="token.json",
    scopes=["https://mail.google.com/"],
    client_secrets_file="credentials.json",
)
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)
```
