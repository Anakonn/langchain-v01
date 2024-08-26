---
sidebar_position: 0
title: クイックスタート
translated: true
---

# クイックスタート

エージェントフレームワークを最もよく理解するために、オンラインで検索するツールと、ローカルのインデックスに格納されたデータを検索するツールの2つのツールを持つエージェントを構築しましょう。

これは[LLMs](/docs/modules/model_io/)と[retrieval](/docs/modules/data_connection/)の知識を前提としているため、それらのセクションをまだ探索していない場合は、そうすることをお勧めします。

## セットアップ: LangSmith

定義上、エージェントは自己決定的で入力依存の一連のステップを経て、ユーザー向けの出力を返します。このため、これらのシステムのデバッグが特に難しく、可観測性が特に重要になります。[LangSmith](/docs/langsmith)はこのような場合に特に役立ちます。

LangChainで構築する際、すべてのステップが自動的にLangSmithでトレースされます。
LangSmithをセットアップするには、次の環境変数を設定するだけです:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="<your-api-key>"
```

## ツールの定義

まずは使用するツールを作成する必要があります。2つのツールを使用します: [Tavily](/docs/integrations/tools/tavily_search)(オンラインで検索)と、作成したローカルインデックスを使用するリトリーバー。

### [Tavily](/docs/integrations/tools/tavily_search)

LangChainには、Tavilyサーチエンジンをツールとして簡単に使用できる組み込みツールがあります。
APIキーが必要であることに注意してください - 無料のティアがありますが、APIキーを持っていない場合や作成したくない場合は、この手順をスキップできます。

APIキーを作成したら、次のようにエクスポートする必要があります:

```bash
export TAVILY_API_KEY="..."
```

```python
from langchain_community.tools.tavily_search import TavilySearchResults
```

```python
search = TavilySearchResults()
```

```python
search.invoke("what is the weather in SF")
```

```output
[{'url': 'https://www.weatherapi.com/',
  'content': "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.78, 'lon': -122.42, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1712847697, 'localtime': '2024-04-11 8:01'}, 'current': {'last_updated_epoch': 1712847600, 'last_updated': '2024-04-11 08:00', 'temp_c': 11.1, 'temp_f': 52.0, 'is_day': 1, 'condition': {'text': 'Partly cloudy', 'icon': '//cdn.weatherapi.com/weather/64x64/day/116.png', 'code': 1003}, 'wind_mph': 2.2, 'wind_kph': 3.6, 'wind_degree': 10, 'wind_dir': 'N', 'pressure_mb': 1015.0, 'pressure_in': 29.98, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 97, 'cloud': 25, 'feelslike_c': 11.5, 'feelslike_f': 52.6, 'vis_km': 14.0, 'vis_miles': 8.0, 'uv': 4.0, 'gust_mph': 2.8, 'gust_kph': 4.4}}"},
 {'url': 'https://www.yahoo.com/news/april-11-2024-san-francisco-122026435.html',
  'content': "2024 NBA Mock Draft 6.0: Projections for every pick following March Madness With the NCAA tournament behind us, here's an updated look at Yahoo Sports' first- and second-round projections for the ..."},
 {'url': 'https://world-weather.info/forecast/usa/san_francisco/april-2024/',
  'content': 'Extended weather forecast in San Francisco. Hourly Week 10 days 14 days 30 days Year. Detailed ⚡ San Francisco Weather Forecast for April 2024 - day/night 🌡️ temperatures, precipitations - World-Weather.info.'},
 {'url': 'https://www.wunderground.com/hourly/us/ca/san-francisco/94144/date/date/2024-4-11',
  'content': 'Personal Weather Station. Inner Richmond (KCASANFR1685) Location: San Francisco, CA. Elevation: 207ft. Nearby Weather Stations. Hourly Forecast for Today, Thursday 04/11Hourly for Today, Thu 04/11 ...'},
 {'url': 'https://weatherspark.com/h/y/557/2024/Historical-Weather-during-2024-in-San-Francisco-California-United-States',
  'content': 'San Francisco Temperature History 2024\nHourly Temperature in 2024 in San Francisco\nCompare San Francisco to another city:\nCloud Cover in 2024 in San Francisco\nDaily Precipitation in 2024 in San Francisco\nObserved Weather in 2024 in San Francisco\nHours of Daylight and Twilight in 2024 in San Francisco\nSunrise & Sunset with Twilight and Daylight Saving Time in 2024 in San Francisco\nSolar Elevation and Azimuth in 2024 in San Francisco\nMoon Rise, Set & Phases in 2024 in San Francisco\nHumidity Comfort Levels in 2024 in San Francisco\nWind Speed in 2024 in San Francisco\nHourly Wind Speed in 2024 in San Francisco\nHourly Wind Direction in 2024 in San Francisco\nAtmospheric Pressure in 2024 in San Francisco\nData Sources\n See all nearby weather stations\nLatest Report — 3:56 PM\nWed, Jan 24, 2024\xa0\xa0\xa0\xa013 min ago\xa0\xa0\xa0\xa0UTC 23:56\nCall Sign KSFO\nTemp.\n60.1°F\nPrecipitation\nNo Report\nWind\n6.9 mph\nCloud Cover\nMostly Cloudy\n1,800 ft\nRaw: KSFO 242356Z 18006G19KT 10SM FEW015 BKN018 BKN039 16/12 A3004 RMK AO2 SLP171 T01560122 10156 20122 55001\n While having the tremendous advantages of temporal and spatial completeness, these reconstructions: (1) are based on computer models that may have model-based errors, (2) are coarsely sampled on a 50 km grid and are therefore unable to reconstruct the local variations of many microclimates, and (3) have particular difficulty with the weather in some coastal areas, especially small islands.\n We further caution that our travel scores are only as good as the data that underpin them, that weather conditions at any given location and time are unpredictable and variable, and that the definition of the scores reflects a particular set of preferences that may not agree with those of any particular reader.\n 2024 Weather History in San Francisco California, United States\nThe data for this report comes from the San Francisco International Airport.'}]
