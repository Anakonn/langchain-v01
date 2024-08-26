---
translated: true
---

# Amazon Comprehend मॉडरेशन श्रृंखला

>[Amazon Comprehend](https://aws.amazon.com/comprehend/) एक प्राकृतिक भाषा प्रसंस्करण (एनएलपी) सेवा है जो मशीन लर्निंग का उपयोग करके पाठ में मूल्यवान अंतर्दृष्टि और कनेक्शन खोजती है।

यह नोटबुक दिखाता है कि कैसे `Amazon Comprehend` का उपयोग करके `व्यक्तिगत रूप से पहचानने योग्य जानकारी` (`PII`) और विषाक्तता का पता लगाया और संभाला जा सकता है।

## सेटअप करना

```python
%pip install --upgrade --quiet  boto3 nltk
```

```python
%pip install --upgrade --quiet  langchain_experimental
```

```python
%pip install --upgrade --quiet  langchain pydantic
```

```python
import os

import boto3

comprehend_client = boto3.client("comprehend", region_name="us-east-1")
```

```python
from langchain_experimental.comprehend_moderation import AmazonComprehendModerationChain

comprehend_moderation = AmazonComprehendModerationChain(
    client=comprehend_client,
    verbose=True,  # optional
)
```

## LLM श्रृंखला के साथ AmazonComprehendModerationChain का उपयोग करना

**नोट**: नीचे दिया गया उदाहरण LangChain से _Fake LLM_ का उपयोग करता है, लेकिन यही अवधारणा अन्य एलएलएम पर भी लागू की जा सकती है।

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate
from langchain_experimental.comprehend_moderation.base_moderation_exceptions import (
    ModerationPiiError,
)

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comprehend_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | comprehend_moderation
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-22-3345. Can you give me some more samples?"
        }
    )
except ModerationPiiError as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config` का उपयोग करके अपने मॉडरेशन को अनुकूलित करना

Amazon Comprehend मॉडरेशन का उपयोग एक कॉन्फ़िगरेशन के साथ करें ताकि आप किन मॉडरेशन को करना चाहते हैं और प्रत्येक के लिए क्या कार्रवाई की जानी चाहिए, इसे नियंत्रित कर सकें। जैसा कि ऊपर दिखाया गया है, कोई कॉन्फ़िगरेशन पास न करने पर तीन अलग-अलग मॉडरेशन होते हैं। ये मॉडरेशन हैं:

- PII (व्यक्तिगत रूप से पहचानने योग्य जानकारी) जांच
- विषाक्त सामग्री का पता लगाना
- प्रॉम्प्ट सुरक्षा का पता लगाना

यहां एक मॉडरेशन कॉन्फ़िगरेशन का उदाहरण है।

```python
from langchain_experimental.comprehend_moderation import (
    BaseModerationConfig,
    ModerationPiiConfig,
    ModerationPromptSafetyConfig,
    ModerationToxicityConfig,
)

pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.5)

