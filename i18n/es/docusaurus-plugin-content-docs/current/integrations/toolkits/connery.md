---
translated: true
---

# Kit de herramientas de Connery

Utilizando este kit de herramientas, puede integrar las acciones de Connery en su agente LangChain.

Si desea utilizar solo una acción particular de Connery en su agente,
consulte la documentación de la [Herramienta de acción de Connery](/docs/integrations/tools/connery).

## ¿Qué es Connery?

Connery es una infraestructura de complementos de código abierto para IA.

Con Connery, puede crear fácilmente un complemento personalizado con un conjunto de acciones e integrarlo sin problemas en su agente LangChain.
Connery se encargará de aspectos críticos como el tiempo de ejecución, la autorización, la gestión de secretos, la gestión de accesos, los registros de auditoría y otras funciones vitales.

Además, Connery, respaldado por nuestra comunidad, proporciona una diversa colección de complementos de código abierto listos para usar para mayor comodidad.

Más información sobre Connery:

- GitHub: https://github.com/connery-io/connery
- Documentación: https://docs.connery.io

## Requisitos previos

Para utilizar las acciones de Connery en su agente LangChain, debe realizar algunos preparativos:

1. Configurar el ejecutor de Connery utilizando la guía de [Inicio rápido](https://docs.connery.io/docs/runner/quick-start/).
2. Instalar todos los complementos con las acciones que desea utilizar en su agente.
3. Establecer las variables de entorno `CONNERY_RUNNER_URL` y `CONNERY_RUNNER_API_KEY` para que el kit de herramientas pueda comunicarse con el ejecutor de Connery.

## Ejemplo de uso del kit de herramientas de Connery

En el ejemplo a continuación, creamos un agente que utiliza dos acciones de Connery para resumir una página web pública y enviar el resumen por correo electrónico:

1. Acción **Resumir página web pública** del complemento [Summarization](https://github.com/connery-io/summarization-plugin).
2. Acción **Enviar correo electrónico** del complemento [Gmail](https://github.com/connery-io/gmail).

Puede ver un seguimiento de LangSmith de este ejemplo [aquí](https://smith.langchain.com/public/4af5385a-afe9-46f6-8a53-57fe2d63c5bc/r).

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.connery import ConneryToolkit
from langchain_community.chat_models import ChatOpenAI
from langchain_community.tools.connery import ConneryService

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the email with the summary from example below.
recepient_email = "test@example.com"

# Create a Connery Toolkit with all the available actions from the Connery Runner.
connery_service = ConneryService()
connery_toolkit = ConneryToolkit.create_instance(connery_service)

# Use OpenAI Functions agent to execute the prompt using actions from the Connery Toolkit.
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    connery_toolkit.get_tools(), llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
result = agent.run(
    f"""Make a short summary of the webpage http://www.paulgraham.com/vb.html in three sentences
and send it to {recepient_email}. Include the link to the webpage into the body of the email."""
)
print(result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CA72DFB0AB4DF6C830B43E14B0782F70` with `{'publicWebpageUrl': 'http://www.paulgraham.com/vb.html'}`


[0m[33;1m[1;3m{'summary': 'The author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.'}[0m[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Summary of the webpage', 'body': 'Here is a short summary of the webpage http://www.paulgraham.com/vb.html:\n\nThe author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.\n\nYou can find the full webpage [here](http://www.paulgraham.com/vb.html).'}`


[0m[33;1m[1;3m{'messageId': '<2f04b00e-122d-c7de-c91e-e78e0c3276d6@gmail.com>'}[0m[32;1m[1;3mI have sent the email with the summary of the webpage to test@example.com. Please check your inbox.[0m

[1m> Finished chain.[0m
I have sent the email with the summary of the webpage to test@example.com. Please check your inbox.
```

NOTA: La acción de Connery es una herramienta estructurada, por lo que solo puede utilizarla en los agentes que admiten herramientas estructuradas.