```

### リトリーバー

独自のデータに対するリトリーバーも作成します。各ステップの詳しい説明については、[このセクション](/docs/modules/data_connection/)を参照してください。

```python
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

loader = WebBaseLoader("https://docs.smith.langchain.com/overview")
docs = loader.load()
documents = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200
).split_documents(docs)
vector = FAISS.from_documents(documents, OpenAIEmbeddings())
retriever = vector.as_retriever()
```

```python
retriever.invoke("how to upload a dataset")[0]
```

```output
Document(page_content='import Clientfrom langsmith.evaluation import evaluateclient = Client()# Define dataset: these are your test casesdataset_name = "Sample Dataset"dataset = client.create_dataset(dataset_name, description="A sample dataset in LangSmith.")client.create_examples(    inputs=[        {"postfix": "to LangSmith"},        {"postfix": "to Evaluations in LangSmith"},    ],    outputs=[        {"output": "Welcome to LangSmith"},        {"output": "Welcome to Evaluations in LangSmith"},    ],    dataset_id=dataset.id,)# Define your evaluatordef exact_match(run, example):    return {"score": run.outputs["output"] == example.outputs["output"]}experiment_results = evaluate(    lambda input: "Welcome " + input[\'postfix\'], # Your AI system goes here    data=dataset_name, # The data to predict and grade over    evaluators=[exact_match], # The evaluators to score the results    experiment_prefix="sample-experiment", # The name of the experiment    metadata={      "version": "1.0.0",      "revision_id":', metadata={'source': 'https://docs.smith.langchain.com/overview', 'title': 'Getting started with LangSmith | 🦜️🛠️ LangSmith', 'description': 'Introduction', 'language': 'en'})
```

リトリーバーを使用するツールとして使用できるように、作成したインデックスを活用します。

```python
from langchain.tools.retriever import create_retriever_tool
```

```python
retriever_tool = create_retriever_tool(
    retriever,
    "langsmith_search",
    "Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
)
```

### ツール

これらを作成したので、エージェントで使用するツールのリストを作成できます。

```python
tools = [search, retriever_tool]
```

## エージェントの作成

ツールを定義したので、エージェントを作成できます。OpenAI Functions エージェントを使用します - このタイプのエージェントの詳細や他のオプションについては、[このガイド](/docs/modules/agents/agent_types/)を参照してください。

まず、エージェントを指導するLLMを選択します。

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

次に、エージェントを指導するプロンプトを選択します。

LangSmithにアクセスできる場合は、このプロンプトの内容を確認できます:

https://smith.langchain.com/hub/hwchase17/openai-functions-agent

```python
from langchain import hub

# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