moderation_config = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)
```

कॉन्फ़िगरेशन के मूल में तीन कॉन्फ़िगरेशन मॉडल हैं जिनका उपयोग किया जाता है

- `ModerationPiiConfig` PII मान्यता के व्यवहार को कॉन्फ़िगर करने के लिए उपयोग किया जाता है। इसे इनिशियलाइज़ करने के लिए निम्नलिखित पैरामीटर हैं
  - `labels` PII एंटिटी लेबल। डिफ़ॉल्ट रूप से खाली सूची है जिसका मतलब है कि PII मान्यता सभी PII एंटिटियों पर विचार करेगी।
  - `threshold` पता लगाई गई एंटिटियों के लिए विश्वास सीमा, डिफ़ॉल्ट 0.5 या 50% है
  - `redact` एक बूलियन फ्लैग जो यह सुनिश्चित करने के लिए है कि क्या रेडक्शन किया जाना चाहिए, डिफ़ॉल्ट `False` है। जब `False` होता है, तो PII मान्यता त्रुटि उत्पन्न करेगी जब भी कोई PII एंटिटी पता लगाई जाती है, जब `True` पर सेट किया जाता है तो यह सिर्फ पाठ में PII मान्यों को रेडक्ट कर देता है।
  - `mask_character` मास्किंग के लिए उपयोग किया जाने वाला वर्ण, डिफ़ॉल्ट एस्टरिस्क (*) है
- `ModerationToxicityConfig` विषाक्तता मान्यता के व्यवहार को कॉन्फ़िगर करने के लिए उपयोग किया जाता है। इसे इनिशियलाइज़ करने के लिए निम्नलिखित पैरामीटर हैं
  - `labels` विषाक्त एंटिटी लेबल। डिफ़ॉल्ट रूप से खाली सूची है जिसका मतलब है कि विषाक्तता मान्यता सभी विषाक्त एंटिटियों पर विचार करेगी।
  - `threshold` पता लगाई गई एंटिटियों के लिए विश्वास सीमा, डिफ़ॉल्ट 0.5 या 50% है
- `ModerationPromptSafetyConfig` प्रॉम्प्ट सुरक्षा मान्यता के व्यवहार को कॉन्फ़िगर करने के लिए उपयोग किया जाता है
  - `threshold` प्रॉम्प्ट सुरक्षा वर्गीकरण के लिए विश्वास सीमा, डिफ़ॉल्ट 0.5 या 50% है

अंत में, आप `BaseModerationConfig` का उपयोग करते हैं ताकि यह परिभाषित कर सके कि प्रत्येक जांच को किस क्रम में किया जाना है। `BaseModerationConfig` एक वैकल्पिक `filters` पैरामीटर ले सकता है जो उपरोक्त मान्यता जांचों की एक या एक से अधिक सूची हो सकती है, जैसा कि पिछले कोड ब्लॉक में देखा गया है। `BaseModerationConfig` को किसी भी `filters` के साथ भी इनिशियलाइज़ किया जा सकता है, जिस मामले में यह सभी जांचों का उपयोग करेगा (इस पर बाद में और अधिक स्पष्टीकरण दिया गया है)।

पिछले सेल में दिए गए कॉन्फ़िगरेशन का उपयोग करने से PII जांच होगी और प्रॉम्प्ट को पास होने दिया जाएगा, हालांकि यह प्रॉम्प्ट या एलएलएम आउटपुट में मौजूद किसी भी SSN नंबर को मास्क कर देगा।

```python
comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)


try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-45-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## अनूठा आईडी और मॉडरेशन कॉलबैक

जब Amazon Comprehend मॉडरेशन एक्शन किसी भी कॉन्फ़िगर्ड एंटिटी की पहचान करता है, तो श्रृंखला निम्नलिखित में से किसी एक अपवाद को उठाएगी-
    - `ModerationPiiError`, PII जांच के लिए
    - `ModerationToxicityError`, टॉक्सिसिटी जांच के लिए
    - `ModerationPromptSafetyError` प्रॉम्प्ट सुरक्षा जांच के लिए

मॉडरेशन कॉन्फ़िगरेशन के अलावा, `AmazonComprehendModerationChain` को निम्नलिखित पैरामीटर के साथ भी प्रारंभ किया जा सकता है

- `unique_id` [वैकल्पिक] एक स्ट्रिंग पैरामीटर। इस पैरामीटर का उपयोग किसी भी स्ट्रिंग मान या आईडी को पास करने के लिए किया जा सकता है। उदाहरण के लिए, एक चैट एप्लिकेशन में, आप दुर्व्यवहार करने वाले उपयोगकर्ताओं को ट्रैक करना चाहते हैं, इस मामले में, आप उपयोगकर्ता का उपयोगकर्ता नाम/ईमेल आईडी आदि पास कर सकते हैं। यह डिफ़ॉल्ट रूप से `None` है।

