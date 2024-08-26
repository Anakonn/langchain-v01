---
translated: true
---

# Google 번역

[Google 번역](https://translate.google.com/)은 Google이 개발한 다국어 신경망 기계 번역 서비스로, 텍스트, 문서 및 웹사이트를 한 언어에서 다른 언어로 번역할 수 있습니다.

`GoogleTranslateTransformer`를 사용하면 [Google Cloud Translation API](https://cloud.google.com/translate)를 사용하여 텍스트와 HTML을 번역할 수 있습니다.

이를 사용하려면 `google-cloud-translate` Python 패키지가 설치되어 있어야 하며, [Translation API가 활성화된](https://cloud.google.com/translate/docs/setup) Google Cloud 프로젝트가 있어야 합니다. 이 변환기는 [Advanced edition (v3)](https://cloud.google.com/translate/docs/intro-to-v3)을 사용합니다.

- [Google Neural Machine Translation](https://en.wikipedia.org/wiki/Google_Neural_Machine_Translation)
- [A Neural Network for Machine Translation, at Production Scale](https://blog.research.google/2016/09/a-neural-network-for-machine.html)

```python
%pip install --upgrade --quiet  google-cloud-translate
```

```python
from langchain_core.documents import Document
from langchain_google_community import GoogleTranslateTransformer
```

## 입력

이것은 우리가 번역할 문서입니다.

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

`GoogleTranslateTransformer`를 초기화할 때 다음 매개변수를 포함하여 요청을 구성할 수 있습니다.

- `project_id`: Google Cloud 프로젝트 ID.
- `location`: (선택 사항) 번역 모델 위치.
  - 기본값: `global`
- `model_id`: (선택 사항) 사용할 [모델 ID][models].
- `glossary_id`: (선택 사항) 사용할 [용어집 ID][glossaries].
- `api_endpoint`: (선택 사항) 사용할 [지역 엔드포인트][endpoints].

[models]: https://cloud.google.com/translate/docs/advanced/translating-text-v3#comparing-models
[glossaries]: https://cloud.google.com/translate/docs/advanced/glossary
[endpoints]: https://cloud.google.com/translate/docs/advanced/endpoints

```python
documents = [Document(page_content=sample_text)]
translator = GoogleTranslateTransformer(project_id="<YOUR_PROJECT_ID>")
```

## 출력

문서를 번역한 후에는 `page_content`가 대상 언어로 번역된 새 문서가 반환됩니다.

`transform_documents()` 메서드에 다음 키워드 매개변수를 제공할 수 있습니다:

- `target_language_code`: 출력 문서의 [ISO 639][iso-639] 언어 코드.
    - 지원되는 언어는 [Language support][supported-languages]를 참조하십시오.
- `source_language_code`: (선택 사항) 입력 문서의 [ISO 639][iso-639] 언어 코드.
    - 제공되지 않으면 언어가 자동으로 감지됩니다.
- `mime_type`: (선택 사항) 입력 텍스트의 [Media Type][media-type].
    - 옵션: `text/plain` (기본값), `text/html`.

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
