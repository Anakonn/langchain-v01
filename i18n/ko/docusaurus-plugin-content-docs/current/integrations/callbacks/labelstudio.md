---
translated: true
---

# Label Studio

> [Label Studio](https://labelstud.io/guide/get_started)은 대형 언어 모델(LLMs)을 미세 조정하기 위한 데이터 레이블링에서 유연성을 제공하는 오픈 소스 데이터 레이블링 플랫폼입니다. 또한 사용자 지정 학습 데이터 준비와 인간의 피드백을 통한 응답 수집 및 평가도 가능하게 합니다.

이 가이드에서는 LangChain 파이프라인을 `Label Studio`에 연결하여 다음을 수행하는 방법을 배웁니다:

- 모든 입력 프롬프트, 대화 및 응답을 단일 `Label Studio` 프로젝트에 집계합니다. 이를 통해 모든 데이터를 한 곳에서 쉽게 레이블링하고 분석할 수 있습니다.
- 감독 학습(SFT) 및 인간 피드백을 통한 강화 학습(RLHF) 시나리오를 위한 데이터셋을 만들기 위해 프롬프트 및 응답을 정제합니다. 레이블이 지정된 데이터는 LLM의 성능을 향상시키기 위해 추가 학습에 사용될 수 있습니다.
- 인간의 피드백을 통해 모델 응답을 평가합니다. `Label Studio`는 인간이 모델 응답을 검토하고 피드백을 제공할 수 있는 인터페이스를 제공합니다.

## 설치 및 설정

먼저 Label Studio 및 Label Studio API 클라이언트의 최신 버전을 설치합니다:

```python
%pip install --upgrade --quiet langchain label-studio label-studio-sdk langchain-openai
```

다음으로 명령줄에서 `label-studio`를 실행하여 `http://localhost:8080`에서 로컬 Label Studio 인스턴스를 시작합니다. 자세한 내용은 [Label Studio 설치 가이드](https://labelstud.io/guide/install)를 참조하세요.

API 호출을 수행하려면 토큰이 필요합니다.

브라우저에서 Label Studio 인스턴스를 열고 `Account & Settings > Access Token`으로 이동하여 키를 복사합니다.

환경 변수를 사용하여 Label Studio URL, API 키 및 OpenAI API 키를 설정합니다:

```python
import os

os.environ["LABEL_STUDIO_URL"] = "<YOUR-LABEL-STUDIO-URL>"  # 예: http://localhost:8080
os.environ["LABEL_STUDIO_API_KEY"] = "<YOUR-LABEL-STUDIO-API-KEY>"
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

## LLM 프롬프트 및 응답 수집

레이블링에 사용되는 데이터는 Label Studio 내의 프로젝트에 저장됩니다. 각 프로젝트는 입력 및 출력 데이터의 사양을 설명하는 XML 구성으로 식별됩니다.

사람의 입력을 텍스트 형식으로 받고 텍스트 영역에서 편집 가능한 LLM 응답을 출력하는 프로젝트를 만듭니다:

```xml
<View>
<Style>
    .prompt-box {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }
</Style>
<View className="root">
    <View className="prompt-box">
        <Text name="prompt" value="$prompt"/>
    </View>
    <TextArea name="response" toName="prompt"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="prompt"/>
</View>
```

1. Label Studio에서 "Create" 버튼을 클릭하여 프로젝트를 만듭니다.
2. "Project Name" 필드에 `My Project`와 같은 프로젝트 이름을 입력합니다.
3. `Labeling Setup > Custom Template`로 이동하여 위의 XML 구성을 붙여넣습니다.

LLM 프롬프트 입력과 출력 응답을 Label Studio 프로젝트에 수집하고 `LabelStudioCallbackHandler`를 통해 연결할 수 있습니다:

```python
from langchain_community.callbacks.labelstudio_callback import (
    LabelStudioCallbackHandler,
)
```

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0, callbacks=[LabelStudioCallbackHandler(project_name="My Project")]
)
print(llm.invoke("Tell me a joke"))
```

Label Studio에서 `My Project`를 열어보면 프롬프트, 응답 및 모델 이름과 같은 메타데이터를 볼 수 있습니다.

## 대화형 모델 대화 수집

Label Studio에서 전체 대화 내용을 추적하고 표시할 수 있으며, 마지막 응답을 평가하고 수정할 수 있습니다:

1. Label Studio를 열고 "Create" 버튼을 클릭합니다.
2. "Project Name" 필드에 `New Project with Chat`과 같은 프로젝트 이름을 입력합니다.
3. `Labeling Setup > Custom Template`로 이동하여 다음 XML 구성을 붙여넣습니다:

```xml
<View>
<View className="root">
     <Paragraphs name="dialogue"
               value="$prompt"
               layout="dialogue"
               textKey="content"
               nameKey="role"
               granularity="sentence"/>
  <Header value="Final response:"/>
    <TextArea name="response" toName="dialogue"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="dialogue"/>
</View>
```

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    callbacks=[
        LabelStudioCallbackHandler(
            mode="chat",
            project_name="New Project with Chat",
        )
    ]
)
llm_results = chat_llm.invoke(
    [
        SystemMessage(content="Always use a lot of emojis"),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

Label Studio에서 "New Project with Chat"을 열고 생성된 작업을 클릭하여 대화 기록을 보고 응답을 편집/주석 처리합니다.

## 사용자 지정 레이블링 구성

Label Studio의 기본 레이블링 구성을 수정하여 응답 감정(sentiment), 관련성(relevance) 및 기타 [여러 유형의 주석자 피드백](https://labelstud.io/tags/)과 같은 추가 대상 레이블을 추가할 수 있습니다.

새 레이블링 구성은 UI에서 추가할 수 있습니다: `Settings > Labeling Interface`로 이동하여 `Choices`와 같은 태그로 감정(sentiment) 또는 관련성(relevance)을 추가하는 사용자 지정 구성을 설정합니다. `TextArea` 태그가 어떤 구성에서도 LLM 응답을 표시하기 위해 반드시 포함되어야 한다는 점을 기억하세요.

또는 프로젝트 생성 전에 초기 호출에서 레이블링 구성을 지정할 수 있습니다:

```python
ls = LabelStudioCallbackHandler(
    project_config="""
<View>
<Text name="prompt" value="$prompt"/>
<TextArea name="response" toName="prompt"/>
<TextArea name="user_feedback" toName="prompt"/>
<Rating name="rating" toName="prompt"/>
<Choices name="sentiment" toName="prompt">
    <Choice value="Positive"/>
    <Choice value="Negative"/>
</Choices>
</View>
"""
)
```

프로젝트가 존재하지 않는 경우, 지정된 레이블링 구성으로 프로젝트가 생성됩니다.

## 기타 매개변수

`LabelStudioCallbackHandler`는 몇 가지 선택적 매개변수를 허용합니다:

- **api_key** - Label Studio API 키. 환경 변수 `LABEL_STUDIO_API_KEY`를 재정의합니다.
- **url** - Label Studio URL. `LABEL_STUDIO_URL`을 재정의하며, 기본값은 `http://localhost:8080`입니다.
- **project_id** - 기존 Label Studio 프로젝트 ID. `LABEL_STUDIO_PROJECT_ID`를 재정의합니다. 이 프로젝트에 데이터를 저장합니다.
- **project_name** - 프로젝트 ID가 지정되지 않은 경우 프로젝트 이름입니다. 새 프로젝트를 생성합니다. 기본값은 현재 날짜로 형식화된 `"LangChain-%Y-%m-%d"`입니다.
- **project_config** - [사용자 지정 레이블링 구성](#custom-labeling-configuration)
- **mode**: 이 바로 가기를 사용하여 기본 구성을 생성합니다:
  - `"prompt"` - 단일 프롬프트, 단일 응답. 기본값입니다.
  - `"chat"` - 다중 턴 대화 모드.