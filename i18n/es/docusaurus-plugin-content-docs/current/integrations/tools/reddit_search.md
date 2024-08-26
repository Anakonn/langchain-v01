---
translated: true
---

# Búsqueda en Reddit

En este cuaderno, aprendemos cómo funciona la herramienta de búsqueda de Reddit.
Primero asegúrate de haber instalado praw con el siguiente comando:

```python
%pip install --upgrade --quiet  praw
```

Luego necesitas configurar las claves API y las variables de entorno adecuadas. Necesitarás crear una cuenta de usuario de Reddit y obtener las credenciales. Así que crea una cuenta de usuario de Reddit yendo a https://www.reddit.com y registrándote.
Luego obtén tus credenciales yendo a https://www.reddit.com/prefs/apps y creando una aplicación.
Deberías tener tu client_id y secret de la creación de la aplicación. Ahora puedes pegar esos strings en las variables client_id y client_secret.
Nota: Puedes poner cualquier string para user_agent.

```python
client_id = ""
client_secret = ""
user_agent = ""
```

```python
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper

search = RedditSearchRun(
    api_wrapper=RedditSearchAPIWrapper(
        reddit_client_id=client_id,
        reddit_client_secret=client_secret,
        reddit_user_agent=user_agent,
    )
)
```

Luego puedes establecer tus consultas, por ejemplo, qué subreddit quieres consultar, cuántas publicaciones quieres que se devuelvan, cómo quieres que se ordenen los resultados, etc.

```python
from langchain_community.tools.reddit_search.tool import RedditSearchSchema

search_params = RedditSearchSchema(
    query="beginner", sort="new", time_filter="week", subreddit="python", limit="2"
)
```

Finalmente, ejecuta la búsqueda y obtén tus resultados.

```python
result = search.run(tool_input=search_params.dict())
```

```python
print(result)
```

Aquí hay un ejemplo de cómo imprimir el resultado.
Nota: Puede que obtengas una salida diferente dependiendo de la publicación más reciente en el subreddit, pero el formato debería ser similar.

> Buscando r/python se encontraron 2 publicaciones:
> Título de la publicación: 'Setup Github Copilot in Visual Studio Code'
> Usuario: Feisty-Recording-715
> Subreddit: r/Python:
>                     Cuerpo del texto: 🛠️ Este tutorial es perfecto para principiantes que buscan fortalecer su comprensión del control de versiones o para desarrolladores experimentados que buscan una referencia rápida para la configuración de GitHub en Visual Studio Code.
>
>🎓 Al final de este video, estarás equipado con las habilidades para administrar con confianza tu base de código, colaborar con otros y contribuir a proyectos de código abierto en GitHub.
>
>
>Enlace del video: https://youtu.be/IdT1BhrSfdo?si=mV7xVpiyuhlD8Zrw
>
>Tus comentarios son bienvenidos
>                     URL de la publicación: https://www.reddit.com/r/Python/comments/1823wr7/setup_github_copilot_in_visual_studio_code/
>                     Categoría de la publicación: N/A.
>                     Puntuación: 0
>
>Título de la publicación: 'A Chinese Checkers game made with pygame and PySide6, with custom bots support'
>Usuario: HenryChess
>Subreddit: r/Python:
>                     Cuerpo del texto: Enlace de GitHub: https://github.com/henrychess/pygame-chinese-checkers
>
>No estoy seguro de si esto se considera principiante o intermedio. Creo que todavía estoy en la zona de principiante, así que lo etiqueto como principiante.
>
>Este es un juego de Chinese Checkers (también conocido como Sternhalma) para 2 a 3 jugadores. Los bots que escribí son fáciles de vencer, ya que son principalmente para depurar la lógica del juego. Sin embargo, puedes escribir tus propios bots personalizados. Hay una guía en la página de GitHub.
>                     URL de la publicación: https://www.reddit.com/r/Python/comments/181xq0u/a_chinese_checkers_game_made_with_pygame_and/
>                     Categoría de la publicación: N/A.
>                     Puntuación: 1

## Uso de la herramienta con una cadena de agentes

La funcionalidad de búsqueda de Reddit también se proporciona como una herramienta de múltiples entradas. En este ejemplo, adaptamos [el código existente de la documentación](/docs/modules/memory/agent_with_memory) y usamos ChatOpenAI para crear una cadena de agentes con memoria. Esta cadena de agentes puede extraer información de Reddit y usar estas publicaciones para responder a las entradas posteriores.

Para ejecutar el ejemplo, agrega tu información de acceso a la API de Reddit y también obtén una clave de OpenAI del [API de OpenAI](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key).

```python
# Adapted code from /docs/modules/agents/how_to/sharedmemory_for_tools

from langchain.agents import AgentExecutor, StructuredChatAgent, Tool
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory, ReadOnlySharedMemory
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

# Provide keys for Reddit
client_id = ""
client_secret = ""
user_agent = ""
# Provide key for OpenAI
openai_api_key = ""

template = """This is a conversation between a human and a bot:

{chat_history}

Write a summary of the conversation for {input}:
"""

prompt = PromptTemplate(input_variables=["input", "chat_history"], template=template)
memory = ConversationBufferMemory(memory_key="chat_history")

prefix = """Have a conversation with a human, answering the following questions as best you can. You have access to the following tools:"""
suffix = """Begin!"

{chat_history}
Question: {input}
{agent_scratchpad}"""

tools = [
    RedditSearchRun(
        api_wrapper=RedditSearchAPIWrapper(
            reddit_client_id=client_id,
            reddit_client_secret=client_secret,
            reddit_user_agent=user_agent,
        )
    )
]

prompt = StructuredChatAgent.create_prompt(
    prefix=prefix,
    tools=tools,
    suffix=suffix,
    input_variables=["input", "chat_history", "agent_scratchpad"],
)

llm = ChatOpenAI(temperature=0, openai_api_key=openai_api_key)

llm_chain = LLMChain(llm=llm, prompt=prompt)
agent = StructuredChatAgent(llm_chain=llm_chain, verbose=True, tools=tools)
agent_chain = AgentExecutor.from_agent_and_tools(
    agent=agent, verbose=True, memory=memory, tools=tools
)

# Answering the first prompt requires usage of the Reddit search tool.
agent_chain.run(input="What is the newest post on r/langchain for the week?")
# Answering the subsequent prompt uses memory.
agent_chain.run(input="Who is the author of the post?")
```
