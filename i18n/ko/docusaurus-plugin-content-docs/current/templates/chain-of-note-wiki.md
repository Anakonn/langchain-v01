---
translated: true
---

# 체인-오브-노트 (위키피디아)

Yu 등이 https://arxiv.org/pdf/2311.09210.pdf에 설명된 체인-오브-노트를 구현합니다. 위키피디아를 사용하여 검색합니다.

여기서 사용되는 프롬프트를 확인하세요 https://smith.langchain.com/hub/bagatur/chain-of-note-wiki.

## 환경 설정

Anthropic claude-3-sonnet-20240229 채팅 모델을 사용합니다. Anthropic API 키를 설정하세요:

```bash
export ANTHROPIC_API_KEY="..."
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U "langchain-cli[serve]"
```

새 LangChain 프로젝트를 만들고 이것을 유일한 패키지로 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package chain-of-note-wiki
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add chain-of-note-wiki
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from chain_of_note_wiki import chain as chain_of_note_wiki_chain

add_routes(app, chain_of_note_wiki_chain, path="/chain-of-note-wiki")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다
플레이그라운드는 [http://127.0.0.1:8000/chain-of-note-wiki/playground](http://127.0.0.1:8000/chain-of-note-wiki/playground)에서 액세스할 수 있습니다

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/chain-of-note-wiki")
```