- `moderation_callback` [वैकल्पिक] `BaseModerationCallbackHandler` है जो असिंक्रोनस (श्रृंखला के लिए गैर-अवरोधक) रूप से कॉल किया जाएगा। कॉलबैक फ़ंक्शन तब उपयोगी होते हैं जब आप मॉडरेशन फ़ंक्शन निष्पादित होने पर अतिरिक्त कार्रवाई करना चाहते हैं, उदाहरण के लिए किसी डेटाबेस में लॉग करना, या लॉग फ़ाइल लिखना। आप `BaseModerationCallbackHandler` को उपवर्गीकृत करके तीन फ़ंक्शन को ओवरराइड कर सकते हैं - `on_after_pii()`, `on_after_toxicity()`, और `on_after_prompt_safety()`। ध्यान दें कि तीनों फ़ंक्शन `async` फ़ंक्शन होने चाहिए। इन कॉलबैक फ़ंक्शन को दो तर्क मिलते हैं:
    - `moderation_beacon` एक डिक्शनरी है जो मॉडरेशन फ़ंक्शन, Amazon Comprehend मॉडल से पूर्ण प्रतिक्रिया, एक अनूठा श्रृंखला आईडी, मॉडरेशन स्थिति, और जो इनपुट स्ट्रिंग सत्यापित की गई थी, के बारे में जानकारी प्रदान करेगा। डिक्शनरी निम्नलिखित स्कीमा का है-

    ```
    {
        'moderation_chain_id': 'xxx-xxx-xxx', # अनूठा श्रृंखला आईडी
        'moderation_type': 'Toxicity' | 'PII' | 'PromptSafety',
        'moderation_status': 'LABELS_FOUND' | 'LABELS_NOT_FOUND',
        'moderation_input': 'A sample SSN number looks like this 123-456-7890. Can you give me some more samples?',
        'moderation_output': {...} #पूर्ण Amazon Comprehend PII, टॉक्सिसिटी, या प्रॉम्प्ट सुरक्षा मॉडल आउटपुट
    }
    ```

    - `unique_id` यदि `AmazonComprehendModerationChain` को पास किया गया था

<div class="alert alert-block alert-info"> <b>नोट:</b> <code>moderation_callback</code> LangChain श्रृंखला कॉलबैक से अलग है। आप अभी भी `AmazonComprehendModerationChain` के साथ LangChain श्रृंखला कॉलबैक का उपयोग कर सकते हैं कॉलबैक पैरामीटर के माध्यम से। उदाहरण: <br/>
<pre>
from langchain.callbacks.stdout import StdOutCallbackHandler
comp_moderation_with_config = AmazonComprehendModerationChain(verbose=True, callbacks=[StdOutCallbackHandler()])
</pre>
</div>

```python
from langchain_experimental.comprehend_moderation import BaseModerationCallbackHandler
```

```python
# Define callback handlers by subclassing BaseModerationCallbackHandler


class MyModCallback(BaseModerationCallbackHandler):
    async def on_after_pii(self, output_beacon, unique_id):
        import json

        moderation_type = output_beacon["moderation_type"]
        chain_id = output_beacon["moderation_chain_id"]
        with open(f"output-{moderation_type}-{chain_id}.json", "w") as file:
            data = {"beacon_data": output_beacon, "unique_id": unique_id}
            json.dump(data, file)

    """
    async def on_after_toxicity(self, output_beacon, unique_id):
        pass

    async def on_after_prompt_safety(self, output_beacon, unique_id):
        pass
    """


my_callback = MyModCallback()
```

```python
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

moderation_config = BaseModerationConfig(filters=[pii_config, toxicity_config])

comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    unique_id="john.doe@email.com",  # A unique ID
    moderation_callback=my_callback,  # BaseModerationCallbackHandler
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]

llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-456-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config` और मॉडरेशन निष्पादन क्रम

यदि `AmazonComprehendModerationChain` को कोई `moderation_config` के साथ इनिशियलाइज़ नहीं किया गया है, तो इसे `BaseModerationConfig` के डिफ़ॉल्ट मूल्यों के साथ इनिशियलाइज़ किया जाता है। यदि कोई `filters` का उपयोग नहीं किया जाता है, तो मॉडरेशन जांच का क्रम निम्नानुसार है।

```text
AmazonComprehendModerationChain
│
└──Check PII with Stop Action
    ├── Callback (if available)
    ├── Label Found ⟶ [Error Stop]
    └── No Label Found
        └──Check Toxicity with Stop Action
            ├── Callback (if available)
            ├── Label Found ⟶ [Error Stop]
            └── No Label Found
                └──Check Prompt Safety with Stop Action
                    ├── Callback (if available)
                    ├── Label Found ⟶ [Error Stop]
                    └── No Label Found
                        └── Return Prompt
```

यदि किसी भी जांच से मान्यता अपवाद उत्पन्न होता है, तो बाद की जांचें नहीं की जाएंगी। यदि इस मामले में कोई `callback` प्रदान किया जाता है, तो यह उन सभी जांचों के लिए कॉल किया जाएगा जो किए गए हैं। उदाहरण के लिए, उपरोक्त मामले में, यदि श्रृंखला PII की उपस्थिति के कारण विफल हो जाती है, तो Toxicity और Prompt Safety जांचें नहीं की जाएंगी।

