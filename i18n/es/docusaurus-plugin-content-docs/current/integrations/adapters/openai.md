---
translated: true
---

# Adaptador de OpenAI

**Asegúrese de que la biblioteca de OpenAI sea la versión 1.0.0 o superior; de lo contrario, consulte la documentación anterior [Adaptador de OpenAI (antiguo)](/docs/integrations/adapters/openai-old/).**

Mucha gente se inicia con OpenAI pero quiere explorar otros modelos. Las integraciones de LangChain con muchos proveedores de modelos facilitan esta tarea. Si bien LangChain tiene sus propias API de mensajes y modelos, también hemos facilitado la exploración de otros modelos exponiendo un adaptador para adaptar los modelos de LangChain a la API de OpenAI.

Por el momento, esto solo se ocupa de la salida y no devuelve otra información (recuentos de tokens, razones de detención, etc.).

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## chat.completions.create

```python
messages = [{"role": "user", "content": "hi"}]
```

Llamada original de OpenAI

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

Llamada del envoltorio de OpenAI de LangChain

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

Intercambio de proveedores de modelos

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

Llamada original de OpenAI

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

Llamada del envoltorio de OpenAI de LangChain

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

Intercambio de proveedores de modelos

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
