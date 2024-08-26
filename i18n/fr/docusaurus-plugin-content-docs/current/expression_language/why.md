---
sidebar_position: 0.5
title: Avantages de LCEL
translated: true
---

import { ColumnContainer, Column } from "@theme/Columns";

:::tip
Nous vous recommandons de lire d'abord la section [Démarrage](/docs/expression_language/get_started) de LCEL.
:::

LCEL est conçu pour simplifier le processus de construction d'applications utiles avec les LLM et combiner les composants connexes. Il le fait en fournissant :

1. **Une interface unifiée** : Chaque objet LCEL implémente l'interface `Runnable`, qui définit un ensemble commun de méthodes d'invocation (`invoke`, `batch`, `stream`, `ainvoke`, ...). Cela permet aux chaînes d'objets LCEL de prendre en charge automatiquement des opérations utiles comme le traitement par lots et le streaming des étapes intermédiaires, car chaque chaîne d'objets LCEL est elle-même un objet LCEL.
2. **Primitives de composition** : LCEL fournit un certain nombre de primitives qui facilitent la composition des chaînes, la parallélisation des composants, l'ajout de solutions de secours, la configuration dynamique des internaux de la chaîne, et plus encore.

Pour mieux comprendre la valeur de LCEL, il est utile de le voir en action et de réfléchir à la façon dont nous pourrions recréer une fonctionnalité similaire sans lui. Dans ce didacticiel, nous allons faire exactement cela avec notre [exemple de base](/docs/expression_language/get_started#basic_example) de la section de démarrage. Nous allons prendre notre simple chaîne d'invocation de modèle et de prompt, qui définit déjà beaucoup de fonctionnalités en interne, et voir ce qu'il faudrait pour tout recréer.

```python
%pip install --upgrade --quiet  langchain-core langchain-openai langchain-anthropic
```

## Invoke

Dans le cas le plus simple, nous voulons simplement passer une chaîne de sujet et obtenir une chaîne de blague :

<ColumnContainer>

<Column>

#### Sans LCEL

```python
from typing import List

import openai


prompt_template = "Tell me a short joke about {topic}"
client = openai.OpenAI()

def call_chat_model(messages: List[dict]) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    return response.choices[0].message.content

def invoke_chain(topic: str) -> str:
    prompt_value = prompt_template.format(topic=topic)
    messages = [{"role": "user", "content": prompt_value}]
    return call_chat_model(messages)

invoke_chain("ice cream")
```

</Column>

<Column>

#### LCEL

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


prompt = ChatPromptTemplate.from_template(
    "Tell me a short joke about {topic}"
)
output_parser = StrOutputParser()
model = ChatOpenAI(model="gpt-3.5-turbo")
chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | model
    | output_parser
)

chain.invoke("ice cream")
```

</Column>
</ColumnContainer>

## Stream

Si nous voulons diffuser les résultats, nous devrons modifier notre fonction :

<ColumnContainer>
<Column>

#### Sans LCEL

```python
from typing import Iterator


def stream_chat_model(messages: List[dict]) -> Iterator[str]:
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True,
    )
    for response in stream:
        content = response.choices[0].delta.content
        if content is not None:
            yield content

def stream_chain(topic: str) -> Iterator[str]:
    prompt_value = prompt.format(topic=topic)
    return stream_chat_model([{"role": "user", "content": prompt_value}])


for chunk in stream_chain("ice cream"):
    print(chunk, end="", flush=True)
```

</Column>

<Column>

#### LCEL

```python
for chunk in chain.stream("ice cream"):
    print(chunk, end="", flush=True)
```

</Column>
</ColumnContainer>

## Batch

Si nous voulons exécuter sur un lot d'entrées en parallèle, nous aurons à nouveau besoin d'une nouvelle fonction :

<ColumnContainer>
<Column>

#### Sans LCEL

```python
from concurrent.futures import ThreadPoolExecutor


def batch_chain(topics: list) -> list:
    with ThreadPoolExecutor(max_workers=5) as executor:
        return list(executor.map(invoke_chain, topics))

batch_chain(["ice cream", "spaghetti", "dumplings"])
```

</Column>

<Column>

#### LCEL

```python
chain.batch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## Async

Si nous avons besoin d'une version asynchrone :

<ColumnContainer>
<Column>

#### Sans LCEL

```python
async_client = openai.AsyncOpenAI()

async def acall_chat_model(messages: List[dict]) -> str:
    response = await async_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    return response.choices[0].message.content

async def ainvoke_chain(topic: str) -> str:
    prompt_value = prompt_template.format(topic=topic)
    messages = [{"role": "user", "content": prompt_value}]
    return await acall_chat_model(messages)


await ainvoke_chain("ice cream")
```

</Column>

<Column>

#### LCEL

```python
await chain.ainvoke("ice cream")
```

</Column>
</ColumnContainer>

## Batch asynchrone

<ColumnContainer>
<Column>

#### Sans LCEL

```python
import asyncio
import openai


async def abatch_chain(topics: list) -> list:
    coros = map(ainvoke_chain, topics)
    return await asyncio.gather(*coros)


await abatch_chain(["ice cream", "spaghetti", "dumplings"])
```

