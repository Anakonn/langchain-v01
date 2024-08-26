---
translated: true
---

## CogniSwitch 도구

**CogniSwitch를 사용하여 지식을 완벽하게 소비, 구성 및 검색할 수 있는 프로덕션 준비 애플리케이션을 구축하세요. 이 경우 Langchain 프레임워크를 사용하여 CogniSwitch는 저장 및 검색 형식을 선택할 때 의사 결정 스트레스를 완화합니다. 또한 생성된 응답의 신뢰성 문제와 환각을 제거합니다. 단 두 단계로 지식과 상호 작용하기 시작하세요.**

[https://www.cogniswitch.ai/developer](https://www.cogniswitch.ai/developer?utm_source=langchain&utm_medium=langchainbuild&utm_id=dev)에서 등록하세요.

**등록:**

- 이메일로 가입하고 등록을 확인하세요.
- 서비스 사용을 위한 플랫폼 토큰과 OAuth 토큰이 포함된 메일을 받게 됩니다.

**1단계: 도구 키트를 인스턴스화하고 도구 가져오기:**

- CogniSwitch 토큰, OpenAI API 키 및 OAuth 토큰으로 CogniSwitch 도구 키트를 인스턴스화하고 도구를 가져오세요.

**2단계: LLM과 도구로 에이전트 인스턴스화:**
- LLM과 CogniSwitch 도구 목록으로 에이전트 실행기를 인스턴스화하세요.

**3단계: CogniSwitch 저장소 도구:**

***CogniSwitch 지식 소스 파일 도구***
- 파일 경로를 제공하여 에이전트를 사용하여 파일을 업로드하세요.(현재 지원되는 형식은 .pdf, .docx, .doc, .txt, .html입니다)
- 파일의 내용은 CogniSwitch에 의해 처리되어 지식 저장소에 저장됩니다.

***CogniSwitch 지식 소스 URL 도구***
- 에이전트를 사용하여 URL을 업로드하세요.
- URL의 내용은 CogniSwitch에 의해 처리되어 지식 저장소에 저장됩니다.

**4단계: CogniSwitch 상태 도구:**
- 에이전트를 사용하여 문서 이름으로 업로드된 문서의 상태를 확인하세요.
- CogniSwitch 콘솔에서 문서 처리 상태를 확인할 수도 있습니다.

**5단계: CogniSwitch 답변 도구:**
- 에이전트를 사용하여 질문을 하세요.
- 지식에서 답변을 받게 됩니다.

### 필요한 라이브러리 가져오기

```python
import warnings

warnings.filterwarnings("ignore")

import os

from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain_community.agent_toolkits import CogniswitchToolkit
from langchain_openai import ChatOpenAI
```

### CogniSwitch 플랫폼 토큰, OAuth 토큰 및 OpenAI API 키

```python
cs_token = "Your CogniSwitch token"
OAI_token = "Your OpenAI API token"
oauth_token = "Your CogniSwitch authentication token"

os.environ["OPENAI_API_KEY"] = OAI_token
```

### 자격 증명으로 CogniSwitch 도구 키트 인스턴스화

```python
cogniswitch_toolkit = CogniswitchToolkit(
    cs_token=cs_token, OAI_token=OAI_token, apiKey=oauth_token
)
```

### CogniSwitch 도구 목록 가져오기

```python
tool_lst = cogniswitch_toolkit.get_tools()
```

### LLM 인스턴스화

```python
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=OAI_token,
    max_tokens=1500,
    model_name="gpt-3.5-turbo-0613",
)
```

### 에이전트 실행기 생성

```python
agent_executor = create_conversational_retrieval_agent(llm, tool_lst, verbose=False)
```

### URL 업로드를 위해 에이전트 호출

```python
response = agent_executor.invoke("upload this url https://cogniswitch.ai/developer")

print(response["output"])
```

```output
The URL https://cogniswitch.ai/developer has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### 파일 업로드를 위해 에이전트 호출

```python
response = agent_executor.invoke("upload this file example_file.txt")

print(response["output"])
```

```output
The file example_file.txt has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### 문서 상태 확인을 위해 에이전트 호출

```python
response = agent_executor.invoke("Tell me the status of this document example_file.txt")

print(response["output"])
```

```output
The status of the document example_file.txt is as follows:

- Created On: 2024-01-22T19:07:42.000+00:00
- Modified On: 2024-01-22T19:07:42.000+00:00
- Document Entry ID: 153
- Status: 0 (Processing)
- Original File Name: example_file.txt
- Saved File Name: 1705950460069example_file29393011.txt

The document is currently being processed.
```

### 질문을 에이전트에 전달하고 답변 받기

```python
response = agent_executor.invoke("How can cogniswitch help develop GenAI applications?")

print(response["output"])
```

```output
CogniSwitch can help develop GenAI applications in several ways:

1. Knowledge Extraction: CogniSwitch can extract knowledge from various sources such as documents, websites, and databases. It can analyze and store data from these sources, making it easier to access and utilize the information for GenAI applications.

2. Natural Language Processing: CogniSwitch has advanced natural language processing capabilities. It can understand and interpret human language, allowing GenAI applications to interact with users in a more conversational and intuitive manner.

3. Sentiment Analysis: CogniSwitch can analyze the sentiment of text data, such as customer reviews or social media posts. This can be useful in developing GenAI applications that can understand and respond to the emotions and opinions of users.

4. Knowledge Base Integration: CogniSwitch can integrate with existing knowledge bases or create new ones. This allows GenAI applications to access a vast amount of information and provide accurate and relevant responses to user queries.

5. Document Analysis: CogniSwitch can analyze documents and extract key information such as entities, relationships, and concepts. This can be valuable in developing GenAI applications that can understand and process large amounts of textual data.

Overall, CogniSwitch provides a range of AI-powered capabilities that can enhance the development of GenAI applications by enabling knowledge extraction, natural language processing, sentiment analysis, knowledge base integration, and document analysis.
```
