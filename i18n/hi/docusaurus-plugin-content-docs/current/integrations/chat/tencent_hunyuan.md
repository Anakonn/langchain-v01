---
sidebar_label: Tencent Hunyuan
translated: true
---

# Tencent Hunyuan

>[Tencent का हाइब्रिड मॉडल एपीआई](https://cloud.tencent.com/document/product/1729) (`Hunyuan API`)
> संवाद संचार, सामग्री निर्माण,
> विश्लेषण और समझ को लागू करता है, और इसे विभिन्न परिदृश्यों जैसे कि बुद्धिमान
> ग्राहक सेवा, बुद्धिमान विपणन, भूमिका निभाने, विज्ञापन कॉपीराइटिंग, उत्पाद विवरण,
> स्क्रिप्ट निर्माण, रिज्यूम निर्माण, लेख लेखन, कोड निर्माण, डेटा विश्लेषण, और सामग्री
> विश्लेषण में व्यापक रूप से उपयोग किया जा सकता है।

[अधिक जानकारी के लिए देखें](https://cloud.tencent.com/document/product/1729)।

```python
from langchain_community.chat_models import ChatHunyuan
from langchain_core.messages import HumanMessage
```

```python
chat = ChatHunyuan(
    hunyuan_app_id=111111111,
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'aime programmer.")
```

## स्ट्रीमिंग के साथ ChatHunyuan के लिए

```python
chat = ChatHunyuan(
    hunyuan_app_id="YOUR_APP_ID",
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
    streaming=True,
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessageChunk(content="J'aime programmer.")
```
