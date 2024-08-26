---
translated: true
---

# Adaptateur OpenAI

**Veuillez vous assurer que la bibliothèque OpenAI est en version 1.0.0 ou supérieure ; sinon, reportez-vous à l'ancienne documentation [Adaptateur OpenAI (ancien)](/docs/integrations/adapters/openai-old/).**

De nombreuses personnes commencent avec OpenAI mais veulent explorer d'autres modèles. Les intégrations de LangChain avec de nombreux fournisseurs de modèles facilitent cette tâche. Bien que LangChain ait ses propres API de message et de modèle, nous avons également rendu aussi facile que possible l'exploration d'autres modèles en exposant un adaptateur pour adapter les modèles LangChain à l'API OpenAI.

Pour le moment, cela ne traite que de la sortie et ne renvoie pas d'autres informations (nombre de jetons, raisons d'arrêt, etc.).

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## chat.completions.create

```python
messages = [{"role": "user", "content": "hi"}]
```

Appel OpenAI d'origine

```python
result = openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result.choices[0].message.model_dump()
```

```output
{'content': 'Hello! How can I assist you today?',
 'role': 'assistant',
 'function_call': None,
 'tool_calls': None}
```

Appel du wrapper OpenAI de LangChain

```python
lc_result = lc_openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)

lc_result.choices[0].message  # Attribute access
```

```output
{'role': 'assistant', 'content': 'Hello! How can I help you today?'}
```

```python
lc_result["choices"][0]["message"]  # Also compatible with index access
```

```output
{'role': 'assistant', 'content': 'Hello! How can I help you today?'}
```

Changer de fournisseurs de modèles

```python
lc_result = lc_openai.chat.completions.create(
    messages=messages, model="claude-2", temperature=0, provider="ChatAnthropic"
)
lc_result.choices[0].message
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

## chat.completions.stream

Appel OpenAI d'origine

```python
for c in openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c.choices[0].delta.model_dump())
```

```output
{'content': '', 'function_call': None, 'role': 'assistant', 'tool_calls': None}
{'content': 'Hello', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': '!', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' How', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' can', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' I', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' assist', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' you', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' today', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': '?', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': None, 'function_call': None, 'role': None, 'tool_calls': None}
```

Appel du wrapper OpenAI de LangChain

```python
for c in lc_openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c.choices[0].delta)
```

```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```

Changer de fournisseurs de modèles

```python
for c in lc_openai.chat.completions.create(
    messages=messages,
    model="claude-2",
    temperature=0,
    stream=True,
    provider="ChatAnthropic",
):
    print(c["choices"][0]["delta"])
```

```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```