आप `moderation_config` पारित करके निष्पादन क्रम को ओवरराइड कर सकते हैं और `BaseModerationConfig` के `filters` पैरामीटर में वांछित क्रम को निर्दिष्ट कर सकते हैं। यदि आप फ़िल्टर निर्दिष्ट करते हैं, तो `filters` पैरामीटर में निर्दिष्ट जांचों का क्रम बनाए रखा जाएगा। उदाहरण के लिए, नीचे दिए गए कॉन्फ़िगरेशन में, पहले Toxicity जांच की जाएगी, फिर PII, और अंत में Prompt Safety मान्यता की जाएगी। इस मामले में, `AmazonComprehendModerationChain` प्रत्येक मॉडल `kwargs` के डिफ़ॉल्ट मूल्यों के साथ निर्दिष्ट जांचों को करेगा।

```python
pii_check = ModerationPiiConfig()
toxicity_check = ModerationToxicityConfig()
prompt_safety_check = ModerationPromptSafetyConfig()

moderation_config = BaseModerationConfig(filters=[toxicity_check, pii_check, prompt_safety_check])
```

आप एक विशिष्ट मॉडरेशन जांच के लिए एक से अधिक कॉन्फ़िगरेशन का भी उपयोग कर सकते हैं, उदाहरण के लिए नीचे दिए गए नमूने में, दो लगातार PII जांचें की जाती हैं। पहला कॉन्फ़िगरेशन किसी भी SSN के लिए जांचता है, यदि मिलता है तो यह एक त्रुटि उत्पन्न करेगा। यदि कोई SSN नहीं मिलता है, तो यह अगली बार प्रॉम्प्ट में किसी भी NAME और CREDIT_DEBIT_NUMBER की उपस्थिति की जांच करेगा और उसे मास्क करेगा।

```python
pii_check_1 = ModerationPiiConfig(labels=["SSN"])
pii_check_2 = ModerationPiiConfig(labels=["NAME", "CREDIT_DEBIT_NUMBER"], redact=True)

moderation_config = BaseModerationConfig(filters=[pii_check_1, pii_check_2])
```

1. PII लेबल की सूची के लिए देखें Amazon Comprehend Universal PII entity types - https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html#how-pii-types
2. उपलब्ध Toxicity लेबल निम्नलिखित हैं-
    - `HATE_SPEECH`: वह भाषण जो किसी पहचान, जाति, जातीयता, लिंग पहचान, धर्म, यौन अभिविन्यास, क्षमता, राष्ट्रीय मूल या किसी अन्य पहचान समूह के आधार पर किसी व्यक्ति या समूह की आलोचना, अपमान, निंदा या मानवीकरण करता है।
    - `GRAPHIC`: वह भाषण जो दृश्यात्मक रूप से वर्णनात्मक, विस्तृत और अप्रिय जीवंत छवियों का उपयोग करता है, इसे ग्राफ़िक माना जाता है। ऐसा भाषण अक्सर विस्तृत किया जाता है ताकि एक अपमान, असुविधा या प्राप्तकर्ता को नुकसान पहुंचाया जा सके।
    - `HARASSMENT_OR_ABUSE`: वह भाषण जो वक्ता और श्रोता के बीच विघटनकारी शक्ति गतिशीलता को लागू करता है, चाहे उद्देश्य जो भी हो, प्राप्तकर्ता के मनोवैज्ञानिक कल्याण को प्रभावित करने का प्रयास करता है, या किसी व्यक्ति को वस्तुगत बनाता है, उसे उत्पीड़न के रूप में वर्गीकृत किया जाना चाहिए।
    - `SEXUAL`: वह भाषण जो शरीर के अंगों या शारीरिक गुणों या यौन संबंधों का प्रत्यक्ष या अप्रत्यक्ष संदर्भ का उपयोग करके यौन रुचि, गतिविधि या उत्तेजना को इंगित करता है, उसे "यौन" के साथ जहरीला माना जाता है।
    - `VIOLENCE_OR_THREAT`: वह भाषण जो किसी व्यक्ति या समूह के प्रति दर्द, चोट या शत्रुता को लागू करने का धमकी देता है, उसे हिंसा या धमकी के रूप में माना जाता है।
    - `INSULT`: वह भाषण जो अवमानना, अपमानजनक, उपहास, अपमानजनक या तुच्छ भाषा को शामिल करता है, उसे अपमान के रूप में माना जाता है।
    - `PROFANITY`: वह भाषण जो अशिष्ट, अश्लील या आपत्तिजनक शब्दों, वाक्यांशों या संक्षिप्ताक्षरों को शामिल करता है, उसे अभद्र माना जाता है।