</Column>

<Column>

#### LCEL

```python
await chain.abatch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## LLM au lieu du modèle de chat

Si nous voulons utiliser un point de terminaison de complétion au lieu d'un point de terminaison de chat :

<ColumnContainer>
<Column>

#### Sans LCEL

```python
def call_llm(prompt_value: str) -> str:
    response = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=prompt_value,
    )
    return response.choices[0].text

def invoke_llm_chain(topic: str) -> str:
    prompt_value = prompt_template.format(topic=topic)
    return call_llm(prompt_value)

invoke_llm_chain("ice cream")
```

</Column>

<Column>

#### LCEL

```python
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct")
llm_chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | llm
    | output_parser
)

llm_chain.invoke("ice cream")
```

</Column>
</ColumnContainer>

## Différent fournisseur de modèle

Si nous voulons utiliser Anthropic au lieu d'OpenAI :

<ColumnContainer>
<Column>

#### Sans LCEL

```python
import anthropic

anthropic_template = f"Human:\n\n{prompt_template}\n\nAssistant:"
anthropic_client = anthropic.Anthropic()

def call_anthropic(prompt_value: str) -> str:
    response = anthropic_client.completions.create(
        model="claude-2",
        prompt=prompt_value,
        max_tokens_to_sample=256,
    )
    return response.completion

def invoke_anthropic_chain(topic: str) -> str:
    prompt_value = anthropic_template.format(topic=topic)
    return call_anthropic(prompt_value)

invoke_anthropic_chain("ice cream")
```

</Column>

<Column>

#### LCEL

```python
from langchain_anthropic import ChatAnthropic

anthropic = ChatAnthropic(model="claude-2")
anthropic_chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | anthropic
    | output_parser
)

anthropic_chain.invoke("ice cream")
```

</Column>
</ColumnContainer>

## Configurabilité d'exécution

Si nous voulions rendre le choix du modèle de chat ou du LLM configurable au moment de l'exécution :

<ColumnContainer>
<Column>

#### Sans LCEL

```python
def invoke_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> str:
    if model == "chat_openai":
        return invoke_chain(topic)
    elif model == "openai":
        return invoke_llm_chain(topic)
    elif model == "anthropic":
        return invoke_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def stream_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> Iterator[str]:
    if model == "chat_openai":
        return stream_chain(topic)
    elif model == "openai":
        # Note we haven't implemented this yet.
        return stream_llm_chain(topic)
    elif model == "anthropic":
        # Note we haven't implemented this yet
        return stream_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def batch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    # You get the idea
    ...

async def abatch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    ...

invoke_configurable_chain("ice cream", model="openai")
stream = stream_configurable_chain(
    "ice_cream",
    model="anthropic"
)
for chunk in stream:
    print(chunk, end="", flush=True)

# batch_configurable_chain(["ice cream", "spaghetti", "dumplings"])
# await ainvoke_configurable_chain("ice cream")
```

</Column>

<Column>

#### Avec LCEL

```python
from langchain_core.runnables import ConfigurableField


configurable_model = model.configurable_alternatives(
    ConfigurableField(id="model"),
    default_key="chat_openai",
    openai=llm,
    anthropic=anthropic,
)
configurable_chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | configurable_model
    | output_parser
)
```

```python
configurable_chain.invoke(
    "ice cream",
    config={"model": "openai"}
)
stream = configurable_chain.stream(
    "ice cream",
    config={"model": "anthropic"}
)
for chunk in stream:
    print(chunk, end="", flush=True)

configurable_chain.batch(["ice cream", "spaghetti", "dumplings"])

# await configurable_chain.ainvoke("ice cream")
```

</Column>
</ColumnContainer>

## Journalisation

Si nous voulons journaliser nos résultats intermédiaires :

<ColumnContainer>
<Column>

#### Sans LCEL

Nous `imprimerons` les étapes intermédiaires à des fins d'illustration

```python
def invoke_anthropic_chain_with_logging(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = anthropic_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    output = call_anthropic(prompt_value)
    print(f"Output: {output}")
    return output

invoke_anthropic_chain_with_logging("ice cream")
```

</Column>

<Column>

#### LCEL

Chaque composant a des intégrations intégrées avec LangSmith. Si nous définissons les deux variables d'environnement suivantes, toutes les traces de la chaîne sont journalisées dans LangSmith.

```python
import os

os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"

anthropic_chain.invoke("ice cream")
```

Voici à quoi ressemble notre trace LangSmith : https://smith.langchain.com/public/e4de52f8-bcd9-4732-b950-deee4b04e313/r

</Column>
</ColumnContainer>

## Solutions de secours

Si nous voulions ajouter une logique de secours, au cas où une API de modèle serait indisponible :

<ColumnContainer>
<Column>

#### Sans LCEL

```python
def invoke_chain_with_fallback(topic: str) -> str:
    try:
        return invoke_chain(topic)
    except Exception:
        return invoke_anthropic_chain(topic)

async def ainvoke_chain_with_fallback(topic: str) -> str:
    try:
        return await ainvoke_chain(topic)
    except Exception:
        # Note: we haven't actually implemented this.
        return await ainvoke_anthropic_chain(topic)

async def batch_chain_with_fallback(topics: List[str]) -> str:
    try:
        return batch_chain(topics)
    except Exception:
        # Note: we haven't actually implemented this.
        return batch_anthropic_chain(topics)

invoke_chain_with_fallback("ice cream")
# await ainvoke_chain_with_fallback("ice cream")
batch_chain_with_fallback(["ice cream", "spaghetti", "dumplings"]))
```

</Column>

<Column>

#### LCEL

```python
fallback_chain = chain.with_fallbacks([anthropic_chain])

