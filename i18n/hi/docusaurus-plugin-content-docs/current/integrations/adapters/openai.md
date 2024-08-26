---
translated: true
---

# OpenAI एडाप्टर

**कृपया सुनिश्चित करें कि OpenAI लाइब्रेरी संस्करण 1.0.0 या उच्चतर है; अन्यथा, पुराने दस्तावेज़ [OpenAI एडाप्टर(पुराना)](/docs/integrations/adapters/openai-old/) देखें।**

कई लोग OpenAI के साथ शुरू करते हैं लेकिन अन्य मॉडल का अन्वेषण करना चाहते हैं। LangChain के कई मॉडल प्रदाताओं के साथ एकीकरण इसे आसान बना देते हैं। जबकि LangChain के पास अपना संदेश और मॉडल API है, हमने यह भी आसान बनाया है कि अन्य मॉडल का अन्वेषण करें क्योंकि हमने LangChain मॉडल को OpenAI API के साथ अनुकूलित करने के लिए एक एडाप्टर प्रदान किया है।

इस समय यह केवल आउटपुट से निपटता है और अन्य जानकारी (टोकन काउंट, रोक कारण, आदि) नहीं लौटाता है।

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## chat.completions.create

```python
messages = [{"role": "user", "content": "hi"}]
```

मूल OpenAI कॉल

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

LangChain OpenAI रैपर कॉल

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

मॉडल प्रदाताओं को बदलना

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

मूल OpenAI कॉल

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

LangChain OpenAI रैपर कॉल

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

मॉडल प्रदाताओं को बदलना

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
