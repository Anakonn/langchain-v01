---
translated: true
---

# Amazon Kendra

> [Amazon Kendra](https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html) एक बुद्धिमान खोज सेवा है जो `Amazon Web Services` (`AWS`) द्वारा प्रदान की जाती है। यह उन्नत प्राकृतिक भाषा प्रसंस्करण (एनएलपी) और मशीन लर्निंग एल्गोरिदम का उपयोग करता है ताकि किसी संगठन के विभिन्न डेटा स्रोतों में शक्तिशाली खोज क्षमताएं प्रदान की जा सकें। `Kendra` उपयोगकर्ताओं को जल्दी और सटीक रूप से उन्हें चाहिए जानकारी खोजने में मदद करने के लिए डिज़ाइन किया गया है, जिससे उत्पादकता और निर्णय लेने में सुधार होता है।

> `Kendra` के साथ, उपयोगकर्ता विभिन्न प्रकार के सामग्री जैसे दस्तावेज़, FAQs, ज्ञान आधार, मैनुअल और वेबसाइटों में खोज कर सकते हैं। यह कई भाषाओं का समर्थन करता है और जटिल प्रश्नों, समानार्थी शब्दों और संदर्भगत अर्थों को समझने में सक्षम है ताकि अत्यधिक प्रासंगिक खोज परिणाम प्रदान किए जा सकें।

## Amazon Kendra Index Retriever का उपयोग करना

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.retrievers import AmazonKendraRetriever
```

नया Retriever बनाएं

```python
retriever = AmazonKendraRetriever(index_id="c0806df7-e76b-4bce-9b5c-d5582f6b1a03")
```

अब आप Kendra index से प्राप्त दस्तावेजों का उपयोग कर सकते हैं

```python
retriever.invoke("what is langchain")
```
