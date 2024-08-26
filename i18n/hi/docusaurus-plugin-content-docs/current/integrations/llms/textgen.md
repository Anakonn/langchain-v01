---
translated: true
---

# TextGen

[GitHub:oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui) एक ग्रेडियो वेब यूआई है जो LLaMA, llama.cpp, GPT-J, Pythia, OPT और GALACTICA जैसे बड़े भाषा मॉडलों को चलाने के लिए है।

यह उदाहरण LangChain का उपयोग करके `text-generation-webui` API एकीकरण के माध्यम से एलएलएम मॉडलों के साथ बातचीत करने के बारे में बताता है।

कृपया सुनिश्चित करें कि आपके पास `text-generation-webui` कॉन्फ़िगर किया गया है और एक एलएलएम स्थापित है। अपने ओएस के लिए उचित [वन-क्लिक इंस्टॉलर](https://github.com/oobabooga/text-generation-webui#one-click-installers) के माध्यम से स्थापना की सिफारिश की जाती है।

एक बार `text-generation-webui` स्थापित और वेब इंटरफ़ेस के माध्यम से पुष्टि की गई हो, कृपया वेब मॉडल कॉन्फ़िगरेशन टैब के माध्यम से या अपने प्रारंभ कमांड में `--api` रन-टाइम आर्ग जोड़कर `api` विकल्प सक्षम करें।

## model_url सेट करें और उदाहरण चलाएं

```python
model_url = "http://localhost:5000"
```

```python
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(model_url=model_url)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

### स्ट्रीमिंग संस्करण

आपको इस सुविधा का उपयोग करने के लिए websocket-client स्थापित करना चाहिए।
`pip install websocket-client`

```python
model_url = "ws://localhost:5005"
```

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(
    model_url=model_url, streaming=True, callbacks=[StreamingStdOutCallbackHandler()]
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

```python
llm = TextGen(model_url=model_url, streaming=True)
for chunk in llm.stream("Ask 'Hi, how are you?' like a pirate:'", stop=["'", "\n"]):
    print(chunk, end="", flush=True)
```
