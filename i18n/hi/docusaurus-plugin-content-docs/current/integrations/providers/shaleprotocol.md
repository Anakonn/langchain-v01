---
translated: true
---

# शेल प्रोटोकॉल

[शेल प्रोटोकॉल](https://shaleprotocol.com) ओपन एलएलएम के लिए उत्पादन-तैयार अनुमान एपीआई प्रदान करता है। यह एक प्लग और प्ले एपीआई है क्योंकि यह एक अत्यधिक स्केलेबल जीपीयू क्लाउड बुनियादी ढांचे पर होस्ट किया जाता है।

हमारा मुफ्त स्तर प्रतिदिन 1K अनुरोधों तक का समर्थन करता है क्योंकि हम किसी भी व्यक्ति को जेनएआई ऐप्स बनाना शुरू करने के लिए बाधा को समाप्त करना चाहते हैं।

शेल प्रोटोकॉल के साथ, डेवलपर्स/शोधकर्ता ऐप बना सकते हैं और ओपन एलएलएम की क्षमताओं का पता लगा सकते हैं बिना किसी लागत के।

यह पृष्ठ कवर करता है कि शेल-सर्व एपीआई को LangChain के साथ कैसे शामिल किया जा सकता है।

जून 2023 तक, एपीआई डिफ़ॉल्ट रूप से Vicuna-13B का समर्थन करता है। हम भविष्य के रिलीज़ में Falcon-40B जैसे और एलएलएम का समर्थन करने जा रहे हैं।

## कैसे करें

### 1. https://shaleprotocol.com पर हमारे Discord का लिंक ढूंढें। "शेल बॉट" के माध्यम से हमारे Discord पर एक एपीआई कुंजी जनरेट करें। कोई क्रेडिट कार्ड की आवश्यकता नहीं है और कोई मुफ्त ट्रायल नहीं है। यह एक सदा मुफ्त स्तर है जिसमें प्रतिदिन प्रति एपीआई कुंजी 1K सीमा है।

### 2. https://shale.live/v1 का उपयोग OpenAI API ड्रॉप-इन प्रतिस्थापन के रूप में करें

उदाहरण के लिए

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Shale Protocol"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Shale Protocol"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html", "title": "Shale Protocol"}]-->
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

import os
os.environ['OPENAI_API_BASE'] = "https://shale.live/v1"
os.environ['OPENAI_API_KEY'] = "ENTER YOUR API KEY"

llm = OpenAI()

template = """Question: {question}

# Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)

```
