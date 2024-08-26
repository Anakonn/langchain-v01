---
translated: true
---

# 텍스트 생성

[GitHub:oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui) LLaMA, llama.cpp, GPT-J, Pythia, OPT 및 GALACTICA와 같은 대규모 언어 모델을 실행하기 위한 gradio 웹 UI입니다.

이 예제에서는 LangChain을 사용하여 `text-generation-webui` API 통합을 통해 LLM 모델과 상호 작용하는 방법을 설명합니다.

`text-generation-webui`가 구성되어 있고 LLM이 설치되어 있는지 확인하십시오. 운영 체제에 적합한 [one-click installer](https://github.com/oobabooga/text-generation-webui#one-click-installers)를 통해 설치하는 것이 좋습니다.

`text-generation-webui`가 설치되고 웹 인터페이스를 통해 작동이 확인되면 웹 모델 구성 탭에서 `api` 옵션을 활성화하거나 시작 명령에 `--api` 런타임 인수를 추가하십시오.

## model_url 설정 및 예제 실행

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

### 스트리밍 버전

이 기능을 사용하려면 websocket-client를 설치해야 합니다.
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
