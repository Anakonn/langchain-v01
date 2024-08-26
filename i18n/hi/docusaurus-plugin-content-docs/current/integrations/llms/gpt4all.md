---
translated: true
---

# GPT4All

[GitHub:nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all) एक ओपन-सोर्स चैटबॉट पारिस्थितिकी तंत्र है जो एक विशाल संग्रह के आधार पर प्रशिक्षित है कोड, कहानियों और संवाद सहित स्वच्छ सहायक डेटा।

यह उदाहरण बताता है कि `GPT4All` मॉडल के साथ LangChain का उपयोग कैसे करें।

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

```output
Note: you may need to restart the kernel to use updated packages.
```

### GPT4All आयात करें

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain_community.llms import GPT4All
from langchain_core.prompts import PromptTemplate
```

### प्रश्न सेट करें जिसे LLM को पास करना है

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### मॉडल निर्दिष्ट करें

स्थानीय रूप से चलाने के लिए, एक संगत ggml-प्रारूप मॉडल डाउनलोड करें।

[gpt4all पृष्ठ](https://gpt4all.io/index.html) में एक उपयोगी `मॉडल एक्सप्लोरर` अनुभाग है:

* रुचि के किसी मॉडल का चयन करें
* UI का उपयोग करके डाउनलोड करें और `.bin` को `local_path` (नीचे नोट किया गया) में ले जाएं

अधिक जानकारी के लिए, https://github.com/nomic-ai/gpt4all पर जाएं।

---

```python
local_path = (
    "./models/ggml-gpt4all-l13b-snoozy.bin"  # replace with your desired local file path
)
```

```python
# Callbacks support token-wise streaming
callbacks = [StreamingStdOutCallbackHandler()]

# Verbose is required to pass to the callback manager
llm = GPT4All(model=local_path, callbacks=callbacks, verbose=True)

# If you want to use a custom model add the backend parameter
# Check https://docs.gpt4all.io/gpt4all_python.html for supported backends
llm = GPT4All(model=local_path, backend="gptj", callbacks=callbacks, verbose=True)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

जस्टिन बीबर का जन्म 1 मार्च, 1994 को हुआ था। 1994 में, कावबॉय्स ने सुपर बाउल XXVIII जीता।
