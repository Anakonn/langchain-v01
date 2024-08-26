---
keywords:
- ConfigurableField
- configurable_fields
- ConfigurableAlternatives
- configurable_alternatives
- LCEL
sidebar_position: 7
title: Configurer les internals de la chaîne d'exécution
translated: true
---

# Configurer les internals de la chaîne d'exécution à l'exécution

Souvent, vous voudrez expérimenter ou même exposer à l'utilisateur final, plusieurs façons différentes de faire les choses.
Afin de rendre cette expérience aussi facile que possible, nous avons défini deux méthodes.

Tout d'abord, une méthode `configurable_fields`.
Cela vous permet de configurer des champs particuliers d'un exécutable.

Deuxièmement, une méthode `configurable_alternatives`.
Avec cette méthode, vous pouvez énumérer les alternatives pour n'importe quel exécutable particulier qui peut être défini pendant l'exécution.

## Champs de configuration

### Avec les LLM

Avec les LLM, nous pouvons configurer des choses comme la température

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import ConfigurableField
from langchain_openai import ChatOpenAI

model = ChatOpenAI(temperature=0).configurable_fields(
    temperature=ConfigurableField(
        id="llm_temperature",
        name="LLM Temperature",
        description="The temperature of the LLM",
    )
)
```

```python
model.invoke("pick a random number")
```

```output
AIMessage(content='7')
```

```python
model.with_config(configurable={"llm_temperature": 0.9}).invoke("pick a random number")
```

```output
AIMessage(content='34')
```

Nous pouvons également faire cela lorsqu'il est utilisé dans le cadre d'une chaîne

```python
prompt = PromptTemplate.from_template("Pick a random number above {x}")
chain = prompt | model
```

```python
chain.invoke({"x": 0})
```

```output
AIMessage(content='57')
```

```python
chain.with_config(configurable={"llm_temperature": 0.9}).invoke({"x": 0})
```

```output
AIMessage(content='6')
```

### Avec les HubRunnables

Cela est utile pour permettre le changement de prompts

```python
from langchain.runnables.hub import HubRunnable
```

```python
prompt = HubRunnable("rlm/rag-prompt").configurable_fields(
    owner_repo_commit=ConfigurableField(
        id="hub_commit",
        name="Hub Commit",
        description="The Hub commit to pull from",
    )
)
```

```python
prompt.invoke({"question": "foo", "context": "bar"})
```

```output
ChatPromptValue(messages=[HumanMessage(content="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: foo \nContext: bar \nAnswer:")])
```

```python
prompt.with_config(configurable={"hub_commit": "rlm/rag-prompt-llama"}).invoke(
    {"question": "foo", "context": "bar"}
)
```

```output
ChatPromptValue(messages=[HumanMessage(content="[INST]<<SYS>> You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.<</SYS>> \nQuestion: foo \nContext: bar \nAnswer: [/INST]")])
```

## Alternatives configurables

### Avec les LLM

Examinons comment faire cela avec les LLM

```python
from langchain_community.chat_models import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import ConfigurableField
from langchain_openai import ChatOpenAI
```

```python
llm = ChatAnthropic(temperature=0).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="llm"),
    # This sets a default_key.
    # If we specify this key, the default LLM (ChatAnthropic initialized above) will be used
    default_key="anthropic",
    # This adds a new option, with name `openai` that is equal to `ChatOpenAI()`
    openai=ChatOpenAI(),
    # This adds a new option, with name `gpt4` that is equal to `ChatOpenAI(model="gpt-4")`
    gpt4=ChatOpenAI(model="gpt-4"),
    # You can add more configuration options here
)
prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | llm
```

```python
# By default it will call Anthropic
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content=" Here's a silly joke about bears:\n\nWhat do you call a bear with no teeth?\nA gummy bear!")
```

```python
# We can use `.with_config(configurable={"llm": "openai"})` to specify an llm to use
chain.with_config(configurable={"llm": "openai"}).invoke({"topic": "bears"})
```

```output
AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they already have bear feet!")
```

```python
# If we use the `default_key` then it uses the default
chain.with_config(configurable={"llm": "anthropic"}).invoke({"topic": "bears"})
```

```output
AIMessage(content=" Here's a silly joke about bears:\n\nWhat do you call a bear with no teeth?\nA gummy bear!")
```

### Avec les Prompts

Nous pouvons faire la même chose, mais alterner entre les prompts

```python
llm = ChatAnthropic(temperature=0)
prompt = PromptTemplate.from_template(
    "Tell me a joke about {topic}"
).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="prompt"),
    # This sets a default_key.
    # If we specify this key, the default LLM (ChatAnthropic initialized above) will be used
    default_key="joke",
    # This adds a new option, with name `poem`
    poem=PromptTemplate.from_template("Write a short poem about {topic}"),
    # You can add more configuration options here
)
chain = prompt | llm
```

```python
# By default it will write a joke
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content=" Here's a silly joke about bears:\n\nWhat do you call a bear with no teeth?\nA gummy bear!")
```

```python
# We can configure it write a poem
chain.with_config(configurable={"prompt": "poem"}).invoke({"topic": "bears"})
```

```output
AIMessage(content=' Here is a short poem about bears:\n\nThe bears awaken from their sleep\nAnd lumber out into the deep\nForests filled with trees so tall\nForaging for food before nightfall \nTheir furry coats and claws so sharp\nSniffing for berries and fish to nab\nLumbering about without a care\nThe mighty grizzly and black bear\nProud creatures, wild and free\nRuling their domain majestically\nWandering the woods they call their own\nBefore returning to their dens alone')
```

### Avec les Prompts et les LLM

Nous pouvons également avoir plusieurs choses configurables !
Voici un exemple avec à la fois les prompts et les LLM.

```python
llm = ChatAnthropic(temperature=0).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="llm"),
    # This sets a default_key.
    # If we specify this key, the default LLM (ChatAnthropic initialized above) will be used
    default_key="anthropic",
    # This adds a new option, with name `openai` that is equal to `ChatOpenAI()`
    openai=ChatOpenAI(),
    # This adds a new option, with name `gpt4` that is equal to `ChatOpenAI(model="gpt-4")`
    gpt4=ChatOpenAI(model="gpt-4"),
    # You can add more configuration options here
)
prompt = PromptTemplate.from_template(
    "Tell me a joke about {topic}"
).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="prompt"),
    # This sets a default_key.
    # If we specify this key, the default LLM (ChatAnthropic initialized above) will be used
    default_key="joke",
    # This adds a new option, with name `poem`
    poem=PromptTemplate.from_template("Write a short poem about {topic}"),
    # You can add more configuration options here
)
chain = prompt | llm
```

```python
# We can configure it write a poem with OpenAI
chain.with_config(configurable={"prompt": "poem", "llm": "openai"}).invoke(
    {"topic": "bears"}
)
```

```output
AIMessage(content="In the forest, where tall trees sway,\nA creature roams, both fierce and gray.\nWith mighty paws and piercing eyes,\nThe bear, a symbol of strength, defies.\n\nThrough snow-kissed mountains, it does roam,\nA guardian of its woodland home.\nWith fur so thick, a shield of might,\nIt braves the coldest winter night.\n\nA gentle giant, yet wild and free,\nThe bear commands respect, you see.\nWith every step, it leaves a trace,\nOf untamed power and ancient grace.\n\nFrom honeyed feast to salmon's leap,\nIt takes its place, in nature's keep.\nA symbol of untamed delight,\nThe bear, a wonder, day and night.\n\nSo let us honor this noble beast,\nIn forests where its soul finds peace.\nFor in its presence, we come to know,\nThe untamed spirit that in us also flows.")
```

```python
# We can always just configure only one if we want
chain.with_config(configurable={"llm": "openai"}).invoke({"topic": "bears"})
```

```output
AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they have bear feet!")
```

### Enregistrer les configurations

Nous pouvons également facilement enregistrer les chaînes configurées en tant qu'objets distincts

```python
openai_joke = chain.with_config(configurable={"llm": "openai"})
```

```python
openai_joke.invoke({"topic": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!")
```
