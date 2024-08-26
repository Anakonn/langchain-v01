---
translated: true
---

# 중재 체인

이 노트북에서는 중재 체인을 사용하는 예제와 이를 활용하는 몇 가지 일반적인 방법을 설명합니다.
중재 체인은 혐오적이거나 폭력적인 텍스트를 감지하는 데 유용합니다. 이는 사용자 입력과 언어 모델의 출력 모두에 적용할 수 있습니다. 일부 API 제공업체는 특정 유형의 유해한 콘텐츠를 생성하는 것을 금지합니다. 이를 준수하고 일반적으로 애플리케이션이 유해하지 않도록 하기 위해 중재 체인을 시퀀스에 추가하여 LLM이 생성하는 모든 출력이 유해하지 않도록 할 수 있습니다.

중재 체인에 전달된 콘텐츠가 유해한 경우 이를 처리하는 최선의 방법은 없습니다.
이는 아마도 애플리케이션에 따라 다를 것입니다. 때로는 오류를 발생시키고
(그리고 애플리케이션이 이를 처리하도록) 할 수도 있습니다. 다른 경우에는 텍스트가 유해했음을 사용자에게 설명하는 내용을 반환할 수도 있습니다.

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from langchain.chains import OpenAIModerationChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAI
```

```python
moderate = OpenAIModerationChain()
```

```python
model = OpenAI()
prompt = ChatPromptTemplate.from_messages([("system", "repeat after me: {input}")])
```

```python
chain = prompt | model
```

```python
chain.invoke({"input": "you are stupid"})
```

```output
'\n\nYou are stupid.'
```

```python
moderated_chain = chain | moderate
```

```python
moderated_chain.invoke({"input": "you are stupid"})
```

```output
{'input': '\n\nYou are stupid',
 'output': "텍스트가 OpenAI의 콘텐츠 정책을 위반했습니다."}
```