---
sidebar_label: Volc Enging Maas
translated: true
---

# VolcEngineMaasChat

यह नोटबुक आपको volc engine maas chat मॉडल्स का उपयोग शुरू करने में मदद करता है।

```python
# Install the package
%pip install --upgrade --quiet  volcengine
```

```python
from langchain_community.chat_models import VolcEngineMaasChat
from langchain_core.messages import HumanMessage
```

```python
chat = VolcEngineMaasChat(volc_engine_maas_ak="your ak", volc_engine_maas_sk="your sk")
```

या आप अपने पर्यावरण चर में access_key और secret_key को सेट कर सकते हैं

```bash
export VOLC_ACCESSKEY=YOUR_AK
export VOLC_SECRETKEY=YOUR_SK
```

```python
chat([HumanMessage(content="给我讲个笑话")])
```

```output
AIMessage(content='好的，这是一个笑话：\n\n为什么鸟儿不会玩电脑游戏？\n\n因为它们没有翅膀！')
```

# volc engine maas chat with stream

```python
chat = VolcEngineMaasChat(
    volc_engine_maas_ak="your ak",
    volc_engine_maas_sk="your sk",
    streaming=True,
)
```

```python
chat([HumanMessage(content="给我讲个笑话")])
```

```output
AIMessage(content='好的，这是一个笑话：\n\n三岁的女儿说她会造句了，妈妈让她用“年轻”造句，女儿说：“妈妈减肥，一年轻了好几斤”。')
```
