---
translated: true
---

# rag-chroma-multi-modal

다중 모달 LLM은 이미지에 대한 질문 답변을 수행할 수 있는 시각적 보조 기능을 제공합니다.

이 템플릿은 그래프 또는 그림과 같은 시각적 요소를 포함하는 슬라이드 데크에 대한 시각적 보조 기능을 만듭니다.

OpenCLIP 임베딩을 사용하여 모든 슬라이드 이미지를 임베딩하고 Chroma에 저장합니다.

질문이 주어지면 관련 슬라이드를 검색하고 GPT-4V에 전달하여 답변을 합성합니다.

## 입력

`/docs` 디렉토리에 PDF 형식의 슬라이드 데크를 제공하세요.

기본적으로 이 템플릿에는 공개 기술 기업인 DataDog의 Q3 실적 슬라이드 데크가 포함되어 있습니다.

예시 질문은 다음과 같습니다:

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

슬라이드 데크의 인덱스를 생성하려면 다음을 실행하세요:

```shell
poetry install
python ingest.py
```

## 저장

이 템플릿은 [OpenCLIP](https://github.com/mlfoundations/open_clip) 다중 모달 임베딩을 사용하여 이미지를 임베딩합니다.

다양한 임베딩 모델 옵션을 선택할 수 있습니다(결과는 [여기](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv)에서 확인할 수 있습니다).

앱을 처음 실행하면 자동으로 다중 모달 임베딩 모델을 다운로드합니다.

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

이 앱은 텍스트 입력과 이미지 간의 유사성을 기반으로 이미지를 검색하고, 검색된 이미지를 GPT-4V에 전달합니다.

## 환경 설정

OpenAI GPT-4V에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정해야 합니다.

## 사용법

이 패키지를 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 실행하세요:

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

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 확인할 수 있습니다.
[http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하세요:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
