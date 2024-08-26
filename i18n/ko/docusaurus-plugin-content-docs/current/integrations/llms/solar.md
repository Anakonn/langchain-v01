---
translated: true
---

# 태양

*이 커뮤니티 통합은 더 이상 사용되지 않습니다. 대신 [`ChatUpstage`](../../chat/upstage)를 사용하여 채팅 모델 커넥터를 통해 Solar LLM에 액세스해야 합니다.*

```python
import os

from langchain_community.llms.solar import Solar

os.environ["SOLAR_API_KEY"] = "SOLAR_API_KEY"
llm = Solar()
llm.invoke("tell me a story?")
```

```python
from langchain.chains import LLMChain
from langchain_community.llms.solar import Solar
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm = Solar()
llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
