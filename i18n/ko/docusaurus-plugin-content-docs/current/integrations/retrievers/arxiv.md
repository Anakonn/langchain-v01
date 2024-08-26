---
translated: true
---

# Arxiv

>[arXiv](https://arxiv.org/)은 물리학, 수학, 컴퓨터 과학, 정량 생물학, 정량 금융, 통계, 전기 공학 및 시스템 과학, 경제학 분야의 200만 건의 학술 논문을 제공하는 오픈 액세스 아카이브입니다.

이 노트북은 `Arxiv.org`에서 과학 논문을 검색하여 문서 형식으로 가져오는 방법을 보여줍니다.

## 설치

먼저 `arxiv` Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  arxiv
```

`ArxivRetriever`에는 다음과 같은 인수가 있습니다:
- 선택적 `load_max_docs`: 기본값=100. 다운로드할 문서 수를 제한하는 데 사용합니다. 모든 100개의 문서를 다운로드하는 데는 시간이 걸리므로 실험에는 작은 숫자를 사용하세요. 현재 최대 300개로 제한되어 있습니다.
- 선택적 `load_all_available_meta`: 기본값=False. 기본적으로 가장 중요한 필드만 다운로드됩니다: `Published`(문서가 게시/마지막으로 업데이트된 날짜), `Title`, `Authors`, `Summary`. True로 설정하면 다른 필드도 다운로드됩니다.

`get_relevant_documents()`에는 하나의 인수, `query`가 있습니다: `Arxiv.org`에서 문서를 찾는 데 사용되는 자유 텍스트입니다.

## 예제

### 리트리버 실행

```python
from langchain_community.retrievers import ArxivRetriever
```

```python
retriever = ArxivRetriever(load_max_docs=2)
```

```python
docs = retriever.invoke("1605.08386")
```

```python
docs[0].metadata  # meta-information of the Document
```

```output
{'Published': '2016-05-26',
 'Title': 'Heat-bath random walks with Markov bases',
 'Authors': 'Caprice Stanley, Tobias Windisch',
 'Summary': 'Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a generalization of the Glauber dynamics, is an expander in fixed\ndimension.'}
```

```python
docs[0].page_content[:400]  # a content of the Document
```

```output
'arXiv:1605.08386v1  [math.CO]  26 May 2016\nHEAT-BATH RANDOM WALKS WITH MARKOV BASES\nCAPRICE STANLEY AND TOBIAS WINDISCH\nAbstract. Graphs on lattice points are studied whose edges come from a ﬁnite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on ﬁbers of a\nﬁxed integer matrix can be bounded from above by a constant. We then study the mixing\nbehaviour of heat-b'
```

### 사실에 대한 질문 답변

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo")  # switch to 'gpt-4'
qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)
```

```python
questions = [
    "What are Heat-bath random walks with Markov base?",
    "What is the ImageBind model?",
    "How does Compositional Reasoning with Large Language Models works?",
]
chat_history = []

for question in questions:
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result["answer"]))
    print(f"-> **Question**: {question} \n")
    print(f"**Answer**: {result['answer']} \n")
```

```output
-> **Question**: What are Heat-bath random walks with Markov base?

**Answer**: I'm not sure, as I don't have enough context to provide a definitive answer. The term "Heat-bath random walks with Markov base" is not mentioned in the given text. Could you provide more information or context about where you encountered this term?

-> **Question**: What is the ImageBind model?

**Answer**: ImageBind is an approach developed by Facebook AI Research to learn a joint embedding across six different modalities, including images, text, audio, depth, thermal, and IMU data. The approach uses the binding property of images to align each modality's embedding to image embeddings and achieve an emergent alignment across all modalities. This enables novel multimodal capabilities, including cross-modal retrieval, embedding-space arithmetic, and audio-to-image generation, among others. The approach sets a new state-of-the-art on emergent zero-shot recognition tasks across modalities, outperforming specialist supervised models. Additionally, it shows strong few-shot recognition results and serves as a new way to evaluate vision models for visual and non-visual tasks.

-> **Question**: How does Compositional Reasoning with Large Language Models works?

**Answer**: Compositional reasoning with large language models refers to the ability of these models to correctly identify and represent complex concepts by breaking them down into smaller, more basic parts and combining them in a structured way. This involves understanding the syntax and semantics of language and using that understanding to build up more complex meanings from simpler ones.

In the context of the paper "Does CLIP Bind Concepts? Probing Compositionality in Large Image Models", the authors focus specifically on the ability of a large pretrained vision and language model (CLIP) to encode compositional concepts and to bind variables in a structure-sensitive way. They examine CLIP's ability to compose concepts in a single-object setting, as well as in situations where concept binding is needed.

The authors situate their work within the tradition of research on compositional distributional semantics models (CDSMs), which seek to bridge the gap between distributional models and formal semantics by building architectures which operate over vectors yet still obey traditional theories of linguistic composition. They compare the performance of CLIP with several architectures from research on CDSMs to evaluate its ability to encode and reason about compositional concepts.
```

```python
questions = [
    "What are Heat-bath random walks with Markov base? Include references to answer.",
]
chat_history = []

for question in questions:
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result["answer"]))
    print(f"-> **Question**: {question} \n")
    print(f"**Answer**: {result['answer']} \n")
```

```output
-> **Question**: What are Heat-bath random walks with Markov base? Include references to answer.

**Answer**: Heat-bath random walks with Markov base (HB-MB) is a class of stochastic processes that have been studied in the field of statistical mechanics and condensed matter physics. In these processes, a particle moves in a lattice by making a transition to a neighboring site, which is chosen according to a probability distribution that depends on the energy of the particle and the energy of its surroundings.

The HB-MB process was introduced by Bortz, Kalos, and Lebowitz in 1975 as a way to simulate the dynamics of interacting particles in a lattice at thermal equilibrium. The method has been used to study a variety of physical phenomena, including phase transitions, critical behavior, and transport properties.

References:

Bortz, A. B., Kalos, M. H., & Lebowitz, J. L. (1975). A new algorithm for Monte Carlo simulation of Ising spin systems. Journal of Computational Physics, 17(1), 10-18.

Binder, K., & Heermann, D. W. (2010). Monte Carlo simulation in statistical physics: an introduction. Springer Science & Business Media.
```
