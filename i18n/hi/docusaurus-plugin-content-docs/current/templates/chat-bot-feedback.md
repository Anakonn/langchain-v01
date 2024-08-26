---
translated: true
---

# चैट बॉट फीडबैक टेम्प्लेट

यह टेम्प्लेट दिखाता है कि बिना स्पष्ट उपयोगकर्ता फीडबैक के अपने चैट बॉट का मूल्यांकन कैसे करें। यह [chain.py](https://github.com/langchain-ai/langchain/blob/master/templates/chat-bot-feedback/chat_bot_feedback/chain.py) में एक साधारण चैट बॉट और कस्टम इवैलुएटर को परिभाषित करता है जो उपयोगकर्ता के अगले उत्तर के आधार पर बॉट प्रतिक्रिया प्रभावीता को स्कोर करता है। आप इस रन इवैलुएटर को अपने चैट बॉट पर लागू कर सकते हैं `with_config` को सेवा देने से पहले कॉल करके। आप इस टेम्प्लेट का उपयोग करके अपने चैट ऐप को सीधे तैनात भी कर सकते हैं।

[चैट बॉट्स](https://python.langchain.com/docs/use_cases/chatbots) एलएलएम्स को तैनात करने के लिए सबसे सामान्य इंटरफेस में से एक हैं। चैट बॉट्स की गुणवत्ता भिन्न होती है, जिससे सतत विकास महत्वपूर्ण हो जाता है। लेकिन उपयोगकर्ता अक्सर थम्स-अप या थम्स-डाउन बटन जैसे तंत्रों के माध्यम से स्पष्ट फीडबैक छोड़ने से बचते हैं। इसके अलावा, पारंपरिक विश्लेषण जैसे "सत्र की लंबाई" या "वार्तालाप की लंबाई" अक्सर स्पष्टता की कमी रखते हैं। हालांकि, एक चैट बॉट के साथ बहु-टर्न वार्तालाप बहुत सारी जानकारी प्रदान कर सकते हैं, जिसे हम फाइन-ट्यूनिंग, मूल्यांकन, और उत्पाद विश्लेषण के लिए मेट्रिक्स में परिवर्तित कर सकते हैं।

एक केस स्टडी के रूप में [चैट लैंगचेन](https://chat.langchain.com/) को लेते हुए, सभी प्रश्नों में से केवल लगभग 0.04% को स्पष्ट फीडबैक मिलता है। फिर भी, लगभग 70% प्रश्न पिछले प्रश्नों के फॉलो-अप होते हैं। इन फॉलो-अप प्रश्नों का एक महत्वपूर्ण हिस्सा उपयोगी जानकारी जारी रखता है जिसे हम पिछले एआई प्रतिक्रिया की गुणवत्ता का अनुमान लगाने के लिए उपयोग कर सकते हैं।

यह टेम्प्लेट इस "फीडबैक की कमी" समस्या को हल करने में मदद करता है। नीचे इस चैट बॉट का एक उदाहरण इनवोकेशन है:

[](https://smith.langchain.com/public/3378daea-133c-4fe8-b4da-0a3044c5dbe8/r?runtab=1)

जब उपयोगकर्ता इस ([लिंक](https://smith.langchain.com/public/a7e2df54-4194-455d-9978-cecd8be0df1e/r))) का उत्तर देता है, तो प्रतिक्रिया इवैलुएटर सक्रिय होता है, जिससे निम्नलिखित मूल्यांकन रन होता है:

[](https://smith.langchain.com/public/534184ee-db8f-4831-a386-3f578145114c/r)

जैसा कि दिखाया गया है, इवैलुएटर देखता है कि उपयोगकर्ता अधिक से अधिक निराश हो रहा है, जो संकेत करता है कि पिछली प्रतिक्रिया प्रभावी नहीं थी।

## लैंगस्मिथ फीडबैक

[लैंगस्मिथ](https://smith.langchain.com/) प्रोडक्शन-ग्रेड एलएलएम अनुप्रयोगों के निर्माण के लिए एक प्लेटफार्म है। इसके डिबगिंग और ऑफलाइन मूल्यांकन विशेषताओं के अलावा, लैंगस्मिथ आपको अपने एलएलएम अनुप्रयोग को परिष्कृत करने के लिए उपयोगकर्ता और मॉडल-सहायता प्राप्त फीडबैक दोनों को कैप्चर करने में मदद करता है। यह टेम्प्लेट आपके अनुप्रयोग के लिए फीडबैक उत्पन्न करने के लिए एक एलएलएम का उपयोग करता है, जिसका आप अपनी सेवा को निरंतर सुधारने के लिए उपयोग कर सकते हैं। लैंगस्मिथ का उपयोग करके फीडबैक एकत्र करने के अधिक उदाहरणों के लिए, [प्रलेखन](https://docs.smith.langchain.com/cookbook/feedback-examples) देखें।

## इवैलुएटर इम्प्लीमेंटेशन

उपयोगकर्ता फीडबैक को कस्टम `RunEvaluator` द्वारा अनुमानित किया जाता है। इस इवैलुएटर को `EvaluatorCallbackHandler` का उपयोग करके कॉल किया जाता है, जो इसे चैट बॉट के रनटाइम के साथ हस्तक्षेप से बचने के लिए एक अलग थ्रेड में चलाता है। आप इस कस्टम इवैलुएटर को किसी भी संगत चैट बॉट पर निम्नलिखित फंक्शन को अपने लैंगचेन ऑब्जेक्ट पर कॉल करके उपयोग कर सकते हैं:

```python
my_chain.with_config(
    callbacks=[
        EvaluatorCallbackHandler(
            evaluators=[
                ResponseEffectivenessEvaluator(evaluate_response_effectiveness)
            ]
        )
    ],
)
```

इवैलुएटर एलएलएम को निर्देश देता है, विशेष रूप से `gpt-3.5-turbo`, उपयोगकर्ता की फॉलोअप प्रतिक्रिया के आधार पर एआई के सबसे हालिया चैट संदेश का मूल्यांकन करने के लिए। यह एक स्कोर और साथ में तर्क उत्पन्न करता है जिसे लैंगस्मिथ में फीडबैक में परिवर्तित किया जाता है, जिसे `last_run_id` के रूप में प्रदान किए गए मान पर लागू किया जाता है।

एलएलएम में उपयोग किया गया प्रॉम्प्ट [हब पर उपलब्ध है](https://smith.langchain.com/hub/wfh/response-effectiveness)। इसे अतिरिक्त ऐप संदर्भ (जैसे ऐप का लक्ष्य या प्रश्नों के प्रकार जिनका इसे उत्तर देना चाहिए) या "लक्षण" जैसी चीजों के साथ कस्टमाइज़ करने के लिए स्वतंत्र महसूस करें, जिन पर आप एलएलएम को ध्यान केंद्रित करना चाहते हैं। यह इवैलुएटर अधिक सुसंगत, संरचित आउटपुट के लिए ग्रेड के लिए OpenAI के फंक्शन-कॉलिंग एपीआई का भी उपयोग करता है।

## पर्यावरणीय वेरिएबल्स

OpenAI मॉडल का उपयोग करने के लिए सुनिश्चित करें कि `OPENAI_API_KEY` सेट हो। साथ ही, अपने `LANGSMITH_API_KEY` को सेट करके लैंगस्मिथ को कॉन्फ़िगर करें।

```bash
export OPENAI_API_KEY=sk-...
export LANGSMITH_API_KEY=...
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=my-project # Set to the project you want to save to
```

## उपयोग

यदि `LangServe` के माध्यम से तैनात कर रहे हैं, तो हम अनुशंसा करते हैं कि सर्वर को कॉन्फ़िगर करें ताकि वह कॉलबैक ईवेंट्स भी लौटा सके। इससे यह सुनिश्चित होगा कि बैकएंड ट्रेसेस उन ट्रेसेस में शामिल हैं जो आप `RemoteRunnable` का उपयोग करके उत्पन्न करते हैं।

```python
from chat_bot_feedback.chain import chain

add_routes(app, chain, path="/chat-bot-feedback", include_callback_events=True)
```

सर्वर चलाने के साथ, आप 2 टर्न वार्तालाप के लिए चैट बॉट प्रतिक्रियाओं को स्ट्रीम करने के लिए निम्नलिखित कोड स्निपेट का उपयोग कर सकते हैं।

```python
<!--IMPORTS:[{"imported": "tracing_v2_enabled", "source": "langchain.callbacks.manager", "docs": "https://api.python.langchain.com/en/latest/tracers/langchain_core.tracers.context.tracing_v2_enabled.html", "title": "Chat Bot Feedback Template"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.base.BaseMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "Chat Bot Feedback Template"}]-->
from functools import partial
from typing import Dict, Optional, Callable, List
from langserve import RemoteRunnable
from langchain.callbacks.manager import tracing_v2_enabled
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage

# Update with the URL provided by your LangServe server
chain = RemoteRunnable("http://127.0.0.1:8031/chat-bot-feedback")

def stream_content(
    text: str,
    chat_history: Optional[List[BaseMessage]] = None,
    last_run_id: Optional[str] = None,
    on_chunk: Callable = None,
):
    results = []
    with tracing_v2_enabled() as cb:
        for chunk in chain.stream(
            {"text": text, "chat_history": chat_history, "last_run_id": last_run_id},
        ):
            on_chunk(chunk)
            results.append(chunk)
        last_run_id = cb.latest_run.id if cb.latest_run else None
    return last_run_id, "".join(results)

chat_history = []
text = "Where are my keys?"
last_run_id, response_message = stream_content(text, on_chunk=partial(print, end=""))
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
text = "I CAN'T FIND THEM ANYWHERE"  # The previous response will likely receive a low score,
# as the user's frustration appears to be escalating.
last_run_id, response_message = stream_content(
    text,
    chat_history=chat_history,
    last_run_id=str(last_run_id),
    on_chunk=partial(print, end=""),
)
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
```

यह `tracing_v2_enabled` कॉलबैक मैनेजर का उपयोग करके कॉल का रन आईडी प्राप्त करता है, जिसे हम एक ही चैट थ्रेड में बाद के कॉल्स में प्रदान करते हैं, ताकि इवैलुएटर उपयुक्त ट्रेस को फीडबैक असाइन कर सके।

## निष्कर्ष

यह टेम्प्लेट एक साधारण चैट बॉट परिभाषा प्रदान करता है जिसे आप सीधे LangServe का उपयोग करके तैनात कर सकते हैं। यह एक कस्टम इवैलुएटर को परिभाषित करता है जो बिना किसी स्पष्ट उपयोगकर्ता रेटिंग के बॉट के लिए मूल्यांकन फीडबैक को लॉग करता है। यह आपके विश्लेषण को बढ़ाने और फाइन-ट्यूनिंग और मूल्यांकन के लिए बेहतर डेटा पॉइंट्स का चयन करने का एक प्रभावी तरीका है।
