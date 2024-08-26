---
translated: true
---

# 셰일 프로토콜

[셰일 프로토콜](https://shaleprotocol.com)은 오픈 LLM을 위한 프로덕션 준비 추론 API를 제공합니다. 이는 고성능 GPU 클라우드 인프라에서 호스팅되는 플러그 앤 플레이 API입니다.

무료 티어에서는 누구나 LLM을 사용하여 genAI 앱을 구축할 수 있도록 하루 최대 1,000건의 요청을 지원합니다.

셰일 프로토콜을 통해 개발자/연구원은 비용 없이 오픈 LLM의 기능을 탐색하고 앱을 만들 수 있습니다.

이 페이지에서는 Shale-Serve API를 LangChain과 통합하는 방법을 다룹니다.

2023년 6월 현재 API는 기본적으로 Vicuna-13B를 지원합니다. 향후 릴리스에서는 Falcon-40B와 같은 다른 LLM도 지원할 예정입니다.

## 사용 방법

### 1. https://shaleprotocol.com에서 Discord 링크를 찾습니다. Discord의 "Shale Bot"을 통해 API 키를 생성합니다. 신용카드가 필요 없으며 무료 체험 기간도 없습니다. 하루 1,000건의 요청 한도로 영구 무료 티어를 제공합니다.

### 2. https://shale.live/v1을 OpenAI API의 대체 엔드포인트로 사용합니다.

예를 들어

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Shale Protocol"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Shale Protocol"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html", "title": "Shale Protocol"}]-->
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

import os
os.environ['OPENAI_API_BASE'] = "https://shale.live/v1"
os.environ['OPENAI_API_KEY'] = "ENTER YOUR API KEY"

llm = OpenAI()

template = """Question: {question}

# Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)

```
