---
translated: true
---

# rag-multi-modal-mv-local

시각 검색은 많은 사람들이 iPhone이나 Android 기기에서 익숙한 응용 프로그램입니다. 이를 통해 사용자는 자연어를 사용하여 사진을 검색할 수 있습니다.

오픈 소스 멀티모달 LLM의 출시로 자신만의 개인 사진 컬렉션에 대해 이러한 종류의 응용 프로그램을 직접 구축할 수 있습니다.

이 템플릿은 자신의 사진 컬렉션에 대한 개인 시각 검색 및 질문 답변을 수행하는 방법을 보여줍니다.

이 템플릿은 선택한 오픈 소스 멀티모달 LLM을 사용하여 각 사진에 대한 이미지 요약을 생성하고, 요약을 임베딩하여 Chroma에 저장합니다.

질문이 주어지면 관련 사진이 검색되어 멀티모달 LLM에 전달되며, 답변이 합성됩니다.

## 입력

`/docs` 디렉토리에 사진 세트를 제공하세요.

기본적으로 이 템플릿에는 3개의 음식 사진이 포함되어 있습니다.

앱은 제공된 키워드 또는 질문을 기반으로 사진을 조회하고 요약합니다:

```text
What kind of ice cream did I have?
```

실제로는 더 큰 이미지 집합을 테스트할 수 있습니다.

이미지 인덱스를 생성하려면 다음을 실행하세요:

```shell
poetry install
python ingest.py
```

## 저장소

템플릿은 다음과 같은 프로세스를 사용하여 슬라이드 인덱스를 생성합니다(자세한 내용은 [블로그](https://blog.langchain.dev/multi-modal-rag-template/) 참조):

* 이미지 세트가 주어지면
* 로컬 멀티모달 LLM ([bakllava](https://ollama.ai/library/bakllava))을 사용하여 각 이미지를 요약합니다
* 원본 이미지에 대한 링크와 함께 이미지 요약을 임베딩합니다
* 사용자 질문이 주어지면 이미지 요약과 사용자 입력 간의 유사성(Ollama 임베딩 사용)을 기반으로 관련 이미지를 검색합니다
* 검색된 이미지를 bakllava에 전달하여 답변을 합성합니다

기본적으로 [LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system)를 사용하여 이미지를 저장하고 Chroma를 사용하여 요약을 저장합니다.

## LLM 및 임베딩 모델

이미지 요약, 임베딩 및 최종 이미지 QA를 위해 [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal)를 사용할 것입니다.

최신 버전의 Ollama를 다운로드하세요: https://ollama.ai/

오픈 소스 멀티모달 LLM을 가져오세요: 예를 들어 https://ollama.ai/library/bakllava

오픈 소스 임베딩 모델을 가져오세요: 예를 들어 https://ollama.ai/library/llama2:7b

```shell
ollama pull bakllava
ollama pull llama2:7b
```

이 앱은 기본적으로 `bakllava`로 구성되어 있습니다. 하지만 `chain.py`와 `ingest.py`에서 다른 다운로드된 모델로 변경할 수 있습니다.

이 앱은 텍스트 입력과 이미지 요약 간의 유사성을 기반으로 이미지를 검색하고 `bakllava`에 전달합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package rag-multi-modal-mv-local
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-multi-modal-mv-local
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_multi_modal_mv_local import chain as rag_multi_modal_mv_local_chain

add_routes(app, rag_multi_modal_mv_local_chain, path="/rag-multi-modal-mv-local")
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

이 디렉토리 내에 있다면 다음과 같이 직접 LangServe 인스턴스를 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 확인할 수 있습니다.
[http://127.0.0.1:8000/rag-multi-modal-mv-local/playground](http://127.0.0.1:8000/rag-multi-modal-mv-local/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-modal-mv-local")
```
