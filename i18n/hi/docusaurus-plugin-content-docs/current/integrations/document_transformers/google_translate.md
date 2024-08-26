---
translated: true
---

# गूगल अनुवाद

[गूगल अनुवाद](https://translate.google.com/) एक बहुभाषीय न्यूरल मशीन अनुवाद सेवा है जिसे गूगल ने एक भाषा से दूसरी भाषा में पाठ, दस्तावेज़ और वेबसाइटों का अनुवाद करने के लिए विकसित किया है।

`GoogleTranslateTransformer` आपको [गूगल क्लाउड अनुवाद API](https://cloud.google.com/translate) का उपयोग करके पाठ और HTML का अनुवाद करने की अनुमति देता है।

इसका उपयोग करने के लिए, आपके पास `google-cloud-translate` पायथन पैकेज स्थापित होना चाहिए, और [अनुवाद API सक्षम](https://cloud.google.com/translate/docs/setup) के साथ एक गूगल क्लाउड परियोजना होनी चाहिए। यह रूपांतरकर्ता [उन्नत संस्करण (v3)](https://cloud.google.com/translate/docs/intro-to-v3) का उपयोग करता है।

- [गूगल न्यूरल मशीन अनुवाद](https://en.wikipedia.org/wiki/Google_Neural_Machine_Translation)
- [उत्पादन पैमाने पर मशीन अनुवाद के लिए एक न्यूरल नेटवर्क](https://blog.research.google/2016/09/a-neural-network-for-machine.html)

```python
%pip install --upgrade --quiet  google-cloud-translate
```

```python
from langchain_core.documents import Document
from langchain_google_community import GoogleTranslateTransformer
```

## इनपुट

यह वह दस्तावेज़ है जिसका हम अनुवाद करेंगे

```python
sample_text = """[Generated with Google Bard]
Subject: Key Business Process Updates

Date: Friday, 27 October 2023

Dear team,

I am writing to provide an update on some of our key business processes.

Sales process

We have recently implemented a new sales process that is designed to help us close more deals and grow our revenue. The new process includes a more rigorous qualification process, a more streamlined proposal process, and a more effective customer relationship management (CRM) system.

Marketing process

We have also revamped our marketing process to focus on creating more targeted and engaging content. We are also using more social media and paid advertising to reach a wider audience.

Customer service process

We have also made some improvements to our customer service process. We have implemented a new customer support system that makes it easier for customers to get help with their problems. We have also hired more customer support representatives to reduce wait times.

Overall, we are very pleased with the progress we have made on improving our key business processes. We believe that these changes will help us to achieve our goals of growing our business and providing our customers with the best possible experience.

If you have any questions or feedback about any of these changes, please feel free to contact me directly.

Thank you,

Lewis Cymbal
CEO, Cymbal Bank
"""
```

`GoogleTranslateTransformer` को प्रारंभ करते समय, आप अनुरोधों को कॉन्फ़िगर करने के लिए निम्नलिखित पैरामीटर शामिल कर सकते हैं।

- `project_id`: गूगल क्लाउड परियोजना आईडी।
- `location`: (वैकल्पिक) अनुवाद मॉडल स्थान।
  - डिफ़ॉल्ट: `global`
- `model_id`: (वैकल्पिक) उपयोग करने के लिए [मॉडल आईडी][models] अनुवाद करें।
- `glossary_id`: (वैकल्पिक) उपयोग करने के लिए [शब्दकोश आईडी][glossaries] अनुवाद करें।
- `api_endpoint`: (वैकल्पिक) उपयोग करने के लिए [क्षेत्रीय एंडपॉइंट][endpoints]।

[models]: https://cloud.google.com/translate/docs/advanced/translating-text-v3#comparing-models
[glossaries]: https://cloud.google.com/translate/docs/advanced/glossary
[endpoints]: https://cloud.google.com/translate/docs/advanced/endpoints

```python
documents = [Document(page_content=sample_text)]
translator = GoogleTranslateTransformer(project_id="<YOUR_PROJECT_ID>")
```

## आउटपुट

एक दस्तावेज़ का अनुवाद करने के बाद, परिणाम `page_content` को लक्ष्य भाषा में अनुवादित किए गए एक नए दस्तावेज़ के रूप में वापस किया जाएगा।

आप `transform_documents()` विधि में निम्नलिखित कीवर्ड पैरामीटर प्रदान कर सकते हैं:

- `target_language_code`: आउटपुट दस्तावेज़ की [ISO 639][iso-639] भाषा कोड।
    - समर्थित भाषाओं के लिए, [भाषा समर्थन][supported-languages] देखें।
- `source_language_code`: (वैकल्पिक) इनपुट दस्तावेज़ की [ISO 639][iso-639] भाषा कोड।
    - प्रदान नहीं किया गया है, तो भाषा स्वचालित रूप से पता लगाई जाएगी।
- `mime_type`: (वैकल्पिक) इनपुट पाठ का [मीडिया प्रकार][media-type]।
    - विकल्प: `text/plain` (डिफ़ॉल्ट), `text/html`।

[iso-639]: https://en.wikipedia.org/wiki/ISO_639
[supported-languages]: https://cloud.google.com/translate/docs/languages
[media-type]: https://en.wikipedia.org/wiki/Media_type

```python
translated_documents = translator.transform_documents(
    documents, target_language_code="es"
)
```

```python
for doc in translated_documents:
    print(doc.metadata)
    print(doc.page_content)
```

```output
{'model': '', 'detected_language_code': 'en'}
[Generado con Google Bard]
Asunto: Actualizaciones clave de procesos comerciales

Fecha: viernes 27 de octubre de 2023

Estimado equipo,

Le escribo para brindarle una actualización sobre algunos de nuestros procesos comerciales clave.

Proceso de ventas

Recientemente implementamos un nuevo proceso de ventas que está diseñado para ayudarnos a cerrar más acuerdos y aumentar nuestros ingresos. El nuevo proceso incluye un proceso de calificación más riguroso, un proceso de propuesta más simplificado y un sistema de gestión de relaciones con el cliente (CRM) más eficaz.

Proceso de mercadeo

También hemos renovado nuestro proceso de marketing para centrarnos en crear contenido más específico y atractivo. También estamos utilizando más redes sociales y publicidad paga para llegar a una audiencia más amplia.

proceso de atención al cliente

También hemos realizado algunas mejoras en nuestro proceso de atención al cliente. Hemos implementado un nuevo sistema de atención al cliente que facilita que los clientes obtengan ayuda con sus problemas. También hemos contratado más representantes de atención al cliente para reducir los tiempos de espera.

En general, estamos muy satisfechos con el progreso que hemos logrado en la mejora de nuestros procesos comerciales clave. Creemos que estos cambios nos ayudarán a lograr nuestros objetivos de hacer crecer nuestro negocio y brindar a nuestros clientes la mejor experiencia posible.

Si tiene alguna pregunta o comentario sobre cualquiera de estos cambios, no dude en ponerse en contacto conmigo directamente.

Gracias,

Platillo Lewis
Director ejecutivo, banco de platillos
```
