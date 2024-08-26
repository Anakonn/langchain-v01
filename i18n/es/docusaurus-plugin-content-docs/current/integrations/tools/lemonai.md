---
translated: true
---

# Agente de limón

>[Agente de limón](https://github.com/felixbrock/lemon-agent) te ayuda a construir poderosos asistentes de IA en minutos y automatizar flujos de trabajo al permitir operaciones de lectura y escritura precisas y confiables en herramientas como `Airtable`, `Hubspot`, `Discord`, `Notion`, `Slack` y `Github`.

Consulta [la documentación completa aquí](https://github.com/felixbrock/lemonai-py-client).

La mayoría de los conectores disponibles hoy en día se enfocan en operaciones de solo lectura, limitando el potencial de los LLM. Por otro lado, los agentes tienen tendencia a alucinarse de vez en cuando debido a la falta de contexto o instrucciones.

Con `Lemon AI`, es posible dar a tus agentes acceso a APIs bien definidas para operaciones de lectura y escritura confiables. Además, las funciones `Lemon AI` te permiten reducir aún más el riesgo de alucinaciones al proporcionar una forma de definir estáticamente los flujos de trabajo en los que el modelo puede confiar en caso de incertidumbre.

## Inicio rápido

El siguiente inicio rápido demuestra cómo usar Lemon AI en combinación con Agentes para automatizar flujos de trabajo que involucran la interacción con herramientas internas.

### 1. Instalar Lemon AI

Requiere Python 3.8.1 y superior.

Para usar Lemon AI en tu proyecto de Python, ejecuta `pip install lemonai`

Esto instalará el cliente de Lemon AI correspondiente que luego puedes importar en tu script.

La herramienta usa los paquetes de Python langchain y loguru. En caso de errores de instalación con Lemon AI, instala primero ambos paquetes y luego instala el paquete Lemon AI.

### 2. Lanzar el servidor

La interacción de tus agentes y todas las herramientas proporcionadas por Lemon AI se maneja a través del [Servidor Lemon AI](https://github.com/felixbrock/lemonai-server). Para usar Lemon AI, debes ejecutar el servidor en tu máquina local para que el cliente de Python de Lemon AI pueda conectarse a él.

### 3. Usar Lemon AI con Langchain

Lemon AI resuelve automáticamente las tareas dadas al encontrar la combinación adecuada de herramientas relevantes o usa Funciones de Lemon AI como alternativa. El siguiente ejemplo demuestra cómo recuperar un usuario de Hackernews y escribirlo en una tabla de Airtable:

#### (Opcional) Definir tus Funciones de Lemon AI

Al igual que las [funciones de OpenAI](https://openai.com/blog/function-calling-and-other-api-updates), Lemon AI ofrece la opción de definir flujos de trabajo como funciones reutilizables. Estas funciones se pueden definir para casos de uso donde es especialmente importante moverse lo más cerca posible a un comportamiento casi determinista. Los flujos de trabajo específicos se pueden definir en un lemonai.json separado:

```json
[
  {
    "name": "Hackernews Airtable User Workflow",
    "description": "retrieves user data from Hackernews and appends it to a table in Airtable",
    "tools": ["hackernews-get-user", "airtable-append-data"]
  }
]
```

Tu modelo tendrá acceso a estas funciones y las preferirá sobre la autoselección de herramientas para resolver una tarea dada. Todo lo que tienes que hacer es hacer que el agente sepa que debe usar una función determinada incluyendo el nombre de la función en el mensaje.

#### Incluir Lemon AI en tu proyecto Langchain

```python
import os

from langchain_openai import OpenAI
from lemonai import execute_workflow
```

#### Cargar claves API y tokens de acceso

Para usar herramientas que requieren autenticación, debes almacenar las credenciales de acceso correspondientes en tu entorno con el formato "{nombre de la herramienta}_{cadena de autenticación}", donde la cadena de autenticación es uno de ["API_KEY", "SECRET_KEY", "SUBSCRIPTION_KEY", "ACCESS_KEY"] para claves API o ["ACCESS_TOKEN", "SECRET_TOKEN"] para tokens de autenticación. Ejemplos son "OPENAI_API_KEY", "BING_SUBSCRIPTION_KEY", "AIRTABLE_ACCESS_TOKEN".

```python
""" Load all relevant API Keys and Access Tokens into your environment variables """
os.environ["OPENAI_API_KEY"] = "*INSERT OPENAI API KEY HERE*"
os.environ["AIRTABLE_ACCESS_TOKEN"] = "*INSERT AIRTABLE TOKEN HERE*"
```

```python
hackernews_username = "*INSERT HACKERNEWS USERNAME HERE*"
airtable_base_id = "*INSERT BASE ID HERE*"
airtable_table_id = "*INSERT TABLE ID HERE*"

""" Define your instruction to be given to your LLM """
prompt = f"""Read information from Hackernews for user {hackernews_username} and then write the results to
Airtable (baseId: {airtable_base_id}, tableId: {airtable_table_id}). Only write the fields "username", "karma"
and "created_at_i". Please make sure that Airtable does NOT automatically convert the field types.
"""

"""
Use the Lemon AI execute_workflow wrapper
to run your Langchain agent in combination with Lemon AI
"""
model = OpenAI(temperature=0)

execute_workflow(llm=model, prompt_string=prompt)
```

### 4. Obtener transparencia sobre la toma de decisiones de tu Agente

Para obtener transparencia sobre cómo tu Agente interactúa con las herramientas de Lemon AI para resolver una tarea dada, todas las decisiones tomadas, las herramientas utilizadas y las operaciones realizadas se escriben en un archivo `lemonai.log` local. Cada vez que tu agente de LLM interactúa con el conjunto de herramientas de Lemon AI, se crea una entrada de registro correspondiente.

```log
2023-06-26T11:50:27.708785+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - hackernews-get-user
2023-06-26T11:50:39.624035+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - airtable-append-data
2023-06-26T11:58:32.925228+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - hackernews-get-user
2023-06-26T11:58:43.988788+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - airtable-append-data
```

Mediante el uso de [Lemon AI Analytics](https://github.com/felixbrock/lemon-agent/blob/main/apps/analytics/README.md), puedes obtener una mejor comprensión de la frecuencia y el orden en que se utilizan las herramientas. Como resultado, puedes identificar puntos débiles en las capacidades de toma de decisiones de tu agente y pasar a un comportamiento más determinista definiendo funciones de Lemon AI.
