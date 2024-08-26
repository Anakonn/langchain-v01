---
sidebar_position: 0
title: त्वरित शुरुआत
translated: true
---

# त्वरित शुरुआत

एजेंट फ्रेमवर्क को बेहतर समझने के लिए, आइए एक ऐसा एजेंट बनाते हैं जिसमें दो उपकरण हों: एक ऑनलाइन चीजों को खोजने के लिए, और एक हमारे द्वारा लोड किए गए किसी सूचकांक में विशिष्ट डेटा को खोजने के लिए।

यह [LLMs](/docs/modules/model_io/) और [पुनर्प्राप्ति](/docs/modules/data_connection/) के बारे में ज्ञान का उपयोग करेगा, इसलिए यदि आप इन खंडों का अन्वेषण नहीं कर चुके हैं, तो आपको ऐसा करना अनुशंसित है।

## सेटअप: LangSmith

परिभाषा के अनुसार, एजेंट एक स्वनिर्धारित, इनपुट-निर्भर श्रृंखला के कदम उठाते हैं, जिससे उपयोगकर्ता-मुखी आउटपुट वापस आता है। यह प्रणालियों को डीबग करना विशेष रूप से कठिन बनाता है, और अवलोकनीयता विशेष रूप से महत्वपूर्ण है। [LangSmith](/docs/langsmith) ऐसे मामलों में विशेष रूप से उपयोगी है।

LangChain के साथ बनाते समय, सभी कदम LangSmith में स्वचालित रूप से ट्रेस किए जाएंगे।
LangSmith को सेट करने के लिए हमें केवल निम्नलिखित पर्यावरण चर सेट करने की आवश्यकता है:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="<your-api-key>"
```

## उपकरण परिभाषित करें

पहले हमें उपयोग करने के लिए उपकरण बनाने की आवश्यकता है। हम दो उपकरण का उपयोग करेंगे: [Tavily](/docs/integrations/tools/tavily_search) (ऑनलाइन खोजने के लिए) और फिर हम बनाएंगे एक स्थानीय सूचकांक पर रिट्रीवर

### [Tavily](/docs/integrations/tools/tavily_search)

LangChain में एक अंतर्निहित उपकरण है जिसका उपयोग Tavily खोज इंजन को एक उपकरण के रूप में आसानी से किया जा सकता है।
ध्यान दें कि इसके लिए एक API कुंजी की आवश्यकता है - उनके पास एक मुफ्त स्तर है, लेकिन यदि आपके पास कोई नहीं है या बनाना नहीं चाहते हैं, तो आप हमेशा इस चरण को नजरअंदाज कर सकते हैं।

एक बार जब आप अपनी API कुंजी बना लेते हैं, तो आपको उसे निर्यात करने की आवश्यकता होगी:

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

### रिट्रीवर

हम अपने स्वयं के कुछ डेटा पर एक रिट्रीवर भी बनाएंगे। प्रत्येक चरण के बारे में गहरी व्याख्या के लिए, [इस खंड](/docs/modules/data_connection/) देखें।

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

अब जब हमने अपने सूचकांक को भर दिया है जिसके ऊपर हम पुनर्प्राप्ति करेंगे, तो हम इसे आसानी से एक उपकरण में बदल सकते हैं (एक एजेंट द्वारा सही ढंग से उपयोग करने के लिए आवश्यक प्रारूप)।

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

### उपकरण

अब जब हमने दोनों बना लिए हैं, तो हम उन उपकरणों की एक सूची बना सकते हैं जिनका हम आगे उपयोग करेंगे।

```python
tools = [search, retriever_tool]
```

## एजेंट बनाएं

अब जब हमने उपकरण परिभाषित कर लिए हैं, तो हम एजेंट बना सकते हैं। हम एक OpenAI Functions एजेंट का उपयोग करेंगे - इस प्रकार के एजेंट के बारे में और अधिक जानकारी के लिए, साथ ही अन्य विकल्पों के लिए, [इस गाइड](/docs/modules/agents/agent_types/) देखें।

पहले, हम उस LLM का चयन करते हैं जिसका उपयोग एजेंट को मार्गदर्शन करने के लिए किया जाना है।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

अगला, हम उस प्रॉम्प्ट का चयन करते हैं जिसका उपयोग एजेंट को मार्गदर्शन करने के लिए किया जाना है।

यदि आप इस प्रॉम्प्ट की सामग्री देखना चाहते हैं और LangSmith तक पहुंच रखते हैं, तो आप यहां जा सकते हैं:

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

अब, हम LLM, प्रॉम्प्ट और उपकरणों के साथ एजेंट को प्रारंभ कर सकते हैं। एजेंट इनपुट लेने और कार्रवाई करने के लिए क्या करने का फैसला करने के लिए जिम्मेदार है। महत्वपूर्ण बात यह है कि एजेंट उन कार्रवाइयों को निष्पादित नहीं करता है - यह AgentExecutor (अगला चरण) द्वारा किया जाता है। इन घटकों के बारे में सोचने के तरीके के बारे में अधिक जानकारी के लिए, हमारे [अवधारणात्मक गाइड](/docs/modules/agents/concepts/) देखें।

```python
from langchain.agents import create_tool_calling_agent

agent = create_tool_calling_agent(llm, tools, prompt)
```

अंत में, हम एजेंट (दिमाग) को AgentExecutor (जो बार-बार एजेंट को कॉल करेगा और उपकरणों को निष्पादित करेगा) के भीतर उपकरणों के साथ जोड़ते हैं।

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## एजेंट चलाएं

अब हम कुछ प्रश्नों पर एजेंट चला सकते हैं! ध्यान दें कि अभी ये सभी **स्थिरावस्था** प्रश्न हैं (यह पिछली बातचीत को याद नहीं रखेगा)।

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

## मेमोरी जोड़ना

जैसा कि पहले कहा गया था, यह एजेंट स्थिरावस्था है। इसका मतलब है कि यह पिछली बातचीत को याद नहीं रखता है। इसे मेमोरी देने के लिए हमें पिछले `chat_history` पास करने की आवश्यकता है। ध्यान दें: इसे `chat_history` कहा जाना चाहिए क्योंकि हम जो प्रॉम्प्ट का उपयोग कर रहे हैं उसके कारण। यदि हम एक अलग प्रॉम्प्ट का उपयोग करते हैं, तो हम चर का नाम बदल सकते हैं।

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

यदि हम इन संदेशों को स्वचालित रूप से ट्रैक करना चाहते हैं, तो हम इसे एक RunnableWithMessageHistory में लपेट सकते हैं। इसका उपयोग करने के तरीके के बारे में अधिक जानकारी के लिए, [इस गाइड](/docs/expression_language/how_to/message_history/) देखें।

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

## निष्कर्ष

यह है! इस त्वरित शुरुआत में हमने एक सरल एजेंट बनाने के बारे में कवर किया। एजेंट एक जटिल विषय हैं, और सीखने के लिए बहुत कुछ है! [मुख्य एजेंट पृष्ठ](/docs/modules/agents/) पर वापस जाएं और अवधारणात्मक गाइड, विभिन्न प्रकार के एजेंट, कस्टम उपकरण कैसे बनाएं, और अधिक पर अधिक संसाधन पाएं!
