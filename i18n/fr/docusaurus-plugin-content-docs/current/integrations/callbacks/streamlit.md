---
translated: true
---

# Streamlit

> **[Streamlit](https://streamlit.io/) est un moyen plus rapide de créer et de partager des applications de données.**
> Streamlit transforme des scripts de données en applications Web partageables en quelques minutes. Le tout en Python pur. Aucune expérience du front-end requise.
> Voir plus d'exemples sur [streamlit.io/generative-ai](https://streamlit.io/generative-ai).

[![Ouvrir dans GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/langchain-ai/streamlit-agent?quickstart=1)

Dans ce guide, nous allons montrer comment utiliser `StreamlitCallbackHandler` pour afficher les pensées et les actions d'un agent dans une application Streamlit interactive. Essayez-le avec l'application en cours d'exécution ci-dessous en utilisant l'agent MRKL :

<iframe loading="lazy" src="https://langchain-mrkl.streamlit.app/?embed=true&embed_options=light_theme"
    style={{ width: 100 + '%', border: 'none', marginBottom: 1 + 'rem', height: 600 }}
    allow="camera;clipboard-read;clipboard-write;"
></iframe>

## Installation et configuration

```bash
pip install langchain streamlit
```

Vous pouvez exécuter `streamlit hello` pour charger une application d'exemple et valider que votre installation a réussi. Voir les instructions complètes dans la [documentation de démarrage de Streamlit](https://docs.streamlit.io/library/get-started).

## Afficher les pensées et les actions

Pour créer un `StreamlitCallbackHandler`, vous n'avez qu'à fournir un conteneur parent pour rendre la sortie.

```python
<!--IMPORTS:[{"imported": "StreamlitCallbackHandler", "source": "langchain_community.callbacks.streamlit", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.streamlit.StreamlitCallbackHandler.html", "title": "Streamlit"}]-->
from langchain_community.callbacks.streamlit import (
    StreamlitCallbackHandler,
)
import streamlit as st

st_callback = StreamlitCallbackHandler(st.container())
```

Les arguments de mots-clés supplémentaires pour personnaliser le comportement d'affichage sont décrits dans la
[référence de l'API](https://api.python.langchain.com/en/latest/callbacks/langchain.callbacks.streamlit.streamlit_callback_handler.StreamlitCallbackHandler.html).

### Scénario 1 : Utilisation d'un agent avec des outils

Le principal cas d'utilisation pris en charge aujourd'hui est la visualisation des actions d'un agent avec des outils (ou d'un agent exécuteur). Vous pouvez créer un agent dans votre application Streamlit et passer simplement le `StreamlitCallbackHandler` à `agent.run()` pour visualiser les pensées et les actions en direct dans votre application.

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

**Remarque :** Vous devrez définir `OPENAI_API_KEY` pour que le code d'application ci-dessus s'exécute avec succès.
Le moyen le plus simple de le faire est via [Streamlit secrets.toml](https://docs.streamlit.io/library/advanced-features/secrets-management),
ou tout autre outil de gestion d'ENV local.

### Scénarios supplémentaires

Actuellement, `StreamlitCallbackHandler` est orienté vers l'utilisation avec un agent exécuteur LangChain. La prise en charge d'autres types d'agents, l'utilisation directe avec des chaînes, etc. sera ajoutée à l'avenir.

Vous pouvez également être intéressé par l'utilisation de
[StreamlitChatMessageHistory](/docs/integrations/memory/streamlit_chat_message_history) pour LangChain.