次に、LLM、プロンプト、ツールを使ってエージェントを初期化します。エージェントは入力を受け取り、実行するアクションを決定する責任があります。重要なのは、エージェントはそれらのアクションを実行しないことです - それはAgentExecutor(次のステップ)が行います。これらのコンポーネントについての考え方の詳細は、[概念ガイド](/docs/modules/agents/concepts/)を参照してください。

```python
from langchain.agents import create_tool_calling_agent

agent = create_tool_calling_agent(llm, tools, prompt)
```

最後に、エージェント(頭脳)とツールをAgentExecutor(エージェントを繰り返し呼び出してツールを実行する)に組み合わせます。

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## エージェントの実行

これで、いくつかのクエリでエージェントを実行できます! 今のところ、これらはすべて**ステートレス**なクエリ(前の対話を記憶しません)です。

```python
agent_executor.invoke({"input": "hi!"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello! How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'hi!', 'output': 'Hello! How can I assist you today?'}
```

```python
agent_executor.invoke({"input": "how can langsmith help with testing?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `langsmith_search` with `{'query': 'how can LangSmith help with testing'}`


[0m[33;1m[1;3mGetting started with LangSmith | 🦜️🛠️ LangSmith

Skip to main contentLangSmith API DocsSearchGo to AppQuick StartUser GuideTracingEvaluationProduction Monitoring & AutomationsPrompt HubProxyPricingSelf-HostingCookbookQuick StartOn this pageGetting started with LangSmithIntroduction​LangSmith is a platform for building production-grade LLM applications. It allows you to closely monitor and evaluate your application, so you can ship quickly and with confidence. Use of LangChain is not necessary - LangSmith works on its own!Install LangSmith​We offer Python and Typescript SDKs for all your LangSmith needs.PythonTypeScriptpip install -U langsmithyarn add langchain langsmithCreate an API key​To create an API key head to the setting pages. Then click Create API Key.Setup your environment​Shellexport LANGCHAIN_TRACING_V2=trueexport LANGCHAIN_API_KEY=<your-api-key># The below examples use the OpenAI API, though it's not necessary in generalexport OPENAI_API_KEY=<your-openai-api-key>Log your first trace​We provide multiple ways to log traces

Learn about the workflows LangSmith supports at each stage of the LLM application lifecycle.Pricing: Learn about the pricing model for LangSmith.Self-Hosting: Learn about self-hosting options for LangSmith.Proxy: Learn about the proxy capabilities of LangSmith.Tracing: Learn about the tracing capabilities of LangSmith.Evaluation: Learn about the evaluation capabilities of LangSmith.Prompt Hub Learn about the Prompt Hub, a prompt management tool built into LangSmith.Additional Resources​LangSmith Cookbook: A collection of tutorials and end-to-end walkthroughs using LangSmith.LangChain Python: Docs for the Python LangChain library.LangChain Python API Reference: documentation to review the core APIs of LangChain.LangChain JS: Docs for the TypeScript LangChain libraryDiscord: Join us on our Discord to discuss all things LangChain!FAQ​How do I migrate projects between organizations?​Currently we do not support project migration betwen organizations. While you can manually imitate this by

team deals with sensitive data that cannot be logged. How can I ensure that only my team can access it?​If you are interested in a private deployment of LangSmith or if you need to self-host, please reach out to us at sales@langchain.dev. Self-hosting LangSmith requires an annual enterprise license that also comes with support and formalized access to the LangChain team.Was this page helpful?NextUser GuideIntroductionInstall LangSmithCreate an API keySetup your environmentLog your first traceCreate your first evaluationNext StepsAdditional ResourcesFAQHow do I migrate projects between organizations?Why aren't my runs aren't showing up in my project?My team deals with sensitive data that cannot be logged. How can I ensure that only my team can access it?CommunityDiscordTwitterGitHubDocs CodeLangSmith SDKPythonJS/TSMoreHomepageBlogLangChain Python DocsLangChain JS/TS DocsCopyright © 2024 LangChain, Inc.[0m[32;1m[1;3mLangSmith is a platform for building production-grade LLM applications that can help with testing in the following ways:

1. **Tracing**: LangSmith provides tracing capabilities that allow you to closely monitor and evaluate your application during testing. You can log traces to track the behavior of your application and identify any issues.

2. **Evaluation**: LangSmith offers evaluation capabilities that enable you to assess the performance of your application during testing. This helps you ensure that your application functions as expected and meets the required standards.

3. **Production Monitoring & Automations**: LangSmith allows you to monitor your application in production and automate certain processes, which can be beneficial for testing different scenarios and ensuring the stability of your application.

4. **Prompt Hub**: LangSmith includes a Prompt Hub, a prompt management tool that can streamline the testing process by providing a centralized location for managing prompts and inputs for your application.

Overall, LangSmith can assist with testing by providing tools for monitoring, evaluating, and automating processes to ensure the reliability and performance of your application during testing phases.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'how can langsmith help with testing?',
 'output': 'LangSmith is a platform for building production-grade LLM applications that can help with testing in the following ways:\n\n1. **Tracing**: LangSmith provides tracing capabilities that allow you to closely monitor and evaluate your application during testing. You can log traces to track the behavior of your application and identify any issues.\n\n2. **Evaluation**: LangSmith offers evaluation capabilities that enable you to assess the performance of your application during testing. This helps you ensure that your application functions as expected and meets the required standards.\n\n3. **Production Monitoring & Automations**: LangSmith allows you to monitor your application in production and automate certain processes, which can be beneficial for testing different scenarios and ensuring the stability of your application.\n\n4. **Prompt Hub**: LangSmith includes a Prompt Hub, a prompt management tool that can streamline the testing process by providing a centralized location for managing prompts and inputs for your application.\n\nOverall, LangSmith can assist with testing by providing tools for monitoring, evaluating, and automating processes to ensure the reliability and performance of your application during testing phases.'}
```

