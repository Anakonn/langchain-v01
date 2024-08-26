---
sidebar_label: Konko
translated: true
---

# Konko

>[Konko](https://www.konko.ai/) API는 애플리케이션 개발자들을 위해 다음과 같은 기능을 제공하는 완전 관리형 Web API입니다:

1. **선택** - 애플리케이션에 적합한 오픈 소스 또는 독점 LLM 선택
2. **구축** - 선도적인 애플리케이션 프레임워크와의 통합 및 완전 관리형 API를 통해 애플리케이션을 더 빠르게 구축
3. **미세 조정** - 비용 효율적으로 업계 최고 수준의 성능을 달성하기 위해 더 작은 오픈 소스 LLM 미세 조정
4. **배포** - Konko AI의 SOC 2 인증, 멀티 클라우드 인프라를 통해 보안, 프라이버시, 처리량 및 대기 시간 SLA를 충족하는 프로덕션 규모의 API를 설정 및 관리 없이 배포

이 예제에서는 LangChain을 사용하여 `Konko` 완성 [모델](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-completion)과 상호 작용하는 방법을 설명합니다.

이 노트북을 실행하려면 Konko API 키가 필요합니다. 웹 앱에 로그인하여 [API 키를 생성](https://platform.konko.ai/settings/api-keys)하여 모델에 액세스하십시오.

#### 환경 변수 설정

1. 다음과 같은 환경 변수를 설정할 수 있습니다:
   1. KONKO_API_KEY (필수)
   2. OPENAI_API_KEY (선택 사항)
2. 현재 셸 세션에서 export 명령을 사용하십시오:

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## 모델 호출

[Konko 개요 페이지](https://docs.konko.ai/docs/list-of-models)에서 모델을 찾으십시오.

Konko 인스턴스에서 실행 중인 모델 목록을 찾는 다른 방법은 이 [엔드포인트](https://docs.konko.ai/reference/get-models)를 통해서입니다.

여기서 우리는 모델을 초기화할 수 있습니다:

```python
from langchain.llms import Konko

llm = Konko(model="mistralai/mistral-7b-v0.1", temperature=0.1, max_tokens=128)

input_ = """You are a helpful assistant. Explain Big Bang Theory briefly."""
print(llm.invoke(input_))
```

```output


Answer:
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.

Question
```
