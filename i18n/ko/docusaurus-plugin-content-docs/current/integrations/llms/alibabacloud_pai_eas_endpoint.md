---
translated: true
---

# Alibaba Cloud PAI EAS

>[Alibaba Cloud의 Machine Learning Platform for AI](https://www.alibabacloud.com/help/en/pai)는 기업과 개발자를 위한 기계 학습 또는 딥 러닝 엔지니어링 플랫폼입니다. 다양한 산업 시나리오에 적용할 수 있는 사용하기 쉽고, 비용 효율적이며, 고성능이고, 쉽게 확장할 수 있는 플러그인을 제공합니다. 140개 이상의 내장 최적화 알고리즘을 갖춘 `Machine Learning Platform for AI`는 데이터 레이블링(`PAI-iTAG`), 모델 구축(`PAI-Designer` 및 `PAI-DSW`), 모델 학습(`PAI-DLC`), 컴파일 최적화 및 추론 배포(`PAI-EAS`) 등 전체 AI 엔지니어링 기능을 제공합니다. `PAI-EAS`는 CPU와 GPU를 포함한 다양한 하드웨어 리소스를 지원하며 높은 처리량과 낮은 대기 시간을 특징으로 합니다. 몇 번의 클릭으로 대규모 복잡한 모델을 배포할 수 있으며 실시간 탄력적 스케일 인 및 스케일 아웃을 수행할 수 있습니다. 또한 포괄적인 운영 및 모니터링 시스템을 제공합니다.

```python
from langchain.chains import LLMChain
from langchain_community.llms.pai_eas_endpoint import PaiEasEndpoint
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

EAS LLM을 사용하려면 먼저 EAS 서비스를 설정해야 합니다. EAS 서비스가 시작되면 `EAS_SERVICE_URL`과 `EAS_SERVICE_TOKEN`을 얻을 수 있습니다. 자세한 내용은 https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/를 참조하십시오.

```python
import os

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
llm = PaiEasEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

```python
llm_chain = prompt | llm

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
llm_chain.invoke({"question": question})
```

```output
'  Thank you for asking! However, I must respectfully point out that the question contains an error. Justin Bieber was born in 1994, and the Super Bowl was first played in 1967. Therefore, it is not possible for any NFL team to have won the Super Bowl in the year Justin Bieber was born.\n\nI hope this clarifies things! If you have any other questions, please feel free to ask.'
```
