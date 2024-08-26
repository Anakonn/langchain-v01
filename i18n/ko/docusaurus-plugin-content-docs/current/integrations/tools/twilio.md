---
translated: true
---

# Twilio

이 노트북은 [Twilio](https://www.twilio.com) API 래퍼를 사용하여 SMS 또는 [Twilio Messaging Channels](https://www.twilio.com/docs/messaging/channels)를 통해 메시지를 보내는 방법을 설명합니다.

Twilio Messaging Channels는 3rd party 메신저 앱과의 통합을 지원하며, WhatsApp Business Platform (GA), Facebook Messenger (Public Beta), Google Business Messages (Private Beta)를 통해 메시지를 보낼 수 있습니다.

## 설정

이 도구를 사용하려면 Python Twilio 패키지 `twilio`를 설치해야 합니다.

```python
%pip install --upgrade --quiet  twilio
```

또한 Twilio 계정을 설정하고 자격 증명을 얻어야 합니다. Account String Identifier (SID)와 Auth Token이 필요합니다. 메시지를 보낼 번호도 필요합니다.

TwilioAPIWrapper에 `account_sid`, `auth_token`, `from_number`와 같은 이름 지정 매개변수로 전달하거나, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` 환경 변수를 설정할 수 있습니다.

## SMS 보내기

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

## WhatsApp 메시지 보내기

WhatsApp Business 계정을 Twilio와 연결해야 합니다. 또한 메시지를 보낼 번호가 Twilio에서 WhatsApp 사용 가능 발신자로 구성되어 있고 WhatsApp에 등록되어 있는지 확인해야 합니다.

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
