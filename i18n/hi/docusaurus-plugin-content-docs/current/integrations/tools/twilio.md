---
translated: true
---

# Twilio

यह नोटबुक [Twilio](https://www.twilio.com) API रैपर का उपयोग करके SMS या [Twilio Messaging Channels](https://www.twilio.com/docs/messaging/channels) के माध्यम से संदेश भेजने के बारे में बताता है।

Twilio Messaging Channels 3rd पार्टी मैसेजिंग ऐप्स के साथ एकीकरण की सुविधा प्रदान करता है और आपको WhatsApp Business Platform (GA), Facebook Messenger (Public Beta) और Google Business Messages (Private Beta) के माध्यम से संदेश भेजने देता है।

## सेटअप

इस उपकरण का उपयोग करने के लिए आपको Python Twilio पैकेज `twilio` स्थापित करना होगा।

```python
%pip install --upgrade --quiet  twilio
```

आपको एक Twilio खाता सेट करना और अपने क्रेडेंशियल प्राप्त करने की भी आवश्यकता होगी। आपको अपना खाता स्ट्रिंग पहचानकर्ता (SID) और प्राधिकरण टोकन की आवश्यकता होगी। आपको संदेश भेजने के लिए एक नंबर भी चाहिए।

आप इन्हें TwilioAPIWrapper में नामित पैरामीटर `account_sid`, `auth_token`, `from_number` के रूप में पास कर सकते हैं, या आप `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` पर्यावरण चर सेट कर सकते हैं।

## एक एसएमएस भेजना

```python
from langchain_community.utilities.twilio import TwilioAPIWrapper
```

```python
twilio = TwilioAPIWrapper(
    #     account_sid="foo",
    #     auth_token="bar",
    #     from_number="baz,"
)
```

```python
twilio.run("hello world", "+16162904619")
```

## एक WhatsApp संदेश भेजना

आपको अपने WhatsApp Business खाते को Twilio के साथ लिंक करने की आवश्यकता होगी। आपको यह भी सुनिश्चित करना होगा कि संदेश भेजने के लिए उपयोग किया जाने वाला नंबर Twilio पर WhatsApp सक्षम प्रेषक के रूप में कॉन्फ़िगर किया गया है और WhatsApp के साथ पंजीकृत है।

```python
from langchain_community.utilities.twilio import TwilioAPIWrapper
```

```python
twilio = TwilioAPIWrapper(
    #     account_sid="foo",
    #     auth_token="bar",
    #     from_number="whatsapp: baz,"
)
```

```python
twilio.run("hello world", "whatsapp: +16162904619")
```
