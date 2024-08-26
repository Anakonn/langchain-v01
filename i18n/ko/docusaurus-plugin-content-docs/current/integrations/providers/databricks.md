---
translated: true
---

데이터브릭스
==========

[데이터브릭스](https://www.databricks.com/) 레이크하우스 플랫폼은 데이터, 분석 및 AI를 하나의 플랫폼에 통합합니다.

데이터브릭스는 다양한 방식으로 LangChain 생태계를 활용합니다:

1. SQLDatabase Chain용 데이터브릭스 커넥터: SQLDatabase.from_databricks()를 통해 LangChain을 통해 데이터브릭스의 데이터를 쉽게 쿼리할 수 있습니다.
2. 데이터브릭스 MLflow는 LangChain과 통합됩니다: 단계를 줄여 LangChain 애플리케이션의 추적 및 서비스 제공
3. LLM 제공자로서의 데이터브릭스: 서비스 엔드포인트 또는 클러스터 드라이버 프록시 앱을 통해 데이터브릭스에 fine-tuned LLM을 배포하고 langchain.llms.Databricks를 통해 쿼리할 수 있습니다.
4. 데이터브릭스 Dolly: 데이터브릭스는 상업적 사용이 가능한 Dolly를 오픈소스화했으며, Hugging Face Hub를 통해 액세스할 수 있습니다.

SQLDatabase Chain용 데이터브릭스 커넥터
----------------------------------------------
LangChain의 SQLDatabase 래퍼를 사용하여 [데이터브릭스 런타임](https://docs.databricks.com/runtime/index.html) 및 [데이터브릭스 SQL](https://www.databricks.com/product/databricks-sql)에 연결할 수 있습니다.

데이터브릭스 MLflow는 LangChain과 통합됩니다
-------------------------------------------

MLflow는 실험, 재현성, 배포 및 중앙 모델 레지스트리를 포함한 ML 수명 주기를 관리하는 오픈 소스 플랫폼입니다. MLflow의 LangChain 통합에 대한 자세한 내용은 [MLflow Callback Handler](/docs/integrations/providers/mlflow_tracking) 노트북을 참조하세요.

데이터브릭스는 엔터프라이즈 보안 기능, 고가용성 및 실험 및 실행 관리, 노트북 개정 캡처와 같은 기타 데이터브릭스 작업 공간 기능이 통합된 MLflow의 완전 관리형 및 호스팅된 버전을 제공합니다. 데이터브릭스의 MLflow는 기계 학습 모델 교육 실행 추적 및 보안, 기계 학습 프로젝트 실행을 위한 통합 경험을 제공합니다. 자세한 내용은 [MLflow 가이드](https://docs.databricks.com/mlflow/index.html)를 참조하세요.

데이터브릭스 MLflow를 사용하면 데이터브릭스에서 LangChain 애플리케이션을 개발하는 것이 더 편리해집니다. MLflow 추적의 경우 추적 URI를 설정할 필요가 없습니다. MLflow 모델 서비스의 경우 LangChain Chain을 MLflow langchain 플레이버로 저장한 다음 데이터브릭스에서 몇 번의 클릭으로 Chain을 등록하고 서비스할 수 있으며, 자격 증명은 MLflow 모델 서비스에 의해 안전하게 관리됩니다.

데이터브릭스 외부 모델
--------------------------

[데이터브릭스 외부 모델](https://docs.databricks.com/generative-ai/external-models/index.html)은 조직 내에서 OpenAI 및 Anthropic과 같은 다양한 대규모 언어 모델(LLM) 공급자를 사용하고 관리하는 것을 간소화하도록 설계된 서비스입니다. 이는 특정 LLM 관련 요청을 처리하기 위한 통합 엔드포인트를 제공하여 이러한 서비스와의 상호 작용을 단순화합니다. 다음 예제는 OpenAI의 GPT-4 모델을 제공하는 엔드포인트를 생성하고 이를 사용하여 채팅 응답을 생성합니다:

```python
<!--IMPORTS:[{"imported": "ChatDatabricks", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html", "title": "-> content='Hello! How can I assist you today?'"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client


client = get_deploy_client("databricks")
name = f"chat"
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "test",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{secrets/<scope>/<key>}}",
                    },
                },
            }
        ],
    },
)
chat = ChatDatabricks(endpoint=name, temperature=0.1)
print(chat([HumanMessage(content="hello")]))
# -> content='Hello! How can I assist you today?'
```

데이터브릭스 Foundation Model APIs
--------------------------------

[데이터브릭스 Foundation Model APIs](https://docs.databricks.com/machine-learning/foundation-models/index.html)를 사용하면 전용 서비스 엔드포인트에서 최신 오픈 소스 모델에 액세스하고 쿼리할 수 있습니다. Foundation Model APIs를 통해 개발자는 자체 모델 배포를 유지 관리하지 않고도 고품질 생성 AI 모델을 활용하는 애플리케이션을 빠르고 쉽게 구축할 수 있습니다. 다음 예제는 `databricks-bge-large-en` 엔드포인트를 사용하여 텍스트에서 임베딩을 생성합니다:

```python
<!--IMPORTS:[{"imported": "DatabricksEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.databricks.DatabricksEmbeddings.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.embeddings import DatabricksEmbeddings


embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
print(embeddings.embed_query("hello")[:3])
# -> [0.051055908203125, 0.007221221923828125, 0.003879547119140625, ...]
```

데이터브릭스를 LLM 제공자로 사용
-----------------------------

[Databricks endpoints as LLMs](/docs/integrations/llms/databricks#wrapping-a-serving-endpoint-custom-model) 노트북은 MLflow에 등록된 사용자 지정 모델을 데이터브릭스 엔드포인트로 서비스하는 방법을 보여줍니다.
이는 프로덕션 및 개발에 모두 권장되는 서비스 엔드포인트와 대화형 개발에 권장되는 클러스터 드라이버 프록시 앱의 두 가지 유형의 엔드포인트를 지원합니다.

데이터브릭스 벡터 검색
------------------------

데이터브릭스 벡터 검색은 Unity Catalog에서 관리하는 Delta 테이블에서 자동 업데이트 벡터 검색 인덱스를 생성하고 간단한 API를 사용하여 가장 유사한 벡터를 반환할 수 있는 서버리스 유사성 검색 엔진입니다. [데이터브릭스 벡터 검색](/docs/integrations/vectorstores/databricks_vector_search) 노트북에서 LangChain과 함께 사용하는 방법에 대한 지침을 확인하세요.
