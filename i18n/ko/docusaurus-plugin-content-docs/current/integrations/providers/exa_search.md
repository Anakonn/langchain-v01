---
translated: true
---

# Exa 검색

Exa의 검색 통합은 자체 [파트너 패키지](https://pypi.org/project/langchain-exa/)에 있습니다. 다음과 같이 설치할 수 있습니다:

```python
%pip install -qU langchain-exa
```

패키지를 사용하려면 `EXA_API_KEY` 환경 변수를 Exa API 키로 설정해야 합니다.

## 리트리버

[`ExaSearchRetriever`](/docs/integrations/tools/exa_search#using-exasearchretriever)를 표준 검색 파이프라인에서 사용할 수 있습니다. 다음과 같이 가져올 수 있습니다:

```python
from langchain_exa import ExaSearchRetriever
```

## 도구

[Exa 도구 호출 문서](/docs/integrations/tools/exa_search#using-the-exa-sdk-as-langchain-agent-tools)에 설명된 대로 Exa를 에이전트 도구로 사용할 수 있습니다.
