---
translated: true
---

# Twilio

Este cuaderno analiza cómo usar el wrapper de la API de [Twilio](https://www.twilio.com) para enviar un mensaje a través de SMS o [Twilio Messaging Channels](https://www.twilio.com/docs/messaging/channels).

Twilio Messaging Channels facilita las integraciones con aplicaciones de mensajería de terceros y le permite enviar mensajes a través de la plataforma WhatsApp Business (GA), Facebook Messenger (Beta pública) y Google Business Messages (Beta privada).

## Configuración

Para usar esta herramienta, debe instalar el paquete de Python Twilio `twilio`

```python
%pip install --upgrade --quiet  twilio
```

También deberá configurar una cuenta de Twilio y obtener sus credenciales. Necesitará su identificador de cadena de cuenta (SID) y su token de autenticación. También necesitará un número desde el cual enviar mensajes.

Puede pasar estos a TwilioAPIWrapper como parámetros con nombre `account_sid`, `auth_token`, `from_number`, o puede establecer las variables de entorno `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.

## Enviar un SMS

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

## Enviar un mensaje de WhatsApp

Deberá vincular su cuenta empresarial de WhatsApp con Twilio. También deberá asegurarse de que el número desde el que se enviarán los mensajes esté configurado como un remitente habilitado para WhatsApp en Twilio y registrado con WhatsApp.

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
