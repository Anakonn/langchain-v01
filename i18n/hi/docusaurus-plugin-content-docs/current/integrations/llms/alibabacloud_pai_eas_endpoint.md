---
translated: true
---

# अलीबाबा क्लाउड PAI EAS

>[अलीबाबा क्लाउड के लिए मशीन लर्निंग प्लेटफॉर्म](https://www.alibabacloud.com/help/en/pai) एक मशीन लर्निंग या गहन लर्निंग इंजीनियरिंग प्लेटफॉर्म है जो उद्यमों और डेवलपर्स के लिए बनाया गया है। यह विभिन्न उद्योग परिदृश्यों में लागू किए जा सकने वाले आसान, लागत प्रभावी, उच्च-प्रदर्शन और आसानी से पैमाने पर बढ़ने वाले प्लग-इन प्रदान करता है। 140 से अधिक बिल्ट-इन अनुकूलन एल्गोरिदम के साथ, `मशीन लर्निंग प्लेटफॉर्म for AI` डेटा लेबलिंग (`PAI-iTAG`), मॉडल बनाना (`PAI-Designer` और `PAI-DSW`), मॉडल प्रशिक्षण (`PAI-DLC`), कंपाइलेशन अनुकूलन और अनुमान तैनाती (`PAI-EAS`) सहित पूरी प्रक्रिया AI इंजीनियरिंग क्षमताएं प्रदान करता है। `PAI-EAS` सीपीयू और जीपीयू सहित विभिन्न प्रकार के हार्डवेयर संसाधनों का समर्थन करता है और उच्च थ्रूपुट और कम लेटेंसी की विशेषता है। यह आपको कुछ क्लिक के साथ बड़े पैमाने पर जटिल मॉडल तैनात करने और वास्तविक समय में लचीली स्केल-इन और स्केल-आउट करने की अनुमति देता है। यह एक व्यापक O&M और मॉनिटरिंग प्रणाली भी प्रदान करता है।

```python
from langchain.chains import LLMChain
from langchain_community.llms.pai_eas_endpoint import PaiEasEndpoint
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

जो कोई EAS LLM का उपयोग करना चाहता है, उसे पहले EAS सेवा सेट अप करनी होगी। जब EAS सेवा लॉन्च की जाती है, तो `EAS_SERVICE_URL` और `EAS_SERVICE_TOKEN` प्राप्त किए जा सकते हैं। उपयोगकर्ता https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/ पर अधिक जानकारी के लिए संदर्भ कर सकते हैं।

```python
import os

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
llm = PaiEasEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

```python
llm_chain = prompt | llm

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
llm_chain.invoke({"question": question})
```

```output
'  Thank you for asking! However, I must respectfully point out that the question contains an error. Justin Bieber was born in 1994, and the Super Bowl was first played in 1967. Therefore, it is not possible for any NFL team to have won the Super Bowl in the year Justin Bieber was born.\n\nI hope this clarifies things! If you have any other questions, please feel free to ask.'
```
