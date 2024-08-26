---
translated: true
---

# Twilio

このノートブックでは、[Twilio](https://www.twilio.com) APIラッパーを使用してSMSまたは[Twilio Messaging Channels](https://www.twilio.com/docs/messaging/channels)を通じてメッセージを送信する方法について説明します。

Twilio Messaging Channelsは、サードパーティのメッセージングアプリとの統合を促進し、WhatsApp Business Platform (GA)、Facebook Messenger (Public Beta)、Google Business Messages (Private Beta)を通じてメッセージを送信できるようにします。

## セットアップ

このツールを使用するには、PythonのTwilioパッケージ`twilio`をインストールする必要があります。

```python
%pip install --upgrade --quiet  twilio
```

また、Twilioアカウントを設定し、クレデンシャルを取得する必要があります。Account String Identifier (SID)とAuth Tokenが必要です。メッセージを送信するための番号も必要です。

これらはTwilioAPIWrapperに名前付きパラメータ`account_sid`、`auth_token`、`from_number`として渡すか、環境変数`TWILIO_ACCOUNT_SID`、`TWILIO_AUTH_TOKEN`、`TWILIO_FROM_NUMBER`を設定することができます。

## SMSの送信

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

## WhatsAppメッセージの送信

TwilioとWhatsApp Businessアカウントをリンクする必要があります。また、メッセージを送信する番号がTwilioでWhatsApp対応送信者として設定されており、WhatsAppに登録されていることを確認する必要があります。

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
