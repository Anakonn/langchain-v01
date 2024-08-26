---
translated: true
---

# MultiOn

[MultiON](https://www.multion.ai/blog/multion-building-a-brighter-future-for-humanity-with-ai-agents) ha construido un Agente de IA que puede interactuar con una amplia variedad de servicios web y aplicaciones.

Este cuaderno le guía a través de la conexión de LangChain al Cliente `MultiOn` en su navegador.

Esto permite un flujo de trabajo personalizado y con agencia que utiliza el poder de los agentes MultiON.

Para usar este kit de herramientas, deberá agregar la `Extensión MultiOn` a su navegador:

* Crea una [cuenta MultiON](https://app.multion.ai/login?callbackUrl=%2Fprofile).
* Agrega la [extensión MultiOn para Chrome](https://multion.notion.site/Download-MultiOn-ddddcfe719f94ab182107ca2612c07a5).

```python
%pip install --upgrade --quiet  multion langchain -q
```

```python
from langchain_community.agent_toolkits import MultionToolkit

toolkit = MultionToolkit()
toolkit
```

```output
MultionToolkit()
```

```python
tools = toolkit.get_tools()
tools
```

```output
[MultionCreateSession(), MultionUpdateSession(), MultionCloseSession()]
```

## Configuración de MultiOn

Una vez que haya creado una cuenta, cree una clave API en https://app.multion.ai/.

Inicie sesión para establecer la conexión con su extensión.

```python
# Authorize connection to your Browser extention
import multion

multion.login()
```

```output
Logged in.
```

## Usar el kit de herramientas MultiOn dentro de un Agente

Esto utilizará la extensión Chrome de MultiON para realizar las acciones deseadas.

Podemos ejecutar lo siguiente y ver el [rastro](https://smith.langchain.com/public/34aaf36d-204a-4ce3-a54e-4a0976f09670/r) para ver:

* El agente usa la herramienta `create_multion_session`
* Luego usa MultiON para ejecutar la consulta

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
```

```python
# Prompt
instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
# LLM
llm = ChatOpenAI(temperature=0)
```

```python
# Agent
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=False,
)
```

```python
agent_executor.invoke(
    {
        "input": "Use multion to explain how AlphaCodium works, a recently released code language model."
    }
)
```

```output
WARNING: 'new_session' is deprecated and will be removed in a future version. Use 'create_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
```

```output
{'input': 'Use multion to how AlphaCodium works, a recently released code language model.',
 'output': 'AlphaCodium is a recently released code language model that is designed to assist developers in writing code more efficiently. It is based on advanced machine learning techniques and natural language processing. AlphaCodium can understand and generate code in multiple programming languages, making it a versatile tool for developers.\n\nThe model is trained on a large dataset of code snippets and programming examples, allowing it to learn patterns and best practices in coding. It can provide suggestions and auto-complete code based on the context and the desired outcome.\n\nAlphaCodium also has the ability to analyze code and identify potential errors or bugs. It can offer recommendations for improving code quality and performance.\n\nOverall, AlphaCodium aims to enhance the coding experience by providing intelligent assistance and reducing the time and effort required to write high-quality code.\n\nFor more detailed information, you can visit the official AlphaCodium website or refer to the documentation and resources available online.\n\nI hope this helps! Let me know if you have any other questions.'}
```
