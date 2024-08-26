---
translated: true
---

# एक्सा खोज

एक्सा की खोज एकीकरण अपने ही [साझेदार पैकेज](https://pypi.org/project/langchain-exa/) में मौजूद है। आप इसे इंस्टॉल कर सकते हैं:

```python
%pip install -qU langchain-exa
```

पैकेज का उपयोग करने के लिए, आपको `EXA_API_KEY` पर्यावरण चर को अपने एक्सा API कुंजी पर भी सेट करना होगा।

## रिट्रीवर

आप मानक पुनर्प्राप्ति पाइपलाइन में [`ExaSearchRetriever`](/docs/integrations/tools/exa_search#using-exasearchretriever) का उपयोग कर सकते हैं। आप इसे निम्नानुसार आयात कर सकते हैं:

```python
from langchain_exa import ExaSearchRetriever
```

## उपकरण

आप [एक्सा उपकरण कॉलिंग दस्तावेज़](/docs/integrations/tools/exa_search#using-the-exa-sdk-as-langchain-agent-tools) में वर्णित के अनुसार एक्सा का एजेंट उपकरण के रूप में उपयोग कर सकते हैं।
