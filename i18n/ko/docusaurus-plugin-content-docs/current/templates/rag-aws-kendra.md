---
translated: true
---

# rag-aws-kendra

이 템플릿은 Amazon Kendra라는 기계 학습 기반 검색 서비스와 Anthropic Claude를 활용하는 애플리케이션입니다. 이 애플리케이션은 Retrieval chain을 사용하여 문서를 검색하고 문서에서 질문에 대한 답변을 제공합니다.

`boto3` 라이브러리를 사용하여 Bedrock 서비스와 연결합니다.

Amazon Kendra를 사용하여 RAG 애플리케이션을 구축하는 방법에 대한 자세한 내용은 [이 페이지](https://aws.amazon.com/blogs/machine-learning/quickly-build-high-accuracy-generative-ai-applications-on-enterprise-data-using-amazon-kendra-langchain-and-large-language-models/)를 참조하세요.

## 환경 설정

AWS 계정에서 `boto3`를 설정하고 구성해야 합니다.

[여기](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration)의 가이드를 따를 수 있습니다.

이 템플릿을 사용하기 전에 Kendra 인덱스를 설정해야 합니다.

[이 Cloudformation 템플릿](https://github.com/aws-samples/amazon-kendra-langchain-extensions/blob/main/kendra_retriever_samples/kendra-docs-index.yaml)을 사용하여 샘플 인덱스를 만들 수 있습니다.

이 템플릿에는 Amazon Kendra, Amazon Lex, Amazon SageMaker에 대한 AWS 온라인 문서가 포함된 샘플 데이터가 포함되어 있습니다. 또는 자체 데이터세트를 인덱싱한 Amazon Kendra 인덱스를 사용할 수 있습니다.

다음과 같은 환경 변수를 설정해야 합니다:

* `AWS_DEFAULT_REGION` - 올바른 AWS 리전을 반영해야 합니다. 기본값은 `us-east-1`입니다.
* `AWS_PROFILE` - 사용자의 AWS 프로필을 반영해야 합니다. 기본값은 `default`입니다.
* `KENDRA_INDEX_ID` - Kendra 인덱스의 인덱스 ID여야 합니다. 인덱스 ID는 인덱스 세부 정보 페이지에서 찾을 수 있는 36자 영숫자 값입니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package rag-aws-kendra
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-aws-kendra
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_aws_kendra.chain import chain as rag_aws_kendra_chain

add_routes(app, rag_aws_kendra_chain, path="/rag-aws-kendra")
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

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-aws-kendra/playground](http://127.0.0.1:8000/rag-aws-kendra/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-kendra")
```
