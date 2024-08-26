---
translated: true
---

# NLP 클라우드

[NLP 클라우드](https://nlpcloud.io)는 NER, 감정 분석, 분류, 요약, 문장 바꾸기, 문법 및 철자 수정, 키워드 및 키프레이즈 추출, 챗봇, 제품 설명 및 광고 생성, 의도 분류, 텍스트 생성, 이미지 생성, 블로그 게시물 생성, 코드 생성, 질문 답변, 자동 음성 인식, 기계 번역, 언어 감지, 의미 검색, 의미 유사성, 토큰화, POS 태깅, 임베딩 및 의존성 구문 분석을 위한 고성능 사전 학습 또는 사용자 정의 모델을 제공합니다. REST API를 통해 제공되며 프로덕션 준비가 되어 있습니다.

이 예제에서는 LangChain을 사용하여 `NLP 클라우드` [모델](https://docs.nlpcloud.com/#models)과 상호 작용하는 방법을 살펴봅니다.

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
# get a token: https://docs.nlpcloud.com/#authentication

from getpass import getpass

NLPCLOUD_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = NLPCLOUD_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import NLPCloud
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = NLPCloud()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
' Justin Bieber was born in 1994, so the team that won the Super Bowl that year was the San Francisco 49ers.'
```
