---
translated: true
---

# वोल्क इंजन मास

यह नोटबुक आपको वोल्क इंजन के एमएएएस एलएलएम मॉडल्स का उपयोग शुरू करने में मदद करता है।

```python
# Install the package
%pip install --upgrade --quiet  volcengine
```

```python
from langchain_community.llms import VolcEngineMaasLLM
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
```

```python
llm = VolcEngineMaasLLM(volc_engine_maas_ak="your ak", volc_engine_maas_sk="your sk")
```

या आप अपने पर्यावरण चर में access_key और secret_key को सेट कर सकते हैं।

```bash
export VOLC_ACCESSKEY=YOUR_AK
export VOLC_SECRETKEY=YOUR_SK
```

```python
chain = PromptTemplate.from_template("给我讲个笑话") | llm | StrOutputParser()
chain.invoke({})
```

```output
'好的，下面是一个笑话：\n\n大学暑假我配了隐形眼镜，回家给爷爷说，我现在配了隐形眼镜。\n爷爷让我给他看看，于是，我用小镊子夹了一片给爷爷看。\n爷爷看完便准备出门，边走还边说：“真高级啊，还真是隐形眼镜！”\n等爷爷出去后我才发现，我刚没夹起来！'
```
