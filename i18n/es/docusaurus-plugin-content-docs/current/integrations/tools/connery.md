---
traducido: falso
translated: true
---

# Herramienta de acción de Connery

Con esta herramienta, puedes integrar acciones individuales de Connery en tu agente LangChain.

Si quieres usar más de una acción de Connery en tu agente,
consulta la documentación de [Connery Toolkit](/docs/integrations/toolkits/connery).

## ¿Qué es Connery?

Connery es una infraestructura de plugins de código abierto para IA.

Con Connery, puedes crear fácilmente un plugin personalizado con un conjunto de acciones e integrarlo sin problemas en tu agente LangChain.
Connery se encargará de aspectos críticos como el entorno de ejecución, la autorización, la gestión de secretos, la gestión de accesos, los registros de auditoría y otras funciones vitales.

Además, Connery, respaldado por nuestra comunidad, proporciona una diversa colección de plugins de código abierto listos para usar para mayor comodidad.

Más información sobre Connery:

- GitHub: https://github.com/connery-io/connery
- Documentación: https://docs.connery.io

## Requisitos previos

Para usar las acciones de Connery en tu agente LangChain, debes hacer algunos preparativos:

1. Configura el ejecutor de Connery siguiendo la [Guía de inicio rápido](https://docs.connery.io/docs/runner/quick-start/).
2. Instala todos los plugins con las acciones que quieras usar en tu agente.
3. Establece las variables de entorno `CONNERY_RUNNER_URL` y `CONNERY_RUNNER_API_KEY` para que el kit de herramientas pueda comunicarse con el ejecutor de Connery.

## Ejemplo de uso de la herramienta de acción de Connery

En el ejemplo a continuación, recuperamos una acción por su ID del ejecutor de Connery y luego la llamamos con los parámetros especificados.

Aquí, usamos el ID de la acción **Enviar correo electrónico** del plugin [Gmail](https://github.com/connery-io/gmail).

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.tools.connery import ConneryService
from langchain_openai import ChatOpenAI

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the emails from examples below.
recepient_email = "test@example.com"

# Get the SendEmail action from the Connery Runner by ID.
connery_service = ConneryService()
send_email_action = connery_service.get_action("CABC80BB79C15067CA983495324AE709")
```

Ejecuta la acción manualmente.

```python
manual_run_result = send_email_action.run(
    {
        "recipient": recepient_email,
        "subject": "Test email",
        "body": "This is a test email sent from Connery.",
    }
)
print(manual_run_result)
```

Ejecuta la acción usando el agente de funciones de OpenAI.

Puedes ver un seguimiento de LangSmith de este ejemplo [aquí](https://smith.langchain.com/public/a37d216f-c121-46da-a428-0e09dc19b1dc/r).

```python
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    [send_email_action], llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
agent_run_result = agent.run(
    f"Send an email to the {recepient_email} and say that I will be late for the meeting."
)
print(agent_run_result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Late for Meeting', 'body': 'Dear Team,\n\nI wanted to inform you that I will be late for the meeting today. I apologize for any inconvenience caused. Please proceed with the meeting without me and I will join as soon as I can.\n\nBest regards,\n[Your Name]'}`


[0m[36;1m[1;3m{'messageId': '<d34a694d-50e0-3988-25da-e86b4c51d7a7@gmail.com>'}[0m[32;1m[1;3mI have sent an email to test@example.com informing them that you will be late for the meeting.[0m

[1m> Finished chain.[0m
I have sent an email to test@example.com informing them that you will be late for the meeting.
```

NOTA: La acción de Connery es una herramienta estructurada, por lo que solo puedes usarla en los agentes que admiten herramientas estructuradas.
