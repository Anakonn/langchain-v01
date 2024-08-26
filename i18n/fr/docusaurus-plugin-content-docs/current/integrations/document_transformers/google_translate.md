---
translated: true
---

# Google Translate

[Google Translate](https://translate.google.com/) est un service de traduction automatique neuronale multilingue développé par Google pour traduire du texte, des documents et des sites Web d'une langue à une autre.

Le `GoogleTranslateTransformer` vous permet de traduire du texte et du HTML avec l'[API Google Cloud Translation](https://cloud.google.com/translate).

Pour l'utiliser, vous devez avoir le package python `google-cloud-translate` installé et un projet Google Cloud avec l'[API Translation activée](https://cloud.google.com/translate/docs/setup). Ce transformateur utilise l'[édition avancée (v3)](https://cloud.google.com/translate/docs/intro-to-v3).

- [Google Neural Machine Translation](https://en.wikipedia.org/wiki/Google_Neural_Machine_Translation)
- [Un réseau neuronal pour la traduction automatique, à l'échelle de la production](https://blog.research.google/2016/09/a-neural-network-for-machine.html)

```python
%pip install --upgrade --quiet  google-cloud-translate
```

```python
from langchain_core.documents import Document
from langchain_google_community import GoogleTranslateTransformer
```

## Entrée

Voici le document que nous allons traduire

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

Lors de l'initialisation du `GoogleTranslateTransformer`, vous pouvez inclure les paramètres suivants pour configurer les requêtes.

- `project_id` : ID du projet Google Cloud.
- `location` : (Facultatif) Emplacement du modèle de traduction.
  - Par défaut : `global`
- `model_id` : (Facultatif) [ID du modèle de traduction][models] à utiliser.
- `glossary_id` : (Facultatif) [ID du glossaire][glossaries] à utiliser.
- `api_endpoint` : (Facultatif) [Point de terminaison régional][endpoints] à utiliser.

[models] : https://cloud.google.com/translate/docs/advanced/translating-text-v3#comparing-models
[glossaries] : https://cloud.google.com/translate/docs/advanced/glossary
[endpoints] : https://cloud.google.com/translate/docs/advanced/endpoints

```python
documents = [Document(page_content=sample_text)]
translator = GoogleTranslateTransformer(project_id="<YOUR_PROJECT_ID>")
```

## Sortie

Après avoir traduit un document, le résultat sera renvoyé sous la forme d'un nouveau document avec le `page_content` traduit dans la langue cible.

Vous pouvez fournir les paramètres de mot-clé suivants à la méthode `transform_documents()` :

- `target_language_code` : code de langue [ISO 639][iso-639] du document de sortie.
    - Pour les langues prises en charge, reportez-vous à [Prise en charge des langues][supported-languages].
- `source_language_code` : (Facultatif) code de langue [ISO 639][iso-639] du document d'entrée.
    - S'il n'est pas fourni, la langue sera détectée automatiquement.
- `mime_type` : (Facultatif) [Type de média][media-type] du texte d'entrée.
    - Options : `text/plain` (par défaut), `text/html`.

[iso-639] : https://en.wikipedia.org/wiki/ISO_639
[supported-languages] : https://cloud.google.com/translate/docs/languages
[media-type] : https://en.wikipedia.org/wiki/Media_type

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
