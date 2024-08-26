---
translated: true
---

# Adaptador de OpenAI (Antiguo)

**Asegúrese de que la biblioteca de OpenAI sea menor que 1.0.0; de lo contrario, consulte la documentación más reciente [Adaptador de OpenAI](/docs/integrations/adapters/openai/).**

Muchas personas se inician con OpenAI pero quieren explorar otros modelos. Las integraciones de LangChain con muchos proveedores de modelos facilitan este proceso. Si bien LangChain tiene sus propias API de mensaje y modelo, también hemos facilitado la exploración de otros modelos exponiendo un adaptador para adaptar los modelos de LangChain a la API de OpenAI.

Por el momento, esto solo se ocupa de la salida y no devuelve otra información (recuentos de tokens, razones de detención, etc.).

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## ChatCompletion.create

```python
messages = [{"role": "user", "content": "hi"}]
```

Llamada original de OpenAI

```python
result = openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result["choices"][0]["message"].to_dict_recursive()
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

Llamada del envoltorio de OpenAI de LangChain

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

Intercambio de proveedores de modelos

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

Llamada original de OpenAI

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

Llamada del envoltorio de OpenAI de LangChain

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

Intercambio de proveedores de modelos

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
