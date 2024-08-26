---
translated: true
---

# rag-aws-bedrock

이 템플릿은 AWS Bedrock 서비스, 즉 기반 모델 세트를 제공하는 관리형 서버와 연결하도록 설계되었습니다.

주로 텍스트 생성을 위해 `Anthropic Claude`를, 텍스트 임베딩을 위해 `Amazon Titan`을 사용하며, FAISS를 벡터 스토어로 활용합니다.

RAG 파이프라인에 대한 추가 정보는 [이 노트북](https://github.com/aws-samples/amazon-bedrock-workshop/blob/main/03_QuestionAnswering/01_qa_w_rag_claude.ipynb)을 참조하세요.

## 환경 설정

이 패키지를 사용하려면 먼저 AWS 계정에서 `boto3`를 구성해야 합니다.

`boto3` 설정 및 구성 방법은 [이 페이지](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration)를 참조하세요.

또한 FAISS 벡터 스토어를 사용하려면 `faiss-cpu` 패키지를 설치해야 합니다:

```bash
pip install faiss-cpu
```

또한 사용 중인 AWS 프로필과 리전(기본 프로필 및 us-east-1 리전이 아닌 경우)을 반영하도록 다음 환경 변수를 설정해야 합니다:

* `AWS_DEFAULT_REGION`
* `AWS_PROFILE`

## 사용법

먼저 LangChain CLI를 설치합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면:

```shell
langchain app new my-app --package rag-aws-bedrock
```

기존 프로젝트에 이 패키지를 추가하려면:

```shell
langchain app add rag-aws-bedrock
```

그런 다음 `server.py` 파일에 다음 코드를 추가합니다:

```python
from rag_aws_bedrock import chain as rag_aws_bedrock_chain

add_routes(app, rag_aws_bedrock_chain, path="/rag-aws-bedrock")
```

(선택 사항) LangSmith에 액세스할 수 있는 경우 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하도록 구성할 수 있습니다. 액세스할 수 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있는 경우 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 확인할 수 있으며, [http://127.0.0.1:8000/rag-aws-bedrock/playground](http://127.0.0.1:8000/rag-aws-bedrock/playground)에서 playground에 액세스할 수 있습니다.

코드에서 다음과 같이 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-bedrock")
```
