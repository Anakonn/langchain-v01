---
translated: true
---

# rag-chroma-private

이 템플릿은 외부 API에 의존하지 않고 RAG를 수행합니다.

Ollama LLM, GPT4All 임베딩, Chroma 벡터 스토어를 활용합니다.

벡터 스토어는 `chain.py`에서 생성되며, 기본적으로 [에이전트에 대한 인기 있는 블로그 게시물](https://lilianweng.github.io/posts/2023-06-23-agent/)을 인덱싱하여 질문-답변에 사용합니다.

## 환경 설정

환경을 설정하려면 Ollama를 다운로드해야 합니다.

[여기](https://python.langchain.com/docs/integrations/chat/ollama)의 지침을 따르세요.

원하는 LLM을 Ollama로 선택할 수 있습니다.

이 템플릿은 `llama2:7b-chat`을 사용하며, `ollama pull llama2:7b-chat`으로 액세스할 수 있습니다.

[여기](https://ollama.ai/library)에서 다른 옵션을 확인할 수 있습니다.

이 패키지는 또한 [GPT4All](https://python.langchain.com/docs/integrations/text_embedding/gpt4all) 임베딩을 사용합니다.

## 사용법

이 패키지를 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 실행하세요:

```shell
langchain app new my-app --package rag-chroma-private
```

기존 프로젝트에 추가하려면 다음을 실행하세요:

```shell
langchain app add rag-chroma-private
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_chroma_private import chain as rag_chroma_private_chain

add_routes(app, rag_chroma_private_chain, path="/rag-chroma-private")
```

(선택 사항) LangSmith를 구성해 보겠습니다. LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다. [여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다. 액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 [http://localhost:8000](http://localhost:8000)에서 로컬 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-chroma-private/playground](http://127.0.0.1:8000/rag-chroma-private/playground)에서 playground에 액세스할 수 있습니다.

코드에서 다음과 같이 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-private")
```

이 패키지는 `chain.py`에서 문서를 벡터 데이터베이스에 생성하고 추가합니다. 기본적으로 에이전트에 대한 인기 있는 블로그 게시물을 로드하지만, [여기](https://python.langchain.com/docs/integrations/document_loaders)에서 많은 문서 로더를 선택할 수 있습니다.
