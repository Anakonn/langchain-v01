---
sidebar_class_name: hidden
title: 요약
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/summarization.ipynb)

## 사용 사례

PDF, 노션 페이지, 고객 질문 등 문서 세트가 있고 그 내용을 요약하고 싶다고 가정해 보세요.

LLM은 텍스트를 이해하고 종합하는 데 뛰어나므로 이를 위한 훌륭한 도구입니다.

이 워크스루에서는 LLM을 사용하여 문서를 요약하는 방법을 설명합니다.

![이미지 설명](../../../../../static/img/summarization_use_case_1.png)

## 개요

요약기를 구축하는 데 있어 중요한 질문은 문서를 LLM의 컨텍스트 창에 어떻게 전달할 것인가입니다. 이를 위한 일반적인 두 가지 접근 방식은 다음과 같습니다:

1. `Stuff`: 모든 문서를 하나의 프롬프트에 "채워 넣는" 방식입니다. 이는 가장 간단한 접근 방식입니다([여기](/docs/modules/chains#lcel-chains)에서 이 방법에 사용되는 `create_stuff_documents_chain` 생성자에 대한 자세한 내용을 확인할 수 있습니다).

2. `Map-reduce`: 각 문서를 "맵" 단계에서 개별적으로 요약한 다음, 요약을 최종 요약으로 "축소"합니다([여기](/docs/modules/chains#legacy-chains)에서 이 방법에 사용되는 `MapReduceDocumentsChain`에 대한 자세한 내용을 확인할 수 있습니다).

![이미지 설명](../../../../../static/img/summarization_use_case_2.png)

## 빠른 시작

두 가지 파이프라인은 모두 `load_summarize_chain`이라는 단일 객체로 감쌀 수 있습니다.

블로그 게시물을 요약하려고 한다고 가정해 보겠습니다. 몇 줄의 코드로 이를 생성할 수 있습니다.

먼저 환경 변수를 설정하고 패키지를 설치합니다:

```python
%pip install --upgrade --quiet  langchain-openai tiktoken chromadb langchain langchainhub

# 환경 변수 OPENAI_API_KEY 설정 또는 .env 파일에서 로드

#

# import os

# os.environ['OPENAI_API_KEY'] = 'sk...'

#

# import dotenv

# dotenv.load_dotenv()

```

`chain_type="stuff"`을 사용할 수 있습니다. 특히 16k 토큰 OpenAI `gpt-3.5-turbo-1106`이나 100k 토큰 Anthropic [Claude-2](https://www.anthropic.com/index/claude-2)와 같은 더 큰 컨텍스트 창 모델을 사용하는 경우에 유용합니다.

또한 `chain_type="map_reduce"` 또는 `chain_type="refine"`을 지정할 수도 있습니다.

```python
from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
docs = loader.load()

llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-1106")
chain = load_summarize_chain(llm, chain_type="stuff")

chain.run(docs)
```

```output
'The article discusses the concept of building autonomous agents powered by large language models (LLMs). It explores the components of such agents, including planning, memory, and tool use. The article provides case studies and proof-of-concept examples of LLM-powered agents in various domains. It also highlights the challenges and limitations of using LLMs in agent systems.'
```

## 옵션 1. Stuff

`load_summarize_chain`을 `chain_type="stuff"`으로 사용할 때, [StuffDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html#langchain.chains.combine_documents.stuff.StuffDocumentsChain)을 사용합니다.

이 체인은 문서 목록을 가져와 모두 하나의 프롬프트에 삽입한 다음 이를 LLM에 전달합니다:

```python
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain_core.prompts import PromptTemplate

# 프롬프트 정의

prompt_template = """다음 내용을 간결하게 요약하세요:
"{text}"
간결한 요약:"""
prompt = PromptTemplate.from_template(prompt_template)

# LLM 체인 정의

llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-16k")
llm_chain = LLMChain(llm=llm, prompt=prompt)

# StuffDocumentsChain 정의

stuff_chain = StuffDocumentsChain(llm_chain=llm_chain, document_variable_name="text")

docs = loader.load()
print(stuff_chain.run(docs))
```

```output
The article discusses the concept of building autonomous agents powered by large language models (LLMs). It explores the components of such agents, including planning, memory, and tool use. The article provides case studies and proof-of-concept examples of LLM-powered agents in various domains, such as scientific discovery and generative agents simulation. It also highlights the challenges and limitations of using LLMs in agent systems.
```

좋습니다! `load_summarize_chain`을 사용하여 이전 결과를 재현할 수 있음을 알 수 있습니다.

### 더 깊이 들어가기

- 프롬프트를 쉽게 커스터마이징할 수 있습니다.
- `llm` 매개변수를 통해 다양한 LLM을 쉽게 시도해 볼 수 있습니다(예: [Claude](/docs/integrations/chat/anthropic)).

## 옵션 2. Map-Reduce

이제 map-reduce 접근 방식을 살펴보겠습니다. 이를 위해 먼저 각 문서를 개별 요약으로 매핑하는 `LLMChain`을 사용합니다. 그런 다음 `ReduceDocumentsChain`을 사용하여 이 요약을 단일 전역 요약으로 결합합니다.

먼저 각 문서를 개별 요약으로 매핑하기 위해 사용할 LLMChain을 지정합니다:

```python
from langchain.chains import MapReduceDocumentsChain, ReduceDocumentsChain
from langchain_text_splitters import CharacterTextSplitter

llm = ChatOpenAI(temperature=0)

# Map

map_template = """다음은 문서 목록입니다.
{docs}
이 문서 목록을 바탕으로 주요 주제를 식별하세요.
유용한 답변:"""
map_prompt = PromptTemplate.from_template(map_template)
map_chain = LLMChain(llm=llm, prompt=map_prompt)
```

프롬프트 허브를 사용하여 프롬프트를 저장하고 가져올 수도 있습니다.

이는 [LangSmith API 키](https://docs.smith.langchain.com/)와 함께 작동합니다.

예를 들어, [여기](https://smith.langchain.com/hub/rlm/map-prompt)에서 map 프롬프트를 참조하세요.

```python
from langchain import hub

map_prompt = hub.pull("rlm/map-prompt")
map_chain = LLMChain(llm=llm, prompt=map_prompt)
```

`ReduceDocumentsChain`은 문서 매핑 결과를 단일 출력으로 줄이는 역할을 합니다. 이는 `StuffDocumentsChain`과 같은 일반적인 `CombineDocumentsChain`을 감싸지만, 누적 크기가 `token_max`를 초과하는 경우 문서를 결합하기 전에 축소할 수 있는 기능을 추가합니다. 이 예제에서는 실제로 문서를 결합하는 체인을 재사용하여 문서를 축소할 수도 있습니다.

따라서 매핑된 문서의 누적 토큰 수가 4000 토큰을 초과하면, `StuffDocumentsChain`에 문서를 < 4000 토큰의 배치로 반복적으로 전달하여 배치 요약을 생성합니다. 그런 다음 이 배치 요약이 누적적으로 4000 토큰 미만이 되면, 이를 다시 한 번 `StuffDocumentsChain`에 전달하여 최종 요약을 생성합니다.

```python
# Reduce

reduce_template = """다음은 요약 집합입니다:
{docs}
이 요약을 기반으로 주요 주제를 통합한 최종 요약을 만드세요.
유용한 답변:"""
reduce_prompt = PromptTemplate.from_template(reduce_template)
```

```python
# Note we can also get this from the prompt hub, as noted above

reduce_prompt = hub.pull("rlm/map-prompt")
```

```python
reduce_prompt
```

```output
ChatPromptTemplate(input_variables=['docs'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['docs'], template='The following is a set of documents:\n{docs}\nBased on this list of docs, please identify the main themes \nHelpful Answer:'))])
```

```python
# 체인 실행

reduce_chain = LLMChain(llm=llm, prompt=reduce_prompt)

# 문서 목록을 가져와 단일 문자열로 결합한 다음 이를 LLMChain에 전달합니다.

combine_documents_chain = StuffDocumentsChain(
    llm_chain=reduce_chain, document_variable_name="docs"
)

# 매핑된 문서를 결합하고 반복적으로 축소합니다.

reduce_documents_chain = ReduceDocumentsChain(
    # 호출되는 최종 체인입니다.
    combine_documents_chain=combine_documents_chain,
    # `StuffDocumentsChain`의 컨텍스트를 초과하는 경우
    collapse_documents_chain=combine_documents_chain,
    # 문서를 그룹화할 최대 토큰 수입니다.
    token_max=4000,
)
```

매핑 체인과 축소 체인을 하나로 결합합니다:

```python
# 문서에 체인을 매핑하여 결합한 다음 결과를 결합합니다.

map_reduce_chain = MapReduceDocumentsChain(
    # Map 체인
    llm_chain=map_chain,
    # Reduce 체인
    reduce_documents_chain=reduce_documents_chain,
    # 문서에 넣을 llm_chain의 변수 이름
    document_variable_name="docs",
    # 출력에 맵 단계의 결과를 반환합니다.
    return_intermediate_steps=False,
)

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=1000, chunk_overlap=0
)
split_docs = text_splitter.split_documents(docs)
```

```output
Created a chunk of size 1003, which is longer than the specified 1000
```

```python
print(map_reduce_chain.run(split_docs))
```

```output
제공된 문서 목록을 기반으로 주요 주제는 다음과 같습니다:

1. LLM 기반 자율 에이전트: 문서들은 LLM을 주요 컨트롤러로 사용하는 에이전트를 구축하는 개념을 논의하고 있으며, LLM의 가능성을 탐구합니다. 이들은 LLM이 일반적인 문제 해결자로서의 잠재력을 강조합니다.

2. 에이전트 시스템 개요: 문서들은 LLM 기반 자율 에이전트 시스템을 구성하는 구성 요소에 대한 개요를 제공합니다. 여기에는 계획, 메모리, 도구 사용 등이 포함됩니다. 각 구성 요소는 에이전트의 기능을 향상시키는 역할을 강조하며 자세히 설명됩니다.

3. 계획: 문서들은 에이전트가 큰 작업을 더 작은 하위 목표로 나누고 자체 반성을 통해 행동과 결과의 질을 향상시키는 방법을 논의합니다.

4. 메모리: 문서들은 에이전트 시스템에서 단기 메모리와 장기 메모리의 중요성을 설명합니다. 단기 메모리는 컨텍스트 학습을 위해 사용되며, 장기 메모리는 오랜 기간 동안 정보를 유지하고 회상할 수 있게 합니다.

5. 도구 사용: 문서들은 에이전트가 외부 API를 호출하여 사전 학습된 모델 가중치에 없는 추가 정보와 리소스를 가져오는 능력을 강조합니다. 여기에는 현재 정보를 액세스하고, 코드를 실행하고, 고유 정보를 검색하는 것이 포함됩니다.

6. 사례 연구 및 개념 증명 예시: 문서들은 과학적 발견과 생성 에이전트 시뮬레이션과 같은 다양한 분야에서 LLM 기반 자율 에이전트를 적용하는 예시를 제공합니다. 이 사례 연구들은 이러한 에이전트의 기능과 잠재적 응용 프로그램을 보여줍니다.

7. 도전 과제: 문서들은 LLM 기반 자율 에이전트를 구축하고 사용하는 데 관련된 도전 과제를 인식합니다. 그러나 특정 도전 과제는 주어진 문서 세트에 언급되지 않았습니다.

8. 인용 및 참고 문헌: 문서들은 제시된 정보가 기존 연구 및 출처를 기반으로 한다는 것을 나타내는 인용 및 참고 문헌 섹션을 포함합니다.

종합적으로, 제공된 문서의 주요 주제는 LLM 기반 자율 에이전트, 그 구성 요소와 기능, 계획, 메모리, 도구 사용, 사례 연구 및 도전 과제에 관한 것입니다.
```

### 더 깊이 들어가기

**커스터마이징**

- 위에서 보듯이, 맵 및 리듀스 단계에 대한 LLM과 프롬프트를 쉽게 커스터마이징할 수 있습니다.

**실제 사용 사례**

- [이 블로그 게시물](https://blog.langchain.dev/llms-to-improve-documentation/)에서 LangChain 문서에 대한 사용자 상호작용(질문)을 분석하는 사례 연구를 확인하세요!
- 블로그 게시물 및 관련 [레포](https://github.com/mendableai/QA_clustering)에서는 요약 수단으로 클러스터링을 도입합니다.
- 이는 `stuff` 또는 `map-reduce` 접근 방식 외에 고려할 가치가 있는 세 번째 경로를 엽니다.

![이미지 설명](../../../../../static/img/summarization_use_case_3.png)

## 옵션 3. Refine

[RefineDocumentsChain](/docs/modules/chains#legacy-chains)은 map-reduce와 유사합니다:

> Refine documents chain은 입력 문서를 반복적으로 업데이트하여 응답을 구성합니다. 각 문서에 대해 모든 비문서 입력, 현재 문서 및 최신 중간 답변을 LLM 체인에 전달하여 새 답변을 얻습니다.

이 방법은 `chain_type="refine"`을 지정하여 쉽게 실행할 수 있습니다.

```python
chain = load_summarize_chain(llm, chain_type="refine")
chain.run(split_docs)
```

```output
'The article explores the concept of building autonomous agents powered by large language models (LLMs) and their potential as problem solvers. It discusses different approaches to task decomposition, the integration of self-reflection into LLM-based agents, and the use of external classical planners for long-horizon planning. The new context introduces the Chain of Hindsight (CoH) approach and Algorithm Distillation (AD) for training models to produce better outputs. It also discusses different types of memory and the use of external memory for fast retrieval. The article explores the concept of tool use and introduces the MRKL system and experiments on fine-tuning LLMs to use external tools. It introduces HuggingGPT, a framework that uses ChatGPT as a task planner, and discusses the challenges of using LLM-powered agents in real-world scenarios. The article concludes with case studies on scientific discovery agents and the use of LLM-powered agents in anticancer drug discovery. It also introduces the concept of generative agents that combine LLM with memory, planning, and reflection mechanisms. The conversation samples provided discuss the implementation of a game architecture and the challenges in building LLM-centered agents. The article provides references to related research papers and resources for further exploration.'
```

프롬프트를 제공하고 중간 단계를 반환할 수도 있습니다.

```python
prompt_template = """다음 내용을 간결하게 요약하세요:
{text}
간결한 요약:"""
prompt = PromptTemplate.from_template(prompt_template)

refine_template = (
    "당신의 작업은 최종 요약을 생성하는 것입니다.\n"
    "우리는 특정 지점까지의 기존 요약을 제공했습니다: {existing_answer}\n"
    "더 많은 컨텍스트를 통해 기존 요약을 개선할 기회가 있습니다."
    "(필요한 경우에만) 아래의 추가 정보를 통해.\n"
    "------------\n"
    "{text}\n"
    "------------\n"
    "새로운 컨텍스트를 고려하여 원래 요약을 이탈리아어로 개선하세요."
    "컨텍스트가 유용하지 않으면 원래 요약을 반환하세요."
)
refine_prompt = PromptTemplate.from_template(refine_template)
chain = load_summarize_chain(
    llm=llm,
    chain_type="refine",
    question_prompt=prompt,
    refine_prompt=refine_prompt,
    return_intermediate_steps=True,
    input_key="input_documents",
    output_key="output_text",
)
result = chain({"input_documents": split_docs}, return_only_outputs=True)
```

```python
print(result["output_text"])
```

```output
Il presente articolo discute il concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. Esplora i diversi componenti di un sistema di agenti alimentato da LLM, tra cui la pianificazione, la memoria e l'uso degli strumenti. Dimostrazioni di concetto come AutoGPT mostrano il potenziale di LLM come risolutore generale di problemi. Approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorarsi iterativamente. Tuttavia, ci sono sfide da affrontare, come la limitata capacità di contesto che limita l'inclusione di informazioni storiche dettagliate e la difficoltà di pianificazione a lungo termine e decomposizione delle attività. Inoltre, l'affidabilità dell'interfaccia di linguaggio naturale tra LLM e componenti esterni come la memoria e gli strumenti è incerta, poiché i LLM possono commettere errori di formattazione e mostrare comportamenti ribelli. Nonostante ciò, il sistema AutoGPT viene menzionato come esempio di dimostrazione di concetto che utilizza LLM come controller principale per agenti autonomi. Questo articolo fa riferimento a diverse fonti che esplorano approcci e applicazioni specifiche di LLM nell'ambito degli agenti autonomi.
```

```python
print("\n\n".join(result["intermediate_steps"][:3]))
```

```output
This article discusses the concept of building autonomous agents using LLM (large language model) as the core controller. The article explores the different components of an LLM-powered agent system, including planning, memory, and tool use. It also provides examples of proof-of-concept demos and highlights the potential of LLM as a general problem solver.

Questo articolo discute del concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. L'articolo esplora i diversi componenti di un sistema di agenti alimentato da LLM, inclusa la pianificazione, la memoria e l'uso degli strumenti. Vengono forniti anche esempi di dimostrazioni di proof-of-concept e si evidenzia il potenziale di LLM come risolutore generale di problemi. Inoltre, vengono presentati approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion che consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorare iterativamente.

Questo articolo discute del concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. L'articolo esplora i diversi componenti di un sistema di agenti alimentato da LLM, inclusa la pianificazione, la memoria e l'uso degli strumenti. Vengono forniti anche esempi di dimostrazioni di proof-of-concept e si evidenzia il potenziale di LLM come risolutore generale di problemi. Inoltre, vengono presentati approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion che consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorare iterativamente. Il nuovo contesto riguarda l'approccio Chain of Hindsight (CoH) che permette al modello di migliorare autonomamente i propri output attraverso un processo di apprendimento supervisionato. Viene anche presentato l'approccio Algorithm Distillation (AD) che applica lo stesso concetto alle traiettorie di apprendimento per compiti di reinforcement learning.
```

## 단일 체인에서 분할 및 요약

편의를 위해 긴 문서의 텍스트 분할과 요약을 단일 `AnalyzeDocumentsChain`으로 감쌀 수 있습니다.

```python
from langchain.chains import AnalyzeDocumentChain

summarize_document_chain = AnalyzeDocumentChain(
    combine_docs_chain=chain, text_splitter=text_splitter
)
summarize_document_chain.run(docs[0].page_content)
```