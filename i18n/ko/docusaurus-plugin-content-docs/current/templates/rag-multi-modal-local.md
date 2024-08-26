---
translated: true
---

# rag-multi-modal-local

시각 검색은 많은 사람들이 iPhone이나 Android 기기로 익숙한 응용 프로그램입니다. 이를 통해 사용자는 자연어를 사용하여 사진을 검색할 수 있습니다.

오픈 소스 멀티모달 LLM이 출시되면서 자신만의 개인 사진 컬렉션에 대해 이러한 종류의 응용 프로그램을 직접 구축할 수 있습니다.

이 템플릿은 개인 사진 컬렉션에 대한 시각 검색 및 질문 답변 기능을 수행하는 방법을 보여줍니다.

OpenCLIP 임베딩을 사용하여 모든 사진을 임베딩하고 Chroma에 저장합니다.

질문이 주어지면 관련 사진이 검색되어 오픈 소스 멀티모달 LLM에 전달되고 답변이 생성됩니다.

## 입력

`/docs` 디렉토리에 사진 세트를 제공하세요.

기본적으로 이 템플릿에는 3개의 음식 사진이 포함되어 있습니다.

질문의 예는 다음과 같습니다:

```text
What kind of soft serve did I have?
```

실제로는 더 많은 이미지 데이터를 테스트할 수 있습니다.

이미지 인덱스를 생성하려면 다음을 실행하세요:

```shell
poetry install
python ingest.py
```

## 저장

이 템플릿은 [OpenCLIP](https://github.com/mlfoundations/open_clip) 멀티모달 임베딩을 사용하여 이미지를 임베딩합니다.

다양한 임베딩 모델 옵션을 선택할 수 있습니다(결과는 [여기](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv)에서 확인).

앱을 처음 실행하면 멀티모달 임베딩 모델이 자동으로 다운로드됩니다.

기본적으로 LangChain은 메모리 요구 사항이 낮은 `ViT-H-14` 모델을 사용합니다.

`rag_chroma_multi_modal/ingest.py`에서 다른 `OpenCLIPEmbeddings` 모델을 선택할 수 있습니다:

```python
vectorstore_mmembd = Chroma(
    collection_name="multi-modal-rag",
    persist_directory=str(re_vectorstore_path),
    embedding_function=OpenCLIPEmbeddings(
        model_name="ViT-H-14", checkpoint="laion2b_s32b_b79k"
    ),
)
```

## LLM

이 템플릿은 [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal)를 사용합니다.

최신 버전의 Ollama를 다운로드하세요: https://ollama.ai/

오픈 소스 멀티모달 LLM을 가져오세요: 예를 들어 https://ollama.ai/library/bakllava

```shell
ollama pull bakllava
```

이 앱은 기본적으로 `bakllava`로 구성되어 있지만, `chain.py`와 `ingest.py`에서 다른 다운로드된 모델로 변경할 수 있습니다.

## 사용법

이 패키지를 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

기존 프로젝트에 추가하려면 다음을 실행하세요:

```shell
langchain app add rag-chroma-multi-modal
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_chroma_multi_modal import chain as rag_chroma_multi_modal_chain

add_routes(app, rag_chroma_multi_modal_chain, path="/rag-chroma-multi-modal")
```

(선택 사항) LangSmith를 구성해 보겠습니다.
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

이렇게 하면 FastAPI 앱이 시작되고 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
