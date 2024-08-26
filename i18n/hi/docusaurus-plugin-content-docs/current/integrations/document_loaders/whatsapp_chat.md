---
translated: true
---

# WhatsApp चैट

>[WhatsApp](https://www.whatsapp.com/) (जिसे `WhatsApp Messenger` भी कहा जाता है) एक मुफ्त, क्रॉस-प्लेटफ़ॉर्म, केंद्रीकृत तत्काल संदेश (IM) और वॉयस-ओवर-आईपी (VoIP) सेवा है। यह उपयोगकर्ताओं को पाठ और वॉयस संदेश भेजने, वॉयस और वीडियो कॉल करने, और छवियों, दस्तावेजों, उपयोगकर्ता स्थानों और अन्य सामग्री को साझा करने की अनुमति देता है।

यह नोटबुक कवर करता है कि `WhatsApp Chats` से डेटा को किस प्रकार लोड किया जा सकता है ताकि इसे LangChain में इंजेस्ट किया जा सके।

```python
from langchain_community.document_loaders import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader("example_data/whatsapp_chat.txt")
```

```python
loader.load()
```
