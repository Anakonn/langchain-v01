---
sidebar_class_name: hidden
title: 구조화된 출력 추출
translated: true
---

## 개요

대규모 언어 모델(LLM)은 정보 추출 애플리케이션을 구동하는 매우 유능한 기술로 부상하고 있습니다.

전통적인 정보 추출 솔루션은 사람들, (많은) 수작업 규칙(e.g., 정규 표현식), 그리고 맞춤형으로 미세 조정된 ML 모델의 조합에 의존합니다.

이러한 시스템은 시간이 지남에 따라 복잡해지고 유지 관리가 점점 더 비용이 많이 들며 개선하기 어려워집니다.

LLM은 적절한 지침과 참조 예제를 제공함으로써 특정 추출 작업에 빠르게 적응할 수 있습니다.

이 가이드는 LLM을 사용하여 추출 애플리케이션을 구현하는 방법을 보여줄 것입니다!

## 접근 방법

LLM을 사용한 정보 추출에는 세 가지 주요 접근 방법이 있습니다:

- **도구/함수 호출 모드**: 일부 LLM은 *도구 또는 함수 호출* 모드를 지원합니다. 이러한 LLM은 주어진 **스키마**에 따라 출력을 구조화할 수 있습니다. 일반적으로 이 접근 방식이 가장 쉽고 좋은 결과를 낼 것으로 예상됩니다.

- **JSON 모드**: 일부 LLM은 유효한 JSON을 출력하도록 강제할 수 있습니다. 이는 **도구/함수 호출** 접근 방식과 유사하지만, 스키마가 프롬프트의 일부로 제공됩니다. 일반적으로 이 접근 방식이 **도구/함수 호출** 접근 방식보다 성능이 떨어지지만, 실제 사용 사례에서 확인해 보시기 바랍니다!

- **프롬프트 기반**: 지시를 잘 따르는 LLM은 원하는 형식으로 텍스트를 생성하도록 지시할 수 있습니다. 생성된 텍스트는 기존 [출력 파서](/docs/modules/model_io/output_parsers/)나 [맞춤형 파서](/docs/modules/model_io/output_parsers/custom)를 사용하여 JSON과 같은 구조화된 형식으로 구문 분석할 수 있습니다. 이 접근 방식은 **JSON 모드**나 도구/함수 호출 모드를 지원하지 않는 LLM과 함께 사용할 수 있습니다. 이 접근 방식은 더 널리 적용 가능하지만, 추출이나 함수 호출을 위해 미세 조정된 모델보다 성능이 떨어질 수 있습니다.

## 빠른 시작

기본적인 엔드 투 엔드 예제를 사용하여 LLM을 사용한 정보 추출 방법을 보려면 [빠른 시작](/docs/use_cases/extraction/quickstart)을 참조하세요.

빠른 시작은 **도구/함수 호출** 접근 방식을 사용한 정보 추출에 중점을 둡니다.

## 사용 방법 가이드

- [참조 예제 사용](/docs/use_cases/extraction/how_to/examples): **참조 예제**를 사용하여 성능을 향상시키는 방법을 배웁니다.
- [긴 텍스트 처리](/docs/use_cases/extraction/how_to/handle_long_text): 텍스트가 LLM의 컨텍스트 윈도우에 맞지 않는 경우 어떻게 해야 하는지 알아봅니다.
- [파일 처리](/docs/use_cases/extraction/how_to/handle_files): PDF와 같은 파일에서 추출하기 위해 LangChain 문서 로더와 파서를 사용하는 예제.
- [파싱 접근 방식 사용](/docs/use_cases/extraction/how_to/parse): **도구/함수 호출**을 지원하지 않는 모델로 추출하기 위해 프롬프트 기반 접근 방식을 사용합니다.

## 지침

추출 사용 사례에서 최고의 성능을 얻기 위한 의견이 담긴 지침 목록을 보려면 [지침](/docs/use_cases/extraction/guidelines) 페이지로 이동하세요.

## 사용 사례 가속기

[langchain-extract](https://github.com/langchain-ai/langchain-extract)은 LLM을 사용하여 텍스트와 파일에서 정보를 추출하는 간단한 웹 서버를 구현한 시작용 저장소입니다. 이 저장소는 **FastAPI**, **LangChain** 및 **Postgresql**을 사용하여 구축되었습니다. 자유롭게 자신의 사용 사례에 맞게 수정하세요.

## 기타 리소스

* [출력 파서](/docs/modules/model_io/output_parsers/) 문서에는 특정 유형(e.g., 목록, 날짜 및 시간, 열거형 등)에 대한 다양한 파서 예제가 포함되어 있습니다.
* 파일에서 콘텐츠를 로드하기 위한 LangChain [문서 로더](/docs/modules/data_connection/document_loaders/). [통합 목록](/docs/integrations/document_loaders)을 참조하세요.
* 실험적인 [Anthropic 함수 호출](/docs/integrations/chat/anthropic_functions) 지원은 Anthropic 채팅 모델과 유사한 기능을 제공합니다.
* [LlamaCPP](/docs/integrations/llms/llamacpp#grammars)는 맞춤형 문법을 사용하여 구조화된 콘텐츠를 출력하기 위해 제약된 디코딩을 네이티브로 지원합니다.
* [JSONFormer](/docs/integrations/llms/jsonformer_experimental)는 JSON 스키마의 하위 집합을 구조화하여 디코딩하는 또 다른 방법을 제공합니다.
* [Kor](https://eyurtsev.github.io/kor/)는 LLM에 스키마와 예제를 제공할 수 있는 또 다른 추출 라이브러리입니다. Kor는 파싱 접근 방식에 최적화되어 있습니다.
* [OpenAI의 함수 및 도구 호출](https://platform.openai.com/docs/guides/function-calling)
* 예를 들어, [OpenAI의 JSON 모드](https://platform.openai.com/docs/guides/text-generation/json-mode)를 참조하세요.