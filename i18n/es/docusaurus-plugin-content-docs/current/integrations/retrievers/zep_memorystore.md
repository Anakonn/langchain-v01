---
translated: true
---

# Zep

## Ejemplo de Retriever para [Zep](https://docs.getzep.com/)

> Recuerda, comprende y extrae datos de los historiales de chat. Potencia experiencias de IA personalizadas.

> [Zep](https://www.getzep.com) es un servicio de memoria a largo plazo para aplicaciones de asistentes de IA.
> Con Zep, puedes proporcionar a los asistentes de IA la capacidad de recordar conversaciones pasadas, sin importar cuán distantes sean,
> al mismo tiempo que se reducen las alucinaciones, la latencia y el costo.

> ¿Interesado en Zep Cloud? Consulta la [Guía de instalación de Zep Cloud](https://help.getzep.com/sdks) y el [Ejemplo de Retriever de Zep Cloud](https://help.getzep.com/langchain/examples/rag-message-history-example)

## Instalación y configuración de código abierto

> Proyecto de código abierto de Zep: [https://github.com/getzep/zep](https://github.com/getzep/zep)
> Documentación de código abierto de Zep: [https://docs.getzep.com/](https://docs.getzep.com/)

## Ejemplo de Retriever

Este cuaderno demuestra cómo buscar en los historiales de mensajes de chat utilizando el [Almacén de memoria a largo plazo de Zep](https://getzep.github.io/).

Demostraremos:

1. Agregar el historial de conversaciones al almacén de memoria de Zep.
2. Búsqueda vectorial sobre el historial de conversaciones:
    1. Con una búsqueda de similitud sobre los mensajes de chat
    2. Utilizando el reordenamiento de relevancia marginal máxima de una búsqueda de mensajes de chat
    3. Filtrar una búsqueda utilizando filtros de metadatos
    4. Una búsqueda de similitud sobre los resúmenes de los mensajes de chat
    5. Utilizando el reordenamiento de relevancia marginal máxima de una búsqueda de resúmenes

```python
import getpass
import time
from uuid import uuid4

from langchain.memory import ZepMemory
from langchain_core.messages import AIMessage, HumanMessage

# Set this to your Zep server URL
ZEP_API_URL = "http://localhost:8000"
```

### Inicializar la clase de historial de mensajes de chat de Zep y agregar un historial de mensajes de chat al almacén de memoria

**NOTA:** A diferencia de otros Retrievers, el contenido devuelto por el Retriever de Zep es específico de la sesión/usuario. Se requiere un `session_id` al instanciar el Retriever.

```python
# Provide your Zep API key. Note that this is optional. See https://docs.getzep.com/deployment/auth
AUTHENTICATE = False

zep_api_key = None
if AUTHENTICATE:
    zep_api_key = getpass.getpass()
```

```python
session_id = str(uuid4())  # This is a unique identifier for the user/session

# Initialize the Zep Memory Class
zep_memory = ZepMemory(session_id=session_id, url=ZEP_API_URL, api_key=zep_api_key)
```

```python
# Preload some messages into the memory. The default message window is 12 messages. We want to push beyond this to demonstrate auto-summarization.
test_history = [
    {"role": "human", "content": "Who was Octavia Butler?"},
    {
        "role": "ai",
        "content": (
            "Octavia Estelle Butler (June 22, 1947 – February 24, 2006) was an American"
            " science fiction author."
        ),
    },
    {"role": "human", "content": "Which books of hers were made into movies?"},
    {
        "role": "ai",
        "content": (
            "The most well-known adaptation of Octavia Butler's work is the FX series"
            " Kindred, based on her novel of the same name."
        ),
    },
    {"role": "human", "content": "Who were her contemporaries?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R."
            " Delany, and Joanna Russ."
        ),
    },
    {"role": "human", "content": "What awards did she win?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur"
            " Fellowship."
        ),
    },
    {
        "role": "human",
        "content": "Which other women sci-fi writers might I want to read?",
    },
    {
        "role": "ai",
        "content": "You might want to read Ursula K. Le Guin or Joanna Russ.",
    },
    {
        "role": "human",
        "content": (
            "Write a short synopsis of Butler's book, Parable of the Sower. What is it"
            " about?"
        ),
    },
    {
        "role": "ai",
        "content": (
            "Parable of the Sower is a science fiction novel by Octavia Butler,"
            " published in 1993. It follows the story of Lauren Olamina, a young woman"
            " living in a dystopian future where society has collapsed due to"
            " environmental disasters, poverty, and violence."
        ),
    },
    {"role": "human", "content": "What is the setting of the book?"},
    {
        "role": "ai",
        "content": (
            "The book is set in a dystopian future in the 2020s, where society has"
            " collapsed due to climate change and economic crises."
        ),
    },
    {"role": "human", "content": "Who is the protagonist?"},
    {
        "role": "ai",
        "content": (
            "The protagonist of the book is Lauren Olamina, a young woman who possesses"
            " 'hyperempathy', the ability to feel pain and other sensations she"
            " witnesses."
        ),
    },
    {"role": "human", "content": "What is the main theme of the book?"},
    {
        "role": "ai",
        "content": (
            "The main theme of the book is survival in the face of drastic societal"
            " change and collapse. It also explores themes of adaptability, community,"
            " and the human capacity for change."
        ),
    },
    {"role": "human", "content": "What is the 'Parable of the Sower'?"},
    {
        "role": "ai",
        "content": (
            "The 'Parable of the Sower' is a biblical parable that Butler uses as a"
            " metaphor in the book. In the parable, a sower scatters seeds, some of"
            " which fall on fertile ground and grow, while others fall on rocky ground"
            " or among thorns and fail to grow. The parable is used to illustrate the"
            " importance of receptivity and preparedness in the face of change."
        ),
    },
    {"role": "human", "content": "What is Butler's writing style like?"},
    {
        "role": "ai",
        "content": (
            "Butler's writing style is known for its clarity, directness, and"
            " psychological insight. Her narratives often involve complex, diverse"
            " characters and explore themes of race, gender, and power."
        ),
    },
    {"role": "human", "content": "What other books has she written?"},
    {
        "role": "ai",
        "content": (
            "In addition to 'Parable of the Sower', Butler has written several other"
            " notable works, including 'Kindred', 'Dawn', and 'Parable of the Talents'."
        ),
    },
]

for msg in test_history:
    zep_memory.chat_memory.add_message(
        HumanMessage(content=msg["content"])
        if msg["role"] == "human"
        else AIMessage(content=msg["content"])
    )

time.sleep(
    10
)  # Wait for the messages to be embedded and summarized. Speed depends on OpenAI API latency and your rate limits.
```

### Utilizar el Retriever de Zep para realizar una búsqueda vectorial sobre la memoria de Zep

Zep proporciona búsqueda vectorial nativa sobre la memoria de conversaciones históricas. El incrustado ocurre automáticamente.

NOTA: El incrustado de mensajes se produce de forma asincrónica, por lo que la primera consulta puede no devolver resultados. Las consultas posteriores devolverán resultados a medida que se generen los incrustados.

```python
from langchain_community.retrievers.zep import SearchScope, SearchType, ZepRetriever

zep_retriever = ZepRetriever(
    session_id=session_id,  # Ensure that you provide the session_id when instantiating the Retriever
    url=ZEP_API_URL,
    top_k=5,
    api_key=zep_api_key,
)

await zep_retriever.ainvoke("Who wrote Parable of the Sower?")
```

```output
[Document(page_content="What is the 'Parable of the Sower'?", metadata={'score': 0.9250216484069824, 'uuid': '4cbfb1c0-6027-4678-af43-1e18acb224bb', 'created_at': '2023-11-01T00:32:40.224256Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 34, 'Start': 13, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}]}}, 'token_count': 13}),
 Document(page_content='Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.', metadata={'score': 0.8897348046302795, 'uuid': '3dd9f5ed-9dc9-4427-9da6-aba1b8278a5c', 'created_at': '2023-11-01T00:32:40.192527Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'GPE', 'Matches': [{'End': 20, 'Start': 15, 'Text': 'Sower'}], 'Name': 'Sower'}, {'Label': 'PERSON', 'Matches': [{'End': 65, 'Start': 51, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}, {'Label': 'DATE', 'Matches': [{'End': 84, 'Start': 80, 'Text': '1993'}], 'Name': '1993'}, {'Label': 'PERSON', 'Matches': [{'End': 124, 'Start': 110, 'Text': 'Lauren Olamina'}], 'Name': 'Lauren Olamina'}], 'intent': 'Providing information'}}, 'token_count': 56}),
 Document(page_content="Write a short synopsis of Butler's book, Parable of the Sower. What is it about?", metadata={'score': 0.8856019973754883, 'uuid': '81761dcb-38f3-4686-a4f5-6cb1007eaf29', 'created_at': '2023-11-01T00:32:40.187543Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'entities': [{'Label': 'ORG', 'Matches': [{'End': 32, 'Start': 26, 'Text': 'Butler'}], 'Name': 'Butler'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 61, 'Start': 41, 'Text': 'Parable of the Sower'}], 'Name': 'Parable of the Sower'}], 'intent': "The subject is asking for a brief summary of Butler's book, Parable of the Sower, and what it is about."}}, 'token_count': 23}),
 Document(page_content="The 'Parable of the Sower' is a biblical parable that Butler uses as a metaphor in the book. In the parable, a sower scatters seeds, some of which fall on fertile ground and grow, while others fall on rocky ground or among thorns and fail to grow. The parable is used to illustrate the importance of receptivity and preparedness in the face of change.", metadata={'score': 0.8781436681747437, 'uuid': '1a8c5f99-2fec-425d-bc37-176ab91e7080', 'created_at': '2023-11-01T00:32:40.22836Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 26, 'Start': 5, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}, {'Label': 'ORG', 'Matches': [{'End': 60, 'Start': 54, 'Text': 'Butler'}], 'Name': 'Butler'}]}}, 'token_count': 84}),
 Document(page_content="In addition to 'Parable of the Sower', Butler has written several other notable works, including 'Kindred', 'Dawn', and 'Parable of the Talents'.", metadata={'score': 0.8745182752609253, 'uuid': '45d8aa08-85ab-432f-8902-81712fe363b9', 'created_at': '2023-11-01T00:32:40.245081Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 37, 'Start': 16, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}, {'Label': 'ORG', 'Matches': [{'End': 45, 'Start': 39, 'Text': 'Butler'}], 'Name': 'Butler'}, {'Label': 'GPE', 'Matches': [{'End': 105, 'Start': 98, 'Text': 'Kindred'}], 'Name': 'Kindred'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 144, 'Start': 121, 'Text': "Parable of the Talents'"}], 'Name': "Parable of the Talents'"}]}}, 'token_count': 39})]
```

También podemos usar la API sincrónica de Zep para recuperar los resultados:

```python
zep_retriever.invoke("Who wrote Parable of the Sower?")
```

```output
[Document(page_content="What is the 'Parable of the Sower'?", metadata={'score': 0.9250596761703491, 'uuid': '4cbfb1c0-6027-4678-af43-1e18acb224bb', 'created_at': '2023-11-01T00:32:40.224256Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 34, 'Start': 13, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}]}}, 'token_count': 13}),
 Document(page_content='Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.', metadata={'score': 0.8897120952606201, 'uuid': '3dd9f5ed-9dc9-4427-9da6-aba1b8278a5c', 'created_at': '2023-11-01T00:32:40.192527Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'GPE', 'Matches': [{'End': 20, 'Start': 15, 'Text': 'Sower'}], 'Name': 'Sower'}, {'Label': 'PERSON', 'Matches': [{'End': 65, 'Start': 51, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}, {'Label': 'DATE', 'Matches': [{'End': 84, 'Start': 80, 'Text': '1993'}], 'Name': '1993'}, {'Label': 'PERSON', 'Matches': [{'End': 124, 'Start': 110, 'Text': 'Lauren Olamina'}], 'Name': 'Lauren Olamina'}], 'intent': 'Providing information'}}, 'token_count': 56}),
 Document(page_content="Write a short synopsis of Butler's book, Parable of the Sower. What is it about?", metadata={'score': 0.885666012763977, 'uuid': '81761dcb-38f3-4686-a4f5-6cb1007eaf29', 'created_at': '2023-11-01T00:32:40.187543Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'entities': [{'Label': 'ORG', 'Matches': [{'End': 32, 'Start': 26, 'Text': 'Butler'}], 'Name': 'Butler'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 61, 'Start': 41, 'Text': 'Parable of the Sower'}], 'Name': 'Parable of the Sower'}], 'intent': "The subject is asking for a brief summary of Butler's book, Parable of the Sower, and what it is about."}}, 'token_count': 23}),
 Document(page_content="The 'Parable of the Sower' is a biblical parable that Butler uses as a metaphor in the book. In the parable, a sower scatters seeds, some of which fall on fertile ground and grow, while others fall on rocky ground or among thorns and fail to grow. The parable is used to illustrate the importance of receptivity and preparedness in the face of change.", metadata={'score': 0.878172755241394, 'uuid': '1a8c5f99-2fec-425d-bc37-176ab91e7080', 'created_at': '2023-11-01T00:32:40.22836Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 26, 'Start': 5, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}, {'Label': 'ORG', 'Matches': [{'End': 60, 'Start': 54, 'Text': 'Butler'}], 'Name': 'Butler'}]}}, 'token_count': 84}),
 Document(page_content="In addition to 'Parable of the Sower', Butler has written several other notable works, including 'Kindred', 'Dawn', and 'Parable of the Talents'.", metadata={'score': 0.8745154142379761, 'uuid': '45d8aa08-85ab-432f-8902-81712fe363b9', 'created_at': '2023-11-01T00:32:40.245081Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 37, 'Start': 16, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}, {'Label': 'ORG', 'Matches': [{'End': 45, 'Start': 39, 'Text': 'Butler'}], 'Name': 'Butler'}, {'Label': 'GPE', 'Matches': [{'End': 105, 'Start': 98, 'Text': 'Kindred'}], 'Name': 'Kindred'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 144, 'Start': 121, 'Text': "Parable of the Talents'"}], 'Name': "Parable of the Talents'"}]}}, 'token_count': 39})]
```

### Reordenamiento utilizando MMR (Relevancia Marginal Máxima)

Zep tiene soporte nativo y acelerado por SIMD para reordenar los resultados utilizando MMR. Esto es útil para eliminar la redundancia en los resultados.

```python
zep_retriever = ZepRetriever(
    session_id=session_id,  # Ensure that you provide the session_id when instantiating the Retriever
    url=ZEP_API_URL,
    top_k=5,
    api_key=zep_api_key,
    search_type=SearchType.mmr,
    mmr_lambda=0.5,
)

await zep_retriever.ainvoke("Who wrote Parable of the Sower?")
```

```output
[Document(page_content="What is the 'Parable of the Sower'?", metadata={'score': 0.9250596761703491, 'uuid': '4cbfb1c0-6027-4678-af43-1e18acb224bb', 'created_at': '2023-11-01T00:32:40.224256Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 34, 'Start': 13, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}]}}, 'token_count': 13}),
 Document(page_content='What other books has she written?', metadata={'score': 0.77488774061203, 'uuid': '1b3c5079-9cab-46f3-beae-fb56c572e0fd', 'created_at': '2023-11-01T00:32:40.240135Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'token_count': 9}),
 Document(page_content="In addition to 'Parable of the Sower', Butler has written several other notable works, including 'Kindred', 'Dawn', and 'Parable of the Talents'.", metadata={'score': 0.8745154142379761, 'uuid': '45d8aa08-85ab-432f-8902-81712fe363b9', 'created_at': '2023-11-01T00:32:40.245081Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 37, 'Start': 16, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}, {'Label': 'ORG', 'Matches': [{'End': 45, 'Start': 39, 'Text': 'Butler'}], 'Name': 'Butler'}, {'Label': 'GPE', 'Matches': [{'End': 105, 'Start': 98, 'Text': 'Kindred'}], 'Name': 'Kindred'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 144, 'Start': 121, 'Text': "Parable of the Talents'"}], 'Name': "Parable of the Talents'"}]}}, 'token_count': 39}),
 Document(page_content='Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.', metadata={'score': 0.8897120952606201, 'uuid': '3dd9f5ed-9dc9-4427-9da6-aba1b8278a5c', 'created_at': '2023-11-01T00:32:40.192527Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'GPE', 'Matches': [{'End': 20, 'Start': 15, 'Text': 'Sower'}], 'Name': 'Sower'}, {'Label': 'PERSON', 'Matches': [{'End': 65, 'Start': 51, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}, {'Label': 'DATE', 'Matches': [{'End': 84, 'Start': 80, 'Text': '1993'}], 'Name': '1993'}, {'Label': 'PERSON', 'Matches': [{'End': 124, 'Start': 110, 'Text': 'Lauren Olamina'}], 'Name': 'Lauren Olamina'}], 'intent': 'Providing information'}}, 'token_count': 56}),
 Document(page_content='Who is the protagonist?', metadata={'score': 0.7858647704124451, 'uuid': 'ee514b37-a0b0-4d24-b0c9-3e9f8ad9d52d', 'created_at': '2023-11-01T00:32:40.203891Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'intent': 'The subject is asking about the identity of the protagonist in a specific context, such as a story, movie, or game.'}}, 'token_count': 7})]
```

### Utilizar filtros de metadatos para refinar los resultados de búsqueda

Zep admite el filtrado de resultados por metadatos. Esto es útil para filtrar los resultados por tipo de entidad u otros metadatos.

Más información aquí: https://docs.getzep.com/sdk/search_query/

```python
filter = {"where": {"jsonpath": '$[*] ? (@.Label == "WORK_OF_ART")'}}

await zep_retriever.ainvoke("Who wrote Parable of the Sower?", metadata=filter)
```

```output
[Document(page_content="What is the 'Parable of the Sower'?", metadata={'score': 0.9251098036766052, 'uuid': '4cbfb1c0-6027-4678-af43-1e18acb224bb', 'created_at': '2023-11-01T00:32:40.224256Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 34, 'Start': 13, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}]}}, 'token_count': 13}),
 Document(page_content='What other books has she written?', metadata={'score': 0.7747920155525208, 'uuid': '1b3c5079-9cab-46f3-beae-fb56c572e0fd', 'created_at': '2023-11-01T00:32:40.240135Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'token_count': 9}),
 Document(page_content="In addition to 'Parable of the Sower', Butler has written several other notable works, including 'Kindred', 'Dawn', and 'Parable of the Talents'.", metadata={'score': 0.8745266795158386, 'uuid': '45d8aa08-85ab-432f-8902-81712fe363b9', 'created_at': '2023-11-01T00:32:40.245081Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'WORK_OF_ART', 'Matches': [{'End': 37, 'Start': 16, 'Text': "Parable of the Sower'"}], 'Name': "Parable of the Sower'"}, {'Label': 'ORG', 'Matches': [{'End': 45, 'Start': 39, 'Text': 'Butler'}], 'Name': 'Butler'}, {'Label': 'GPE', 'Matches': [{'End': 105, 'Start': 98, 'Text': 'Kindred'}], 'Name': 'Kindred'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 144, 'Start': 121, 'Text': "Parable of the Talents'"}], 'Name': "Parable of the Talents'"}]}}, 'token_count': 39}),
 Document(page_content='Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.', metadata={'score': 0.8897372484207153, 'uuid': '3dd9f5ed-9dc9-4427-9da6-aba1b8278a5c', 'created_at': '2023-11-01T00:32:40.192527Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'ai', 'metadata': {'system': {'entities': [{'Label': 'GPE', 'Matches': [{'End': 20, 'Start': 15, 'Text': 'Sower'}], 'Name': 'Sower'}, {'Label': 'PERSON', 'Matches': [{'End': 65, 'Start': 51, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}, {'Label': 'DATE', 'Matches': [{'End': 84, 'Start': 80, 'Text': '1993'}], 'Name': '1993'}, {'Label': 'PERSON', 'Matches': [{'End': 124, 'Start': 110, 'Text': 'Lauren Olamina'}], 'Name': 'Lauren Olamina'}], 'intent': 'Providing information'}}, 'token_count': 56}),
 Document(page_content='Who is the protagonist?', metadata={'score': 0.7858127355575562, 'uuid': 'ee514b37-a0b0-4d24-b0c9-3e9f8ad9d52d', 'created_at': '2023-11-01T00:32:40.203891Z', 'updated_at': '0001-01-01T00:00:00Z', 'role': 'human', 'metadata': {'system': {'intent': 'The subject is asking about the identity of the protagonist in a specific context, such as a story, movie, or game.'}}, 'token_count': 7})]
```

### Buscar en resúmenes con reordenamiento MMR

Zep genera automáticamente resúmenes de los mensajes de chat. Estos resúmenes se pueden buscar utilizando el Retriever de Zep. Dado que un resumen es una destilación de una conversación, es más probable que coincida con tu consulta de búsqueda y ofrezca un contexto rico y conciso al LLM.

Los resúmenes sucesivos pueden incluir contenido similar, y la búsqueda de similitud de Zep devuelve los resultados que más coinciden, pero con poca diversidad.
El reordenamiento MMR reordena los resultados para asegurarse de que los resúmenes que se incorporen a tu solicitud sean tanto relevantes como cada uno ofrezca información adicional al LLM.

```python
zep_retriever = ZepRetriever(
    session_id=session_id,  # Ensure that you provide the session_id when instantiating the Retriever
    url=ZEP_API_URL,
    top_k=3,
    api_key=zep_api_key,
    search_scope=SearchScope.summary,
    search_type=SearchType.mmr,
    mmr_lambda=0.5,
)

await zep_retriever.ainvoke("Who wrote Parable of the Sower?")
```

```output
[Document(page_content='The human asks about Octavia Butler and the AI informs them that she was an American science fiction author. The human\nasks which of her books were made into movies and the AI mentions the FX series Kindred. The human then asks about her\ncontemporaries and the AI lists Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ. The human also asks about the awards\nshe won and the AI mentions the Hugo Award, the Nebula Award, and the MacArthur Fellowship. The human asks about other women sci-fi writers to read and the AI suggests Ursula K. Le Guin and Joanna Russ. The human then asks for a synopsis of Butler\'s book "Parable of the Sower" and the AI describes it.', metadata={'score': 0.7882999777793884, 'uuid': '3c95a29a-52dc-4112-b8a7-e6b1dc414d45', 'created_at': '2023-11-01T00:32:47.76449Z', 'token_count': 155}),
 Document(page_content='The human asks about Octavia Butler. The AI informs the human that Octavia Estelle Butler was an American science \nfiction author. The human then asks which books of hers were made into movies and the AI mentions the FX series Kindred, \nbased on her novel of the same name.', metadata={'score': 0.7407922744750977, 'uuid': '0e027f4d-d71f-42ae-977f-696b8948b8bf', 'created_at': '2023-11-01T00:32:41.637098Z', 'token_count': 59}),
 Document(page_content='The human asks about Octavia Butler and the AI informs them that she was an American science fiction author. The human\nasks which of her books were made into movies and the AI mentions the FX series Kindred. The human then asks about her\ncontemporaries and the AI lists Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ. The human also asks about the awards\nshe won and the AI mentions the Hugo Award, the Nebula Award, and the MacArthur Fellowship.', metadata={'score': 0.7436535358428955, 'uuid': 'b3500d1b-1a78-4aef-9e24-6b196cfa83cb', 'created_at': '2023-11-01T00:32:44.24744Z', 'token_count': 104})]
```
