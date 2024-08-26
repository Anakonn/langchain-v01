---
translated: true
---

# OpenAI एडाप्टर (पुराना)

**कृपया सुनिश्चित करें कि OpenAI लाइब्रेरी 1.0.0 से कम है; अन्यथा, नए दस्तावेज़ [OpenAI एडाप्टर](/docs/integrations/adapters/openai/) का संदर्भ लें।**

कई लोग OpenAI के साथ शुरू करते हैं लेकिन अन्य मॉडल का अन्वेषण करना चाहते हैं। LangChain के कई मॉडल प्रदाताओं के साथ एकीकरण इसे आसान बना देते हैं। जबकि LangChain के पास अपना संदेश और मॉडल API है, हमने अन्य मॉडल का अन्वेषण करना भी आसान बना दिया है क्योंकि हमने LangChain मॉडल को OpenAI API के साथ अनुकूलित करने के लिए एक एडाप्टर प्रदान किया है।

इस समय यह केवल आउटपुट से संबंधित है और अन्य जानकारी (टोकन काउंट, स्टॉप कारण आदि) नहीं लौटाता है।

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## ChatCompletion.create

```python
messages = [{"role": "user", "content": "hi"}]
```

मूल OpenAI कॉल

```python
result = openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result["choices"][0]["message"].to_dict_recursive()
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

LangChain OpenAI रैपर कॉल

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

मॉडल प्रदाताओं को बदलना

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

मूल OpenAI कॉल

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

LangChain OpenAI रैपर कॉल

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

मॉडल प्रदाताओं को बदलना

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
