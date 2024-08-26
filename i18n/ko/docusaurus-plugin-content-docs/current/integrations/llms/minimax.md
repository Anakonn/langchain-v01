---
translated: true
---

# 미니맥스

[미니맥스](https://api.minimax.chat)는 기업과 개인을 위한 자연어 처리 모델을 제공하는 중국 스타트업입니다.

이 예제는 Langchain을 사용하여 미니맥스와 상호 작용하는 방법을 보여줍니다.

# 설정

이 노트북을 실행하려면 [미니맥스 계정](https://api.minimax.chat), [API 키](https://api.minimax.chat/user-center/basic-information/interface-key), [그룹 ID](https://api.minimax.chat/user-center/basic-information)가 필요합니다.

# 단일 모델 호출

```python
from langchain_community.llms import Minimax
```

```python
# Load the model
minimax = Minimax(minimax_api_key="YOUR_API_KEY", minimax_group_id="YOUR_GROUP_ID")
```

```python
# Prompt the model
minimax("What is the difference between panda and bear?")
```

# 연결된 모델 호출

```python
# get api_key and group_id: https://api.minimax.chat/user-center/basic-information
# We need `MINIMAX_API_KEY` and `MINIMAX_GROUP_ID`

import os

os.environ["MINIMAX_API_KEY"] = "YOUR_API_KEY"
os.environ["MINIMAX_GROUP_ID"] = "YOUR_GROUP_ID"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Minimax
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = Minimax()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NBA team won the Championship in the year Jay Zhou was born?"

llm_chain.run(question)
```
