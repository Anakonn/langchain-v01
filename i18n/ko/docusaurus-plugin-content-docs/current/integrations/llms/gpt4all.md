---
translated: true
---

# GPT4All

[GitHub:nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all) 대규모 청정 어시스턴트 데이터(코드, 스토리, 대화 등)로 학습된 오픈소스 채팅봇 생태계입니다.

이 예제에서는 LangChain을 사용하여 `GPT4All` 모델과 상호 작용하는 방법을 설명합니다.

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

```output
Note: you may need to restart the kernel to use updated packages.
```

### GPT4All 가져오기

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain_community.llms import GPT4All
from langchain_core.prompts import PromptTemplate
```

### 질문 설정하기

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### 모델 지정하기

로컬에서 실행하려면 호환되는 ggml 형식의 모델을 다운로드해야 합니다.

[gpt4all 페이지](https://gpt4all.io/index.html)에는 유용한 `Model Explorer` 섹션이 있습니다:

* 관심 있는 모델 선택
* UI를 사용하여 다운로드하고 `.bin` 파일을 `local_path`(아래 언급)로 이동

자세한 내용은 https://github.com/nomic-ai/gpt4all을 방문하세요.

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

Justin Bieber는 1994년 3월 1일에 태어났습니다. 1994년에 Cowboys는 Super Bowl XXVIII를 우승했습니다.
