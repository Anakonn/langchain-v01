---
sidebar_position: 2
title: Anonimización multilingüe
translated: true
---

# Anonimización de datos multilingüe con Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/multi_language.ipynb)

## Caso de uso

El soporte multilingüe en la seudonimización de datos es esencial debido a las diferencias en las estructuras lingüísticas y los contextos culturales. Los diferentes idiomas pueden tener formatos variables para los identificadores personales. Por ejemplo, la estructura de los nombres, las ubicaciones y las fechas puede diferir mucho entre idiomas y regiones. Además, los caracteres no alfanuméricos, los acentos y la dirección de la escritura pueden afectar a los procesos de seudonimización. Sin el soporte multilingüe, los datos podrían seguir siendo identificables o ser malinterpretados, comprometiendo la privacidad y la precisión de los datos. Por lo tanto, permite una seudonimización eficaz y precisa adaptada a las operaciones globales.

## Resumen

La detección de PII en Microsoft Presidio se basa en varios componentes: además del habitual emparejamiento de patrones (por ejemplo, usando regex), el analizador utiliza un modelo de Reconocimiento de Entidades Nombradas (NER) para extraer entidades como:
- `PERSON`
- `LOCATION`
- `DATE_TIME`
- `NRP`
- `ORGANIZATION`

[[Source]](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)

Para manejar el NER en idiomas específicos, utilizamos modelos únicos de la biblioteca `spaCy`, reconocida por su amplia selección que cubre múltiples idiomas y tamaños. Sin embargo, no es restrictivo, lo que permite la integración de marcos alternativos como [Stanza](https://microsoft.github.io/presidio/analyzer/nlp_engines/spacy_stanza/) o [transformers](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/) cuando es necesario.

## Inicio rápido

%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker

```python
# Download model
!python -m spacy download en_core_web_lg
```

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
)
```

Por defecto, `PresidioAnonymizer` y `PresidioReversibleAnonymizer` utilizan un modelo entrenado en textos en inglés, por lo que manejan otros idiomas de forma moderada.

Por ejemplo, aquí el modelo no detectó a la persona:

```python
anonymizer.anonymize("Me llamo Sofía")  # "My name is Sofía" in Spanish
```

```output
'Me llamo Sofía'
```

También pueden tomar palabras de otro idioma como entidades reales. Aquí, tanto la palabra *'Yo'* como *Sofía* han sido clasificadas como `PERSON`:

```python
anonymizer.anonymize("Yo soy Sofía")  # "I am Sofía" in Spanish
```

```output
'Kari Lopez soy Mary Walker'
```

Si quieres anonimizar textos de otros idiomas, necesitas descargar otros modelos y agregarlos a la configuración del anonimizador:

```python
# Download the models for the languages you want to use
# ! python -m spacy download en_core_web_md
# ! python -m spacy download es_core_news_md
```

```python
nlp_config = {
    "nlp_engine_name": "spacy",
    "models": [
        {"lang_code": "en", "model_name": "en_core_web_md"},
        {"lang_code": "es", "model_name": "es_core_news_md"},
    ],
}
```

Por lo tanto, hemos agregado un modelo de idioma español. Tenga en cuenta también que hemos descargado un modelo alternativo para el inglés: en este caso hemos reemplazado el modelo grande `en_core_web_lg` (560MB) por su versión más pequeña `en_core_web_md` (40MB), ¡por lo que el tamaño se reduce 14 veces! Si te preocupa la velocidad de anonimización, vale la pena considerarlo.

Todos los modelos para los diferentes idiomas se pueden encontrar en la [documentación de spaCy](https://spacy.io/usage/models).

Ahora pasa la configuración como el parámetro `languages_config` al Anonymiser. Como puedes ver, los dos ejemplos anteriores funcionan a la perfección:

```python
anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
    languages_config=nlp_config,
)

