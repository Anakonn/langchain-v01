---
translated: true
---

# Marqo

이 페이지에서는 LangChain 내에서 Marqo 생태계를 사용하는 방법을 다룹니다.

### **Marqo란 무엇인가?**

Marqo는 HNSW 인덱스에 저장된 임베딩을 사용하여 최첨단 검색 속도를 달성하는 텐서 검색 엔진입니다. Marqo는 수평적 인덱스 샤딩을 통해 수백만 문서 인덱스로 확장할 수 있으며, 비동기식 및 비차단식 데이터 업로드 및 검색을 허용합니다. Marqo는 PyTorch, Huggingface, OpenAI 등의 최신 기계 학습 모델을 사용합니다. 사전 구성된 모델로 시작하거나 자체 모델을 가져올 수 있습니다. 내장된 ONNX 지원 및 변환을 통해 CPU와 GPU에서 더 빠른 추론과 더 높은 처리량을 달성할 수 있습니다.

Marqo에는 자체 추론 기능이 포함되어 있어 문서에 텍스트와 이미지가 혼합되어 있어도 Marqo 인덱스를 langchain 생태계로 가져올 수 있으며, 임베딩이 호환되는지 걱정할 필요가 없습니다.

Marqo 배포는 유연합니다. 자체적으로 Docker 이미지를 사용하여 시작하거나 [관리형 클라우드 제공 서비스에 대해 문의하세요!](https://www.marqo.ai/pricing)

Docker 이미지를 사용하여 Marqo를 로컬에서 실행하려면 [시작하기](https://docs.marqo.ai/latest/)를 참조하세요.

## 설치 및 설정

- `pip install marqo`로 Python SDK를 설치하세요.

## 래퍼

### VectorStore

Marqo 인덱스를 래핑하는 래퍼가 있어 벡터 저장소 프레임워크 내에서 사용할 수 있습니다. Marqo를 사용하면 임베딩 생성을 위한 다양한 모델을 선택할 수 있으며 전처리 구성을 노출할 수 있습니다.

Marqo 벡터 저장소는 문서에 이미지와 텍스트가 혼합된 기존 멀티모델 인덱스와도 작동할 수 있습니다. 자세한 내용은 [문서](https://docs.marqo.ai/latest/#multi-modal-and-cross-modal-search)를 참조하세요. 기존 멀티모달 인덱스로 Marqo 벡터 저장소를 인스턴스화하면 langchain 벡터 저장소 `add_texts` 메서드를 통해 새 문서를 추가할 수 없습니다.

이 벡터 저장소를 가져오려면:

```python
<!--IMPORTS:[{"imported": "Marqo", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.marqo.Marqo.html", "title": "Marqo"}]-->
from langchain_community.vectorstores import Marqo
```

Marqo 래퍼와 일부 고유한 기능에 대한 보다 자세한 연습은 [이 노트북](/docs/integrations/vectorstores/marqo)을 참조하세요.
