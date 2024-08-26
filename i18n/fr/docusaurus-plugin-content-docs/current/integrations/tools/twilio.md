---
translated: true
---

# Twilio

Ce cahier d'exercices explique comment utiliser l'API wrapper [Twilio](https://www.twilio.com) pour envoyer un message via SMS ou les [Twilio Messaging Channels](https://www.twilio.com/docs/messaging/channels).

Les Twilio Messaging Channels facilitent les intégrations avec des applications de messagerie tierces et vous permettent d'envoyer des messages via la plateforme WhatsApp Business (GA), Facebook Messenger (version bêta publique) et Google Business Messages (version bêta privée).

## Configuration

Pour utiliser cet outil, vous devez installer le package Python Twilio `twilio`

```python
%pip install --upgrade --quiet  twilio
```

Vous devrez également configurer un compte Twilio et obtenir vos identifiants. Vous aurez besoin de votre identifiant de chaîne de compte (SID) et de votre jeton d'authentification. Vous aurez également besoin d'un numéro à partir duquel envoyer des messages.

Vous pouvez soit les transmettre à TwilioAPIWrapper en tant que paramètres nommés `account_sid`, `auth_token`, `from_number`, soit définir les variables d'environnement `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.

## Envoi d'un SMS

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

## Envoi d'un message WhatsApp

Vous devrez lier votre compte d'entreprise WhatsApp avec Twilio. Vous devrez également vous assurer que le numéro à partir duquel envoyer des messages est configuré comme expéditeur activé WhatsApp sur Twilio et enregistré avec WhatsApp.

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