print(
    anonymizer.anonymize("Me llamo Sofía", language="es")
)  # "My name is Sofía" in Spanish
print(anonymizer.anonymize("Yo soy Sofía", language="es"))  # "I am Sofía" in Spanish
```

```output
Me llamo Christopher Smith
Yo soy Joseph Jenkins
```

Por defecto, el idioma indicado en primer lugar en la configuración se utilizará al anonimizar el texto (en este caso, el inglés):

```python
print(anonymizer.anonymize("My name is John"))
```

```output
My name is Shawna Bennett
```

## Uso con otros marcos

### Detección de idioma

Uno de los inconvenientes del enfoque presentado es que tenemos que pasar el **idioma** del texto de entrada directamente. Sin embargo, hay un remedio para eso: las bibliotecas de *detección de idioma*.

Recomendamos usar uno de los siguientes marcos:
- fasttext (recomendado)
- langdetect

Según nuestra experiencia, *fasttext* tiene un rendimiento un poco mejor, pero debes verificarlo en tu caso de uso.

```python
# Install necessary packages
%pip install --upgrade --quiet  fasttext langdetect
```

### langdetect

```python
import langdetect
from langchain.schema import runnable


def detect_language(text: str) -> dict:
    language = langdetect.detect(text)
    print(language)
    return {"text": text, "language": language}


chain = runnable.RunnableLambda(detect_language) | (
    lambda x: anonymizer.anonymize(x["text"], language=x["language"])
)
```

```python
chain.invoke("Me llamo Sofía")
```

```output
es
```

```output
'Me llamo Michael Perez III'
```

```python
chain.invoke("My name is John Doe")
```

```output
en
```

```output
'My name is Ronald Bennett'
```

### fasttext

Primero debes descargar el modelo fasttext de https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz

```python
import fasttext

model = fasttext.load_model("lid.176.ftz")


def detect_language(text: str) -> dict:
    language = model.predict(text)[0][0].replace("__label__", "")
    print(language)
    return {"text": text, "language": language}


chain = runnable.RunnableLambda(detect_language) | (
    lambda x: anonymizer.anonymize(x["text"], language=x["language"])
)
```

```output
Warning : `load_model` does not return WordVectorModel or SupervisedModel any more, but a `FastText` object which is very similar.
```

```python
chain.invoke("Yo soy Sofía")
```

```output
es
```

```output
'Yo soy Angela Werner'
```

```python
chain.invoke("My name is John Doe")
```

```output
en
```

```output
'My name is Carlos Newton'
```

De esta manera, solo necesitas inicializar el modelo con los motores correspondientes a los idiomas relevantes, pero el uso de la herramienta está totalmente automatizado.

## Uso avanzado

### Etiquetas personalizadas en el modelo NER

Puede ser que el modelo spaCy tenga nombres de clase diferentes a los compatibles con Microsoft Presidio por defecto. Toma el polaco, por ejemplo:

```python
# ! python -m spacy download pl_core_news_md

import spacy

nlp = spacy.load("pl_core_news_md")
doc = nlp("Nazywam się Wiktoria")  # "My name is Wiktoria" in Polish

for ent in doc.ents:
    print(
        f"Text: {ent.text}, Start: {ent.start_char}, End: {ent.end_char}, Label: {ent.label_}"
    )
```

```output
Text: Wiktoria, Start: 12, End: 20, Label: persName
```

El nombre *Victoria* se clasificó como `persName`, que no se corresponde con los nombres de clase predeterminados `PERSON`/`PER` implementados en Microsoft Presidio (busca `CHECK_LABEL_GROUPS` en [implementación de SpacyRecognizer](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)).

Puedes obtener más información sobre las etiquetas personalizadas en los modelos spaCy (incluidos los tuyos propios, entrenados) en [este hilo](https://github.com/microsoft/presidio/issues/851).

Es por eso que nuestra frase no se anonimizará:

```python
nlp_config = {
    "nlp_engine_name": "spacy",
    "models": [
        {"lang_code": "en", "model_name": "en_core_web_md"},
        {"lang_code": "es", "model_name": "es_core_news_md"},
        {"lang_code": "pl", "model_name": "pl_core_news_md"},
    ],
}

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "LOCATION", "DATE_TIME"],
    languages_config=nlp_config,
)

