---
translated: true
---

# PromptLayer

>[PromptLayer](https://docs.promptlayer.com/introduction) एक प्रॉम्प्ट इंजीनियरिंग प्लेटफॉर्म है। यह एलएलएम ऑब्जर्वेबिलिटी को भी मदद करता है ताकि अनुरोधों, प्रॉम्प्ट संस्करणों और उपयोग को देखा जा सके।

>जबकि `PromptLayer` के पास LangChain के साथ सीधे एकीकृत एलएलएम हैं (उदाहरण के लिए [`PromptLayerOpenAI`](/docs/integrations/llms/promptlayer_openai)), कॉलबैक का उपयोग करना `PromptLayer` को LangChain के साथ एकीकृत करने का अनुशंसित तरीका है।

इस गाइड में, हम `PromptLayerCallbackHandler` को सेट अप करने के बारे में चर्चा करेंगे।

[PromptLayer docs](https://docs.promptlayer.com/languages/langchain) में अधिक जानकारी देखें।

## स्थापना और सेटअप

```python
%pip install --upgrade --quiet  promptlayer --upgrade
```

### एपीआई क्रेडेंशियल प्राप्त करना

यदि आपके पास PromptLayer खाता नहीं है, तो [promptlayer.com](https://www.promptlayer.com) पर एक बनाएं। फिर नेवबार में सेटिंग्स कॉग पर क्लिक करके एक एपीआई कुंजी प्राप्त करें और इसे `PROMPTLAYER_API_KEY` नामक एक पर्यावरण चर के रूप में सेट करें।

## उपयोग

`PromptLayerCallbackHandler` के साथ शुरू करना काफी सरल है, इसमें दो वैकल्पिक तर्क हैं:
1. `pl_tags` - PromptLayer पर ट्रैक किए जाने वाले स्ट्रिंग्स की एक वैकल्पिक सूची।
2. `pl_id_callback` - एक वैकल्पिक फ़ंक्शन जो `promptlayer_request_id` को तर्क के रूप में लेगा। यह आईडी ट्रैक करने, मेटाडेटा, स्कोर और प्रॉम्प्ट उपयोग के लिए PromptLayer के सभी सुविधाओं के साथ उपयोग किया जा सकता है।

## सरल OpenAI उदाहरण

इस सरल उदाहरण में हम `PromptLayerCallbackHandler` का उपयोग `ChatOpenAI` के साथ करते हैं। हम `chatopenai` नामक एक PromptLayer टैग जोड़ते हैं।

```python
import promptlayer  # Don't forget this 🍰
from langchain_community.callbacks.promptlayer_callback import (
    PromptLayerCallbackHandler,
)
```

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    temperature=0,
    callbacks=[PromptLayerCallbackHandler(pl_tags=["chatopenai"])],
)
llm_results = chat_llm.invoke(
    [
        HumanMessage(content="What comes after 1,2,3 ?"),
        HumanMessage(content="Tell me another joke?"),
    ]
)
print(llm_results)
```

## GPT4All उदाहरण

```python
from langchain_community.llms import GPT4All

model = GPT4All(model="./models/gpt4all-model.bin", n_ctx=512, n_threads=8)
callbacks = [PromptLayerCallbackHandler(pl_tags=["langchain", "gpt4all"])]

response = model.invoke(
    "Once upon a time, ",
    config={"callbacks": callbacks},
)
```

## पूर्ण सुविधा वाला उदाहरण

इस उदाहरण में, हम `PromptLayer` की अधिक शक्ति को अनलॉक करते हैं।

PromptLayer आपको दृश्यमान रूप से प्रॉम्प्ट टेम्प्लेट बनाने, संस्करण और ट्रैक करने की अनुमति देता है। [प्रॉम्प्ट रजिस्ट्री](https://docs.promptlayer.com/features/prompt-registry) का उपयोग करके, हम प्रोग्रामेटिक रूप से `example` नामक प्रॉम्प्ट टेम्प्लेट को पुनः प्राप्त कर सकते हैं।

हम एक `pl_id_callback` फ़ंक्शन भी परिभाषित करते हैं जो `promptlayer_request_id` को लेता है और एक स्कोर, मेटाडेटा लॉग करता है और उपयोग किए गए प्रॉम्प्ट टेम्प्लेट को लिंक करता है। [हमारी दस्तावेज़ों](https://docs.promptlayer.com/features/prompt-history/request-id) पर ट्रैकिंग के बारे में और पढ़ें।

```python
from langchain_openai import OpenAI


def pl_id_callback(promptlayer_request_id):
    print("prompt layer id ", promptlayer_request_id)
    promptlayer.track.score(
        request_id=promptlayer_request_id, score=100
    )  # score is an integer 0-100
    promptlayer.track.metadata(
        request_id=promptlayer_request_id, metadata={"foo": "bar"}
    )  # metadata is a dictionary of key value pairs that is tracked on PromptLayer
    promptlayer.track.prompt(
        request_id=promptlayer_request_id,
        prompt_name="example",
        prompt_input_variables={"product": "toasters"},
        version=1,
    )  # link the request to a prompt template


openai_llm = OpenAI(
    model_name="gpt-3.5-turbo-instruct",
    callbacks=[PromptLayerCallbackHandler(pl_id_callback=pl_id_callback)],
)

example_prompt = promptlayer.prompts.get("example", version=1, langchain=True)
openai_llm.invoke(example_prompt.format(product="toasters"))
```

यही सब है! सेटअप के बाद, आपके सभी अनुरोध PromptLayer डैशबोर्ड पर दिखाई देंगे।
यह कॉलबैक LangChain पर लागू किए गए किसी भी एलएलएम के साथ भी काम करता है।
