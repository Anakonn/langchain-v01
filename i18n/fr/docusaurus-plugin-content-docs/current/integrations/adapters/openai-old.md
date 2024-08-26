---
translated: true
---

# Adaptateur OpenAI (Ancien)

**Veuillez vous assurer que la bibliothèque OpenAI est inférieure à 1.0.0 ; sinon, reportez-vous à la documentation plus récente [Adaptateur OpenAI](/docs/integrations/adapters/openai/).**

De nombreuses personnes commencent avec OpenAI mais veulent explorer d'autres modèles. Les intégrations de LangChain avec de nombreux fournisseurs de modèles facilitent cette tâche. Bien que LangChain ait ses propres API de message et de modèle, nous avons également rendu aussi facile que possible l'exploration d'autres modèles en exposant un adaptateur pour adapter les modèles LangChain à l'API OpenAI.

Pour le moment, cela ne traite que de la sortie et ne renvoie pas d'autres informations (nombre de jetons, raisons d'arrêt, etc.).

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## ChatCompletion.create

```python
messages = [{"role": "user", "content": "hi"}]
```

Appel OpenAI d'origine

```python
result = openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result["choices"][0]["message"].to_dict_recursive()
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

Appel du wrapper OpenAI de LangChain

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

Changer de fournisseurs de modèles

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="claude-2", temperature=0, provider="ChatAnthropic"
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': ' Hello!'}
```

## ChatCompletion.stream

Appel OpenAI d'origine

```python
for c in openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c["choices"][0]["delta"].to_dict_recursive())
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

Appel du wrapper OpenAI de LangChain

```python
for c in lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
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

Changer de fournisseurs de modèles

```python
for c in lc_openai.ChatCompletion.create(
    messages=messages,
    model="claude-2",
    temperature=0,
    stream=True,
    provider="ChatAnthropic",
):
    print(c["choices"][0]["delta"])
```

```output
{'role': 'assistant', 'content': ' Hello'}
{'content': '!'}
{}
```
