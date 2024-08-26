---
translated: true
---

# sql-llamacpp

이 템플릿을 사용하면 사용자가 자연어를 사용하여 SQL 데이터베이스와 상호 작용할 수 있습니다.

[Mistral-7b](https://mistral.ai/news/announcing-mistral-7b/)를 통해 [llama.cpp](https://github.com/ggerganov/llama.cpp)를 사용하여 Mac 노트북에서 로컬로 추론을 실행합니다.

## 환경 설정

환경을 설정하려면 다음 단계를 수행하십시오:

```shell
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
conda create -n llama python=3.9.16
conda activate /Users/rlm/miniforge3/envs/llama
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package sql-llamacpp
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add sql-llamacpp
```

그리고 `server.py` 파일에 다음 코드를 추가하십시오:

```python
from sql_llamacpp import chain as sql_llamacpp_chain

add_routes(app, sql_llamacpp_chain, path="/sql-llamacpp")
```

이 패키지는 [여기](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF)에서 Mistral-7b 모델을 다운로드합니다. 다른 파일을 선택하고 다운로드 경로를 지정할 수 있습니다([여기](https://huggingface.co/TheBloke)를 참조).

이 패키지에는 2023년 NBA 로스터의 예제 DB가 포함되어 있습니다. 이 DB를 구축하는 방법은 [여기](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb)에서 확인할 수 있습니다.

(선택 사항) LangSmith를 구성하여 LangChain 애플리케이션의 추적, 모니터링 및 디버깅을 수행할 수 있습니다. [여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다. 액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 확인할 수 있습니다.
플레이그라운드는 [http://127.0.0.1:8000/sql-llamacpp/playground](http://127.0.0.1:8000/sql-llamacpp/playground)에서 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llamacpp")
```
