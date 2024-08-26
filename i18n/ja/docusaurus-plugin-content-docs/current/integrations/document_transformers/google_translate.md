---
translated: true
---

# Google 翻訳

[Google 翻訳](https://translate.google.com/)は、Google が開発した多言語ニューラル機械翻訳サービスで、テキスト、文書、ウェブサイトを1つの言語から別の言語に翻訳することができます。

`GoogleTranslateTransformer`を使うと、[Google Cloud Translation API](https://cloud.google.com/translate)を使ってテキストやHTMLを翻訳できます。

使用するには、`google-cloud-translate`Pythonパッケージをインストールし、[Translation APIが有効化された](https://cloud.google.com/translate/docs/setup)Google Cloudプロジェクトが必要です。このトランスフォーマーは[高度版(v3)](https://cloud.google.com/translate/docs/intro-to-v3)を使用します。

- [Google Neural Machine Translation](https://en.wikipedia.org/wiki/Google_Neural_Machine_Translation)
- [A Neural Network for Machine Translation, at Production Scale](https://blog.research.google/2016/09/a-neural-network-for-machine.html)

```python
%pip install --upgrade --quiet  google-cloud-translate
```

```python
from langchain_core.documents import Document
from langchain_google_community import GoogleTranslateTransformer
```

## 入力

これは翻訳するドキュメントです。

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

`GoogleTranslateTransformer`を初期化する際は、以下のパラメータを含めて要求を設定できます。

- `project_id`: Google CloudプロジェクトのID。
- `location`: (オプション) 翻訳モデルの場所。
  - デフォルト: `global`
- `model_id`: (オプション) 使用する[翻訳モデルID][models]。
- `glossary_id`: (オプション) 使用する[用語集ID][glossaries]。
- `api_endpoint`: (オプション) 使用する[リージョンエンドポイント][endpoints]。

[models]: https://cloud.google.com/translate/docs/advanced/translating-text-v3#comparing-models
[glossaries]: https://cloud.google.com/translate/docs/advanced/glossary
[endpoints]: https://cloud.google.com/translate/docs/advanced/endpoints

```python
documents = [Document(page_content=sample_text)]
translator = GoogleTranslateTransformer(project_id="<YOUR_PROJECT_ID>")
```

## 出力

ドキュメントを翻訳すると、`page_content`が対象言語に翻訳された新しいドキュメントが返されます。

`transform_documents()`メソッドには以下のキーワードパラメータを指定できます:

- `target_language_code`: 出力ドキュメントの[ISO 639][iso-639]言語コード。
    - 対応言語については[Language support][supported-languages]を参照してください。
- `source_language_code`: (オプション) 入力ドキュメントの[ISO 639][iso-639]言語コード。
    - 指定しない場合は自動検出されます。
- `mime_type`: (オプション) 入力テキストの[メディアタイプ][media-type]。
    - オプション: `text/plain` (デフォルト), `text/html`.

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
