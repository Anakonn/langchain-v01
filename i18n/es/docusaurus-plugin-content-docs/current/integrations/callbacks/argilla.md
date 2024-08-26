---
translated: true
---

# Argilla

>[Argilla](https://argilla.io/) es una plataforma de curación de datos de código abierto para LLM.
> Usando Argilla, todos pueden construir modelos de lenguaje robustos a través de una curación de datos más rápida
> utilizando tanto comentarios humanos como de máquina. Brindamos soporte para cada paso del ciclo de MLOps,
> desde el etiquetado de datos hasta el monitoreo de modelos.

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/argilla.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

En esta guía demostraremos cómo rastrear las entradas y respuestas de tu LLM para generar un conjunto de datos en Argilla, usando el `ArgillaCallbackHandler`.

Es útil mantener un seguimiento de las entradas y salidas de tus LLM para generar conjuntos de datos para futuros ajustes finos. Esto es especialmente útil cuando estás usando un LLM para generar datos para una tarea específica, como respuesta a preguntas, resumen o traducción.

## Instalación y configuración

```python
%pip install --upgrade --quiet  langchain langchain-openai argilla
```

### Obtener credenciales de API

Para obtener las credenciales de la API de Argilla, sigue los siguientes pasos:

1. Ve a tu interfaz de usuario de Argilla.
2. Haz clic en tu imagen de perfil y ve a "Mis ajustes".
3. Luego copia la clave API.

En Argilla, la URL de la API será la misma que la URL de tu interfaz de usuario de Argilla.

Para obtener las credenciales de la API de OpenAI, visita https://platform.openai.com/account/api-keys

```python
import os

os.environ["ARGILLA_API_URL"] = "..."
os.environ["ARGILLA_API_KEY"] = "..."

os.environ["OPENAI_API_KEY"] = "..."
```

### Configurar Argilla

Para usar el `ArgillaCallbackHandler`, necesitaremos crear un nuevo `FeedbackDataset` en Argilla para hacer un seguimiento de tus experimentos con LLM. Para hacerlo, usa el siguiente código:

```python
import argilla as rg
```

```python
from packaging.version import parse as parse_version

if parse_version(rg.__version__) < parse_version("1.8.0"):
    raise RuntimeError(
        "`FeedbackDataset` is only available in Argilla v1.8.0 or higher, please "
        "upgrade `argilla` as `pip install argilla --upgrade`."
    )
```

```python
dataset = rg.FeedbackDataset(
    fields=[
        rg.TextField(name="prompt"),
        rg.TextField(name="response"),
    ],
    questions=[
        rg.RatingQuestion(
            name="response-rating",
            description="How would you rate the quality of the response?",
            values=[1, 2, 3, 4, 5],
            required=True,
        ),
        rg.TextQuestion(
            name="response-feedback",
            description="What feedback do you have for the response?",
            required=False,
        ),
    ],
    guidelines="You're asked to rate the quality of the response and provide feedback.",
)

rg.init(
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)

dataset.push_to_argilla("langchain-dataset")
```

> 📌 NOTA: por el momento, solo se admiten los pares de solicitud-respuesta como `FeedbackDataset.fields`, por lo que el `ArgillaCallbackHandler` solo rastreará la solicitud, es decir, la entrada del LLM, y la respuesta, es decir, la salida del LLM.

## Seguimiento

Para usar el `ArgillaCallbackHandler`, puedes usar el siguiente código o simplemente reproducir uno de los ejemplos presentados en las siguientes secciones.

```python
from langchain_community.callbacks.argilla_callback import ArgillaCallbackHandler

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
```

### Escenario 1: Seguimiento de un LLM

Primero, ejecutemos un solo LLM unas cuantas veces y capturemos los pares de solicitud-respuesta resultantes en Argilla.

```python
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]

llm = OpenAI(temperature=0.9, callbacks=callbacks)
llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

![Interfaz de usuario de Argilla con entrada-respuesta de LangChain LLM](https://docs.argilla.io/en/latest/_images/llm.png)

### Escenario 2: Seguimiento de un LLM en una cadena

Luego, podemos crear una cadena usando una plantilla de solicitud y luego rastrear la solicitud inicial y la respuesta final en Argilla.

```python
from langchain.chains import LLMChain
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [{"title": "Documentary about Bigfoot in Paris"}]
synopsis_chain.apply(test_prompts)
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: Documentary about Bigfoot in Paris
Playwright: This is a synopsis for the above play:[0m

[1m> Finished chain.[0m
```

```output
[{'text': "\n\nDocumentary about Bigfoot in Paris focuses on the story of a documentary filmmaker and their search for evidence of the legendary Bigfoot creature in the city of Paris. The play follows the filmmaker as they explore the city, meeting people from all walks of life who have had encounters with the mysterious creature. Through their conversations, the filmmaker unravels the story of Bigfoot and finds out the truth about the creature's presence in Paris. As the story progresses, the filmmaker learns more and more about the mysterious creature, as well as the different perspectives of the people living in the city, and what they think of the creature. In the end, the filmmaker's findings lead them to some surprising and heartwarming conclusions about the creature's existence and the importance it holds in the lives of the people in Paris."}]
```

![Interfaz de usuario de Argilla con entrada-respuesta de la cadena de LangChain](https://docs.argilla.io/en/latest/_images/chain.png)

### Escenario 3: Uso de un agente con herramientas

Finalmente, como un flujo de trabajo más avanzado, puedes crear un agente que use algunas herramientas. Entonces, el `ArgillaCallbackHandler` mantendrá un seguimiento de la entrada y la salida, pero no de los pasos/pensamientos intermedios, de modo que, dado un prompt, registremos el prompt original y la respuesta final a ese prompt dado.

> Tenga en cuenta que para este escenario estaremos usando la API de Google Search (Serp API), por lo que deberá instalar `google-search-results` como `pip install google-search-results` y establecer la clave de la API de Serp como `os.environ["SERPAPI_API_KEY"] = "..."` (puede encontrarla en https://serpapi.com/dashboard), de lo contrario el ejemplo a continuación no funcionará.

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

tools = load_tools(["serpapi"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run("Who was the first president of the United States of America?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to answer a historical question
Action: Search
Action Input: "who was the first president of the United States of America" [0m
Observation: [36;1m[1;3mGeorge Washington[0m
Thought:[32;1m[1;3m George Washington was the first president
Final Answer: George Washington was the first president of the United States of America.[0m

[1m> Finished chain.[0m
```

```output
'George Washington was the first president of the United States of America.'
```

![Interfaz de usuario de Argilla con entrada-respuesta del agente de LangChain](https://docs.argilla.io/en/latest/_images/agent.png)