```python
agent_executor.invoke({"input": "whats the weather in sf?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'weather in San Francisco'}`


[0m[36;1m[1;3m[{'url': 'https://www.weatherapi.com/', 'content': "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.78, 'lon': -122.42, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1712847697, 'localtime': '2024-04-11 8:01'}, 'current': {'last_updated_epoch': 1712847600, 'last_updated': '2024-04-11 08:00', 'temp_c': 11.1, 'temp_f': 52.0, 'is_day': 1, 'condition': {'text': 'Partly cloudy', 'icon': '//cdn.weatherapi.com/weather/64x64/day/116.png', 'code': 1003}, 'wind_mph': 2.2, 'wind_kph': 3.6, 'wind_degree': 10, 'wind_dir': 'N', 'pressure_mb': 1015.0, 'pressure_in': 29.98, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 97, 'cloud': 25, 'feelslike_c': 11.5, 'feelslike_f': 52.6, 'vis_km': 14.0, 'vis_miles': 8.0, 'uv': 4.0, 'gust_mph': 2.8, 'gust_kph': 4.4}}"}, {'url': 'https://www.yahoo.com/news/april-11-2024-san-francisco-122026435.html', 'content': "2024 NBA Mock Draft 6.0: Projections for every pick following March Madness With the NCAA tournament behind us, here's an updated look at Yahoo Sports' first- and second-round projections for the ..."}, {'url': 'https://www.weathertab.com/en/c/e/04/united-states/california/san-francisco/', 'content': 'Explore comprehensive April 2024 weather forecasts for San Francisco, including daily high and low temperatures, precipitation risks, and monthly temperature trends. Featuring detailed day-by-day forecasts, dynamic graphs of daily rain probabilities, and temperature trends to help you plan ahead. ... 11 65°F 49°F 18°C 9°C 29% 12 64°F 49°F ...'}, {'url': 'https://weatherspark.com/h/y/557/2024/Historical-Weather-during-2024-in-San-Francisco-California-United-States', 'content': 'San Francisco Temperature History 2024\nHourly Temperature in 2024 in San Francisco\nCompare San Francisco to another city:\nCloud Cover in 2024 in San Francisco\nDaily Precipitation in 2024 in San Francisco\nObserved Weather in 2024 in San Francisco\nHours of Daylight and Twilight in 2024 in San Francisco\nSunrise & Sunset with Twilight and Daylight Saving Time in 2024 in San Francisco\nSolar Elevation and Azimuth in 2024 in San Francisco\nMoon Rise, Set & Phases in 2024 in San Francisco\nHumidity Comfort Levels in 2024 in San Francisco\nWind Speed in 2024 in San Francisco\nHourly Wind Speed in 2024 in San Francisco\nHourly Wind Direction in 2024 in San Francisco\nAtmospheric Pressure in 2024 in San Francisco\nData Sources\n See all nearby weather stations\nLatest Report — 3:56 PM\nWed, Jan 24, 2024\xa0\xa0\xa0\xa013 min ago\xa0\xa0\xa0\xa0UTC 23:56\nCall Sign KSFO\nTemp.\n60.1°F\nPrecipitation\nNo Report\nWind\n6.9 mph\nCloud Cover\nMostly Cloudy\n1,800 ft\nRaw: KSFO 242356Z 18006G19KT 10SM FEW015 BKN018 BKN039 16/12 A3004 RMK AO2 SLP171 T01560122 10156 20122 55001\n While having the tremendous advantages of temporal and spatial completeness, these reconstructions: (1) are based on computer models that may have model-based errors, (2) are coarsely sampled on a 50 km grid and are therefore unable to reconstruct the local variations of many microclimates, and (3) have particular difficulty with the weather in some coastal areas, especially small islands.\n We further caution that our travel scores are only as good as the data that underpin them, that weather conditions at any given location and time are unpredictable and variable, and that the definition of the scores reflects a particular set of preferences that may not agree with those of any particular reader.\n 2024 Weather History in San Francisco California, United States\nThe data for this report comes from the San Francisco International Airport.'}, {'url': 'https://www.msn.com/en-us/weather/topstories/april-11-2024-san-francisco-bay-area-weather-forecast/vi-BB1lrXDb', 'content': 'April 11, 2024 San Francisco Bay Area weather forecast. Posted: April 11, 2024 | Last updated: April 11, 2024 ...'}][0m[32;1m[1;3mThe current weather in San Francisco is partly cloudy with a temperature of 52.0°F (11.1°C). The wind speed is 3.6 kph coming from the north, and the humidity is at 97%.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'whats the weather in sf?',
 'output': 'The current weather in San Francisco is partly cloudy with a temperature of 52.0°F (11.1°C). The wind speed is 3.6 kph coming from the north, and the humidity is at 97%.'}
```

## メモリの追加

前述のように、このエージェントはステートレスです。つまり、前の対話を記憶しません。メモリを与えるには、前の `chat_history` を渡す必要があります。注意: 使用しているプロンプトのため、変数名は `chat_history` である必要があります。別のプロンプトを使用する場合は、変数名を変更できます。

```python
# Here we pass in an empty list of messages for chat_history because it is the first message in the chat
agent_executor.invoke({"input": "hi! my name is bob", "chat_history": []})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello Bob! How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'hi! my name is bob',
 'chat_history': [],
 'output': 'Hello Bob! How can I assist you today?'}
```

```python
from langchain_core.messages import AIMessage, HumanMessage
```

```python
agent_executor.invoke(
    {
        "chat_history": [
            HumanMessage(content="hi! my name is bob"),
            AIMessage(content="Hello Bob! How can I assist you today?"),
        ],
        "input": "what's my name?",
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Bob. How can I assist you, Bob?[0m

[1m> Finished chain.[0m
```

```output
{'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'input': "what's my name?",
 'output': 'Your name is Bob. How can I assist you, Bob?'}
```

これらのメッセージを自動的に追跡したい場合は、RunnableWithMessageHistoryでラップできます。この使用方法の詳細については、[このガイド](/docs/expression_language/how_to/message_history/)を参照してください。

```python
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
```

```python
message_history = ChatMessageHistory()
```

```python
agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    # This is needed because in most real world scenarios, a session id is needed
    # It isn't really used here because we are using a simple in memory ChatMessageHistory
    lambda session_id: message_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

```python
agent_with_chat_history.invoke(
    {"input": "hi! I'm bob"},
    # This is needed because in most real world scenarios, a session id is needed
    # It isn't really used here because we are using a simple in memory ChatMessageHistory
    config={"configurable": {"session_id": "<foo>"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello Bob! How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': "hi! I'm bob",
 'chat_history': [],
 'output': 'Hello Bob! How can I assist you today?'}
```

```python
agent_with_chat_history.invoke(
    {"input": "what's my name?"},
    # This is needed because in most real world scenarios, a session id is needed
    # It isn't really used here because we are using a simple in memory ChatMessageHistory
    config={"configurable": {"session_id": "<foo>"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Bob! How can I help you, Bob?[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name?",
 'chat_history': [HumanMessage(content="hi! I'm bob"),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob! How can I help you, Bob?'}
```

## 結論

以上です! このクイックスタートでは、簡単なエージェントの作成方法を説明しました。エージェントは複雑なトピックで、学ぶことがたくさんあります! [メインのエージェントページ](/docs/modules/agents/)に戻って、概念ガイド、さまざまなタイプのエージェント、カスタムツールの作成方法などの詳細情報を見つけてください。
