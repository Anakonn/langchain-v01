---
translated: true
---

# Streamlit

> **[Streamlit](https://streamlit.io/) es una forma más rápida de crear y compartir aplicaciones de datos.**
> Streamlit convierte los scripts de datos en aplicaciones web compartibles en minutos. Todo en Python puro. No se requiere experiencia en front‑end.
> Ver más ejemplos en [streamlit.io/generative-ai](https://streamlit.io/generative-ai).

[![Abrir en GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/langchain-ai/streamlit-agent?quickstart=1)

En esta guía demostraremos cómo usar `StreamlitCallbackHandler` para mostrar los pensamientos y acciones de un agente en una
aplicación interactiva de Streamlit. Pruébalo con la aplicación en ejecución a continuación usando el agente MRKL:

<iframe loading="lazy" src="https://langchain-mrkl.streamlit.app/?embed=true&embed_options=light_theme"
    style={{ width: 100 + '%', border: 'none', marginBottom: 1 + 'rem', height: 600 }}
    allow="camera;clipboard-read;clipboard-write;"
></iframe>

## Instalación y configuración

```bash
pip install langchain streamlit
```

Puedes ejecutar `streamlit hello` para cargar una aplicación de muestra y validar que tu instalación haya tenido éxito. Consulta las instrucciones completas en la
[documentación de inicio de Streamlit](https://docs.streamlit.io/library/get-started).

## Mostrar pensamientos y acciones

Para crear un `StreamlitCallbackHandler`, solo necesitas proporcionar un contenedor principal para renderizar la salida.

```python
<!--IMPORTS:[{"imported": "StreamlitCallbackHandler", "source": "langchain_community.callbacks.streamlit", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.streamlit.StreamlitCallbackHandler.html", "title": "Streamlit"}]-->
from langchain_community.callbacks.streamlit import (
    StreamlitCallbackHandler,
)
import streamlit as st

st_callback = StreamlitCallbackHandler(st.container())
```

Los argumentos clave adicionales para personalizar el comportamiento de visualización se describen en la
[referencia de la API](https://api.python.langchain.com/en/latest/callbacks/langchain.callbacks.streamlit.streamlit_callback_handler.StreamlitCallbackHandler.html).

### Escenario 1: Uso de un Agente con Herramientas

El caso de uso principal compatible en la actualidad es visualizar las acciones de un Agente con Herramientas (o Agente Ejecutor). Puedes crear un
agente en tu aplicación Streamlit y simplemente pasar el `StreamlitCallbackHandler` a `agent.run()` para visualizar los
pensamientos y acciones en vivo en tu aplicación.

```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "Streamlit"}, {"imported": "create_react_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.react.agent.create_react_agent.html", "title": "Streamlit"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Streamlit"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Streamlit"}]-->
import streamlit as st
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, streaming=True)
tools = load_tools(["ddg-search"])
prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

if prompt := st.chat_input():
    st.chat_message("user").write(prompt)
    with st.chat_message("assistant"):
        st_callback = StreamlitCallbackHandler(st.container())
        response = agent_executor.invoke(
            {"input": prompt}, {"callbacks": [st_callback]}
        )
        st.write(response["output"])
```

**Nota:** Deberás establecer `OPENAI_API_KEY` para que el código de la aplicación anterior se ejecute correctamente.
La forma más sencilla de hacerlo es a través de [Streamlit secrets.toml](https://docs.streamlit.io/library/advanced-features/secrets-management),
o cualquier otra herramienta de gestión de ENV local.

### Escenarios adicionales

Actualmente, `StreamlitCallbackHandler` está orientado al uso con un Agente Ejecutor de LangChain. Se agregarán compatibilidad para otros tipos de agentes,
uso directo con Cadenas, etc. en el futuro.

También puede estar interesado en usar
[StreamlitChatMessageHistory](/docs/integrations/memory/streamlit_chat_message_history) para LangChain.