fallback_chain.invoke("ice cream")
# await fallback_chain.ainvoke("ice cream")
fallback_chain.batch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## Comparaison du code complet

Même dans ce cas simple, notre chaîne LCEL condense beaucoup de fonctionnalités. À mesure que les chaînes deviennent plus complexes, cela devient particulièrement précieux.

<ColumnContainer>
<Column>

#### Sans LCEL

```python
from concurrent.futures import ThreadPoolExecutor
from typing import Iterator, List, Tuple

import anthropic
import openai


prompt_template = "Tell me a short joke about {topic}"
anthropic_template = f"Human:\n\n{prompt_template}\n\nAssistant:"
client = openai.OpenAI()
async_client = openai.AsyncOpenAI()
anthropic_client = anthropic.Anthropic()

def call_chat_model(messages: List[dict]) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    return response.choices[0].message.content

def invoke_chain(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = prompt_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    messages = [{"role": "user", "content": prompt_value}]
    output = call_chat_model(messages)
    print(f"Output: {output}")
    return output

def stream_chat_model(messages: List[dict]) -> Iterator[str]:
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True,
    )
    for response in stream:
        content = response.choices[0].delta.content
        if content is not None:
            yield content

def stream_chain(topic: str) -> Iterator[str]:
    print(f"Input: {topic}")
    prompt_value = prompt.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    stream = stream_chat_model([{"role": "user", "content": prompt_value}])
    for chunk in stream:
        print(f"Token: {chunk}", end="")
        yield chunk

def batch_chain(topics: list) -> list:
    with ThreadPoolExecutor(max_workers=5) as executor:
        return list(executor.map(invoke_chain, topics))

def call_llm(prompt_value: str) -> str:
    response = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=prompt_value,
    )
    return response.choices[0].text

def invoke_llm_chain(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = promtp_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    output = call_llm(prompt_value)
    print(f"Output: {output}")
    return output

def call_anthropic(prompt_value: str) -> str:
    response = anthropic_client.completions.create(
        model="claude-2",
        prompt=prompt_value,
        max_tokens_to_sample=256,
    )
    return response.completion

def invoke_anthropic_chain(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = anthropic_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    output = call_anthropic(prompt_value)
    print(f"Output: {output}")
    return output

async def ainvoke_anthropic_chain(topic: str) -> str:
    ...

def stream_anthropic_chain(topic: str) -> Iterator[str]:
    ...

def batch_anthropic_chain(topics: List[str]) -> List[str]:
    ...

def invoke_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> str:
    if model == "chat_openai":
        return invoke_chain(topic)
    elif model == "openai":
        return invoke_llm_chain(topic)
    elif model == "anthropic":
        return invoke_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def stream_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> Iterator[str]:
    if model == "chat_openai":
        return stream_chain(topic)
    elif model == "openai":
        # Note we haven't implemented this yet.
        return stream_llm_chain(topic)
    elif model == "anthropic":
        # Note we haven't implemented this yet
        return stream_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def batch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    ...

async def abatch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    ...

def invoke_chain_with_fallback(topic: str) -> str:
    try:
        return invoke_chain(topic)
    except Exception:
        return invoke_anthropic_chain(topic)

async def ainvoke_chain_with_fallback(topic: str) -> str:
    try:
        return await ainvoke_chain(topic)
    except Exception:
        return await ainvoke_anthropic_chain(topic)

async def batch_chain_with_fallback(topics: List[str]) -> str:
    try:
        return batch_chain(topics)
    except Exception:
        return batch_anthropic_chain(topics)
```

</Column>

<Column>

#### LCEL

```python
import os

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, ConfigurableField

os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"

prompt = ChatPromptTemplate.from_template(
    "Tell me a short joke about {topic}"
)
chat_openai = ChatOpenAI(model="gpt-3.5-turbo")
openai = OpenAI(model="gpt-3.5-turbo-instruct")
anthropic = ChatAnthropic(model="claude-2")
model = (
    chat_openai
    .with_fallbacks([anthropic])
    .configurable_alternatives(
        ConfigurableField(id="model"),
        default_key="chat_openai",
        openai=openai,
        anthropic=anthropic,
    )
)

chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

</Column>
</ColumnContainer>

## Prochaines étapes

Pour continuer à apprendre sur LCEL, nous vous recommandons :
- Lire l'interface LCEL complète (/docs/expression_language/interface), que nous n'avons que partiellement couverte ici.
- Explorer les primitives (/docs/expression_language/primitives) pour en savoir plus sur ce que LCEL fournit.
