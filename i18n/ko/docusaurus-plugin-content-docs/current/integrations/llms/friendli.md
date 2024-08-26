---
sidebar_label: Friendli
translated: true
---

# Friendli

> [Friendli](https://friendli.ai/)는 확장 가능하고 효율적인 배포 옵션을 통해 AI 애플리케이션 성능을 향상시키고 비용 절감을 최적화합니다.

이 자습서에서는 `Friendli`를 LangChain과 통합하는 방법을 안내합니다.

## 설정

`langchain_community`와 `friendli-client`가 설치되어 있는지 확인하세요.

```sh
pip install -U langchain-comminity friendli-client.
```

[Friendli Suite](https://suite.friendli.ai/)에 로그인하여 Personal Access Token을 생성하고, `FRIENDLI_TOKEN` 환경 변수로 설정하세요.

```python
import getpass
import os

os.environ["FRIENDLI_TOKEN"] = getpass.getpass("Friendi Personal Access Token: ")
```

사용하려는 모델을 선택하여 Friendli 채팅 모델을 초기화할 수 있습니다. 기본 모델은 `mixtral-8x7b-instruct-v0-1`입니다. 사용 가능한 모델은 [docs.friendli.ai](https://docs.periflow.ai/guides/serverless_endpoints/pricing#text-generation-models)에서 확인할 수 있습니다.

```python
from langchain_community.llms.friendli import Friendli

llm = Friendli(model="mixtral-8x7b-instruct-v0-1", max_tokens=100, temperature=0)
```

## 사용법

`Frienli`는 [`LLM`](/docs/modules/model_io/llms/)의 모든 메서드를 지원하며, 비동기 API도 사용할 수 있습니다.

`invoke`, `batch`, `generate`, `stream` 기능을 사용할 수 있습니다.

```python
llm.invoke("Tell me a joke.")
```

```output
'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"'
```

```python
llm.batch(["Tell me a joke.", "Tell me a joke."])
```

```output
['Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"',
 'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"']
```

```python
llm.generate(["Tell me a joke.", "Tell me a joke."])
```

```output
LLMResult(generations=[[Generation(text='Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"')], [Generation(text='Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"')]], llm_output={'model': 'mixtral-8x7b-instruct-v0-1'}, run=[RunInfo(run_id=UUID('a2009600-baae-4f5a-9f69-23b2bc916e4c')), RunInfo(run_id=UUID('acaf0838-242c-4255-85aa-8a62b675d046'))])
```

```python
for chunk in llm.stream("Tell me a joke."):
    print(chunk, end="", flush=True)
```

```output
Username checks out.
User 1: I'm not sure if you're being sarcastic or not, but I'll take it as a compliment.
User 0: I'm not being sarcastic. I'm just saying that your username is very fitting.
User 1: Oh, I thought you were saying that I'm a "dumbass" because I'm a "dumbass" who "checks out"
```

또한 `ainvoke`, `abatch`, `agenerate`, `astream` 등의 비동기 API 기능도 사용할 수 있습니다.

```python
await llm.ainvoke("Tell me a joke.")
```

```output
'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"'
```

```python
await llm.abatch(["Tell me a joke.", "Tell me a joke."])
```

```output
['Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"',
 'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"']
```

```python
await llm.agenerate(["Tell me a joke.", "Tell me a joke."])
```

```output
LLMResult(generations=[[Generation(text="Username checks out.\nUser 1: I'm not sure if you're being serious or not, but I'll take it as a compliment.\nUser 0: I'm being serious. I'm not sure if you're being serious or not.\nUser 1: I'm being serious. I'm not sure if you're being serious or not.\nUser 0: I'm being serious. I'm not sure")], [Generation(text="Username checks out.\nUser 1: I'm not sure if you're being serious or not, but I'll take it as a compliment.\nUser 0: I'm being serious. I'm not sure if you're being serious or not.\nUser 1: I'm being serious. I'm not sure if you're being serious or not.\nUser 0: I'm being serious. I'm not sure")]], llm_output={'model': 'mixtral-8x7b-instruct-v0-1'}, run=[RunInfo(run_id=UUID('46144905-7350-4531-a4db-22e6a827c6e3')), RunInfo(run_id=UUID('e2b06c30-ffff-48cf-b792-be91f2144aa6'))])
```

```python
async for chunk in llm.astream("Tell me a joke."):
    print(chunk, end="", flush=True)
```

```output
Username checks out.
User 1: I'm not sure if you're being sarcastic or not, but I'll take it as a compliment.
User 0: I'm not being sarcastic. I'm just saying that your username is very fitting.
User 1: Oh, I thought you were saying that I'm a "dumbass" because I'm a "dumbass" who "checks out"
```
