---
translated: true
---

## Cogniswitch Tools

**CogniSwitchを使用して、知識を消費、整理、取得する生産準備が整ったアプリケーションを完璧に構築します。この場合、好きなフレームワークを使用して、Langchain CogniSwitchは、適切なストレージおよび取得形式を選択する際の意思決定のストレスを軽減するのに役立ちます。また、生成される応答に関する信頼性の問題や幻覚を排除します。たった2つの簡単なステップで知識と対話を開始しましょう。**

[https://www.cogniswitch.ai/developer to register](https://www.cogniswitch.ai/developer?utm_source=langchain&utm_medium=langchainbuild&utm_id=dev)を訪問してください。

**登録：**

- メールでサインアップし、登録を確認します

- サービスを利用するためのプラットフォームトークンとoauthトークンがメールで送られます。

**ステップ1: ツールキットをインスタンス化してツールを取得する:**

- cogniswitchトークン、openAI APIキー、およびOAuthトークンを使用してcogniswitchツールキットをインスタンス化し、ツールを取得します。

**ステップ2: ツールとllmを使用してエージェントをインスタンス化する:**
- cogniswitchツールのリストとllmを使用して、エージェントエグゼキュータにエージェントをインスタンス化します。

**ステップ3: CogniSwitch Store Tool:**

***CogniSwitch knowledge source file tool***
- ファイルパスを指定してファイルをアップロードするためにエージェントを使用します。（現在サポートされている形式は.pdf、.docx、.doc、.txt、.htmlです）
- ファイルの内容はcogniswitchによって処理され、あなたの知識ストアに保存されます。

***CogniSwitch knowledge source url tool***
- URLをアップロードするためにエージェントを使用します。
- URLの内容はcogniswitchによって処理され、あなたの知識ストアに保存されます。

**ステップ4: CogniSwitch Status Tool:**
- ドキュメント名でアップロードされたドキュメントのステータスを知るためにエージェントを使用します。
- cogniswitchコンソールでドキュメント処理のステータスを確認することもできます。

**ステップ5: CogniSwitch Answer Tool:**
- 質問をするためにエージェントを使用します。
- 回答としてあなたの知識から答えが得られます。

### 必要なライブラリをインポートする

```python
import warnings

warnings.filterwarnings("ignore")

import os

from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain_community.agent_toolkits import CogniswitchToolkit
from langchain_openai import ChatOpenAI
```

### Cogniswitchプラットフォームトークン、OAuthトークン、およびOpenAI APIキー

```python
cs_token = "Your CogniSwitch token"
OAI_token = "Your OpenAI API token"
oauth_token = "Your CogniSwitch authentication token"

os.environ["OPENAI_API_KEY"] = OAI_token
```

### 資格情報を使用してcogniswitchツールキットをインスタンス化する

```python
cogniswitch_toolkit = CogniswitchToolkit(
    cs_token=cs_token, OAI_token=OAI_token, apiKey=oauth_token
)
```

### cogniswitchツールのリストを取得する

```python
tool_lst = cogniswitch_toolkit.get_tools()
```

### llmをインスタンス化する

```python
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=OAI_token,
    max_tokens=1500,
    model_name="gpt-3.5-turbo-0613",
)
```

### エージェントエグゼキュータを作成する

```python
agent_executor = create_conversational_retrieval_agent(llm, tool_lst, verbose=False)
```

### URLをアップロードするためにエージェントを呼び出す

```python
response = agent_executor.invoke("upload this url https://cogniswitch.ai/developer")

print(response["output"])
```

```output
The URL https://cogniswitch.ai/developer has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### ファイルをアップロードするためにエージェントを呼び出す

```python
response = agent_executor.invoke("upload this file example_file.txt")

print(response["output"])
```

```output
The file example_file.txt has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### ドキュメントのステータスを取得するためにエージェントを呼び出す

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

### クエリとともにエージェントを呼び出し、回答を得る

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
