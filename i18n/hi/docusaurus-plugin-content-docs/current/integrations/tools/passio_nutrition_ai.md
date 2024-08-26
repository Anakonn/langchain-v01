---
translated: true
---

# त्वरित प्रारंभ

NutritionAI आपके एजेंटों को सुपर फूड-पोषण शक्तियां देने में कैसे मदद कर सकता है, इसे समझने के लिए, आइए एक ऐसा एजेंट बनाएं जो Passio NutritionAI के माध्यम से यह जानकारी प्राप्त कर सके।

## उपकरण परिभाषित करें

हमें पहले [Passio NutritionAI उपकरण](/docs/integrations/tools/passio_nutrition_ai) बनाना होगा।

### [Passio Nutrition AI](/docs/integrations/tools/passio_nutrition_ai)

LangChain में हमारे पास Passio NutritionAI का उपयोग करके खाद्य पोषण तथ्य खोजने के लिए एक बिल्ट-इन उपकरण है।
ध्यान दें कि इसके लिए एक API कुंजी की आवश्यकता है - उनके पास एक मुफ्त स्तर है।

एक बार जब आप अपनी API कुंजी बना लेते हैं, तो आपको इसे निर्यात करना होगा:

```bash
export NUTRITIONAI_SUBSCRIPTION_KEY="..."
```

... या किसी अन्य माध्यम जैसे `dotenv` पैकेज के माध्यम से अपने Python वातावरण में प्रदान करें। आप कंस्ट्रक्टर कॉल के माध्यम से भी कुंजी को स्पष्ट रूप से नियंत्रित कर सकते हैं।

```python
from dotenv import load_dotenv
from langchain_core.utils import get_from_env

load_dotenv()

nutritionai_subscription_key = get_from_env(
    "nutritionai_subscription_key", "NUTRITIONAI_SUBSCRIPTION_KEY"
)
```

```python
from langchain_community.tools.passio_nutrition_ai import NutritionAI
from langchain_community.utilities.passio_nutrition_ai import NutritionAIAPI
```

```python
nutritionai_search = NutritionAI(api_wrapper=NutritionAIAPI())
```

```python
nutritionai_search.invoke("chicken tikka masala")
```

```python
nutritionai_search.invoke("Schnuck Markets sliced pepper jack cheese")
```

### उपकरण

अब जब हमारे पास उपकरण है, तो हम उपयोग में लाने के लिए एक उपकरण सूची बना सकते हैं।

```python
tools = [nutritionai_search]
```

## एजेंट बनाएं

अब जब हमने उपकरण परिभाषित कर लिए हैं, तो हम एजेंट बना सकते हैं। हम एक OpenAI Functions एजेंट का उपयोग करेंगे - इस प्रकार के एजेंट के बारे में और अधिक जानकारी के लिए, साथ ही अन्य विकल्पों के लिए, [इस गाइड](/docs/modules/agents/agent_types/) देखें।

पहले, हम उस LLM का चयन करते हैं जिसे एजेंट को मार्गदर्शन करना चाहिए।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

अगला, हम उस प्रॉम्प्ट का चयन करते हैं जिसका उपयोग एजेंट को मार्गदर्शन करने के लिए किया जाना चाहिए।

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

अब, हम LLM, प्रॉम्प्ट और उपकरणों के साथ एजेंट को प्रारंभ कर सकते हैं। एजेंट इनपुट को लेने और कार्रवाई करने का फैसला करने के लिए जिम्मेदार है। महत्वपूर्ण बात यह है कि एजेंट उन कार्रवाइयों को निष्पादित नहीं करता है - यह AgentExecutor (अगला कदम) द्वारा किया जाता है। इन घटकों के बारे में कैसे सोचना है, इस बारे में अधिक जानकारी के लिए, हमारे [अवधारणात्मक गाइड](/docs/modules/agents/concepts) देखें।

```python
from langchain.agents import create_openai_functions_agent

agent = create_openai_functions_agent(llm, tools, prompt)
```

अंत में, हम एजेंट (दिमाग) को AgentExecutor (जो बार-बार एजेंट को कॉल करेगा और उपकरणों को निष्पादित करेगा) के साथ संयुक्त करते हैं। इन घटकों के बारे में कैसे सोचना है, इस बारे में अधिक जानकारी के लिए, हमारे [अवधारणात्मक गाइड](/docs/modules/agents/concepts) देखें।

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## एजेंट चलाएं

अब हम कुछ प्रश्नों पर एजेंट चला सकते हैं! ध्यान दें कि अभी ये सभी **स्थिरावस्था** प्रश्न हैं (यह पिछले इंटरैक्शन को याद नहीं रखेगा)।

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
agent_executor.invoke({"input": "how many calories are in a slice pepperoni pizza?"})
```

यदि हम इन संदेशों को स्वचालित रूप से ट्रैक करना चाहते हैं, तो हम इसे एक RunnableWithMessageHistory में लपेट सकते हैं। इसका उपयोग करने के बारे में अधिक जानकारी के लिए, [इस गाइड](/docs/expression_language/how_to/message_history) देखें।

```python
agent_executor.invoke(
    {"input": "I had bacon and eggs for breakfast.  How many calories is that?"}
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced pepper jack cheese for a snack.  How much protein did I have?"
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced colby cheese for a snack. Give me calories for this Schnuck Markets product."
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had chicken tikka masala for dinner.  how much calories, protein, and fat did I have with default quantity?"
    }
)
```

## निष्कर्ष

यह है! इस त्वरित प्रारंभ में हमने कवर किया कि कैसे एक सरल एजेंट बनाया जाए जो अपने उत्तरों में खाद्य-पोषण जानकारी को शामिल कर सके। एजेंट एक जटिल विषय हैं, और सीखने के लिए बहुत कुछ है!