3. Prompt Safety लेबल की सूची के लिए दस्तावेज़ीकरण [लिंक यहां] देखें

## उदाहरण

### Hugging Face Hub मॉडल के साथ

Hugging Face hub से [API Key प्राप्त करें](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token)

```python
%pip install --upgrade --quiet  huggingface_hub
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "<YOUR HF TOKEN HERE>"
```

```python
# See https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads for some other options
repo_id = "google/flan-t5-xxl"
```

```python
from langchain_community.llms import HuggingFaceHub
from langchain_core.prompts import PromptTemplate

template = """{question}"""

prompt = PromptTemplate.from_template(template)
llm = HuggingFaceHub(
    repo_id=repo_id, model_kwargs={"temperature": 0.5, "max_length": 256}
)
```

एक कॉन्फ़िगरेशन बनाएं और एक Amazon Comprehend Moderation श्रृंखला को इनिशियलाइज़ करें

```python
# define filter configs
pii_config = ModerationPiiConfig(
    labels=["SSN", "CREDIT_DEBIT_NUMBER"], redact=True, mask_character="X"
)

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.8)

# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

`moderation_config` अब थ्रेशोल्ड या 0.5 या 50% से ऊपर स्कोर वाले SSN के अलावा अश्लील शब्दों या वाक्यों, बुरे इरादे या PII वाले किसी भी इनपुट को रोकेगा। यदि यह PII एंटिटीज़ - SSN - पाता है, तो कॉल को आगे बढ़ने से पहले उन्हें रेडैक्ट कर देगा। यह मॉडल के प्रतिक्रिया से किसी भी SSN या क्रेडिट कार्ड नंबर को भी मास्क कर देगा।

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {
            "question": """What is John Doe's address, phone number and SSN from the following text?

John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
"""
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

### Amazon SageMaker Jumpstart के साथ

नीचे दिया गया उदाहरण दिखाता है कि कैसे Amazon Comprehend Moderation श्रृंखला का उपयोग Amazon SageMaker Jumpstart होस्ट किए गए LLM के साथ किया जा सकता है। आपके पास अपने AWS खाते में एक Amazon SageMaker Jumpstart होस्ट किया गया LLM एंडपॉइंट होना चाहिए। Amazon SageMaker Jumpstart होस्ट किए गए एंडपॉइंट के साथ एक LLM को तैनात करने के बारे में अधिक जानकारी के लिए [इस नोटबुक](https://github.com/aws/amazon-sagemaker-examples/blob/main/introduction_to_amazon_algorithms/jumpstart-foundation-models/text-generation-falcon.md) का संदर्भ लें।

```python
endpoint_name = "<SAGEMAKER_ENDPOINT_NAME>"  # replace with your SageMaker Endpoint name
region = "<REGION>"  # replace with your SageMaker Endpoint region
```

```python
import json

from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps({"text_inputs": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json["generated_texts"][0]


content_handler = ContentHandler()

template = """From the following 'Document', precisely answer the 'Question'. Do not add any spurious information in your answer.

Document: John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
Question: {question}
Answer:
"""

# prompt template for input text
llm_prompt = PromptTemplate.from_template(template)

llm = SagemakerEndpoint(
    endpoint_name=endpoint_name,
    region_name=region,
    model_kwargs={
        "temperature": 0.95,
        "max_length": 200,
        "num_return_sequences": 3,
        "top_k": 50,
        "top_p": 0.95,
        "do_sample": True,
    },
    content_handler=content_handler,
)
```

एक कॉन्फ़िगरेशन बनाएं और एक Amazon Comprehend Moderation श्रृंखला को इनिशियलाइज़ करें

```python
# define filter configs
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)


# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(filters=[pii_config, toxicity_config])

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

`moderation_config` अब थ्रेशोल्ड या 0.5 या 50% से ऊपर स्कोर वाले SSN के अलावा अश्लील शब्दों या वाक्यों, बुरे इरादे या PII वाले किसी भी इनपुट और मॉडल आउटपुट को रोकेगा। यदि यह PII एंटिटीज़ - SSN - पाता है, तो कॉल को आगे बढ़ने से पहले उन्हें रेडैक्ट कर देगा।

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {"question": "What is John Doe's address, phone number and SSN?"}
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```
