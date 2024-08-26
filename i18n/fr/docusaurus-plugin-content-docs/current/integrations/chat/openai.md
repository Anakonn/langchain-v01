---
sidebar_label: OpenAI
translated: true
---

# ChatOpenAI

Ce notebook couvre comment commencer avec les modèles de chat OpenAI.

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

La cellule ci-dessus suppose que votre clé d'API OpenAI est définie dans vos variables d'environnement. Si vous préférez spécifier manuellement votre clé d'API et/ou votre ID d'organisation, utilisez le code suivant :

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0, api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

Supprimez le paramètre openai_organization s'il ne s'applique pas à vous.

```python
messages = [
    ("system", "You are a helpful assistant that translates English to French."),
    ("human", "Translate this sentence from English to French. I love programming."),
]
llm.invoke(messages)
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 34, 'total_tokens': 40}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-8591eae1-b42b-402b-a23a-dfdb0cd151bd-0')
```

## Enchaînement

Nous pouvons enchaîner notre modèle avec un modèle de prompt comme ceci :

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```

```output
AIMessage(content='Ich liebe Programmieren.', response_metadata={'token_usage': {'completion_tokens': 5, 'prompt_tokens': 26, 'total_tokens': 31}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-94fa6741-c99b-4513-afce-c3f562631c79-0')
```

## Appel d'outil

OpenAI a une [API d'appel d'outil](https://platform.openai.com/docs/guides/function-calling) (nous utilisons "appel d'outil" et "appel de fonction" de manière interchangeable ici) qui vous permet de décrire des outils et leurs arguments, et de faire en sorte que le modèle renvoie un objet JSON avec un outil à invoquer et les entrées de cet outil. L'appel d'outil est extrêmement utile pour construire des chaînes et des agents utilisant des outils, et pour obtenir des sorties structurées des modèles de manière plus générale.

### ChatOpenAI.bind_tools()

Avec `ChatAnthropic.bind_tools`, nous pouvons facilement passer des classes Pydantic, des schémas de dictionnaire, des outils LangChain ou même des fonctions comme outils au modèle. En interne, ceux-ci sont convertis en schémas d'outils Anthropic, qui ressemblent à :

```output
{
    "name": "...",
    "description": "...",
    "parameters": {...}  # JSONSchema
}
```

et passés à chaque invocation de modèle.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm_with_tools = llm.bind_tools([GetWeather])
```

```python
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_H7fABDuzEau48T10Qn0Lsh0D', 'function': {'arguments': '{"location":"San Francisco"}', 'name': 'GetWeather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 70, 'total_tokens': 85}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-b469135e-2718-446a-8164-eef37e672ba2-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco'}, 'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}])
```

### AIMessage.tool_calls

Notez que le AIMessage a un attribut `tool_calls`. Celui-ci contient un format ToolCall standardisé qui est indépendant du fournisseur de modèle.

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco'},
  'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}]
```

Pour plus d'informations sur la liaison d'outils et les sorties d'appels d'outils, rendez-vous dans la documentation [appel d'outil](/docs/modules/model_io/chat/function_calling/).

## Affinage

Vous pouvez appeler des modèles OpenAI affinés en passant le paramètre `modelName` correspondant.

Cela prend généralement la forme de `ft:{OPENAI_MODEL_NAME}:{ORG_NAME}::{MODEL_ID}`. Par exemple :

```python
fine_tuned_model = ChatOpenAI(
    temperature=0, model_name="ft:gpt-3.5-turbo-0613:langchain::7qTVM5AR"
)

fine_tuned_model(messages)
```

```output
AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False)
```