print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```

```output
Nazywam się Wiktoria
```

Para abordar esto, crea tu propio `SpacyRecognizer` con tu propia asignación de clases y agrégalo al anonimizador:

```python
from presidio_analyzer.predefined_recognizers import SpacyRecognizer

polish_check_label_groups = [
    ({"LOCATION"}, {"placeName", "geogName"}),
    ({"PERSON"}, {"persName"}),
    ({"DATE_TIME"}, {"date", "time"}),
]

spacy_recognizer = SpacyRecognizer(
    supported_language="pl",
    check_label_groups=polish_check_label_groups,
)

anonymizer.add_recognizer(spacy_recognizer)
```

Ahora todo funciona sin problemas:

```python
print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```

```output
Nazywam się Morgan Walters
```

Probemos con un ejemplo más complejo:

```python
print(
    anonymizer.anonymize(
        "Nazywam się Wiktoria. Płock to moje miasto rodzinne. Urodziłam się dnia 6 kwietnia 2001 roku",
        language="pl",
    )
)  # "My name is Wiktoria. Płock is my home town. I was born on 6 April 2001" in Polish
```

```output
Nazywam się Ernest Liu. New Taylorburgh to moje miasto rodzinne. Urodziłam się 1987-01-19
```

Como puedes ver, gracias a la asignación de clases, el anonimizador puede manejar diferentes tipos de entidades.

### Operadores personalizados específicos del idioma

En el ejemplo anterior, la oración se ha anonimizado correctamente, pero los datos falsos no se ajustan en absoluto al idioma polaco. Por lo tanto, se pueden agregar operadores personalizados, que resolverán el problema:

```python
from faker import Faker
from presidio_anonymizer.entities import OperatorConfig

fake = Faker(locale="pl_PL")  # Setting faker to provide Polish data

new_operators = {
    "PERSON": OperatorConfig("custom", {"lambda": lambda _: fake.first_name_female()}),
    "LOCATION": OperatorConfig("custom", {"lambda": lambda _: fake.city()}),
}

anonymizer.add_operators(new_operators)
```

```python
print(
    anonymizer.anonymize(
        "Nazywam się Wiktoria. Płock to moje miasto rodzinne. Urodziłam się dnia 6 kwietnia 2001 roku",
        language="pl",
    )
)  # "My name is Wiktoria. Płock is my home town. I was born on 6 April 2001" in Polish
```

```output
Nazywam się Marianna. Szczecin to moje miasto rodzinne. Urodziłam się 1976-11-16
```

### Limitaciones

¡Recuerda que los resultados son tan buenos como tus reconocedores y tus modelos de NER!

Mira el ejemplo a continuación: descargamos el modelo pequeño para español (12 MB) y ya no funciona tan bien como la versión mediana (40 MB):

```python
# ! python -m spacy download es_core_news_sm

for model in ["es_core_news_sm", "es_core_news_md"]:
    nlp_config = {
        "nlp_engine_name": "spacy",
        "models": [
            {"lang_code": "es", "model_name": model},
        ],
    }

    anonymizer = PresidioReversibleAnonymizer(
        analyzed_fields=["PERSON"],
        languages_config=nlp_config,
    )

    print(
        f"Model: {model}. Result: {anonymizer.anonymize('Me llamo Sofía', language='es')}"
    )
```

```output
Model: es_core_news_sm. Result: Me llamo Sofía
Model: es_core_news_md. Result: Me llamo Lawrence Davis
```

En muchos casos, incluso los modelos más grandes de spaCy no serán suficientes: ya existen otros métodos más complejos y mejores para detectar entidades nombradas, basados en transformadores. Puedes leer más sobre esto [aquí](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/).
