---
sidebar_position: 2
title: Anonymisation multilingue
translated: true
---

# Anonymisation de données multilingues avec Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/multi_language.ipynb)

## Cas d'utilisation

La prise en charge des langues multiples dans la pseudonymisation des données est essentielle en raison des différences dans les structures linguistiques et les contextes culturels. Les différentes langues peuvent avoir des formats variables pour les identifiants personnels. Par exemple, la structure des noms, des lieux et des dates peut grandement différer entre les langues et les régions. De plus, les caractères non alphanumériques, les accents et le sens de l'écriture peuvent avoir un impact sur les processus de pseudonymisation. Sans prise en charge multilingue, les données pourraient rester identifiables ou être mal interprétées, compromettant la confidentialité et l'exactitude des données. Par conséquent, cela permet une pseudonymisation efficace et précise adaptée aux opérations mondiales.

## Aperçu

La détection des informations d'identification personnelle (PII) dans Microsoft Presidio s'appuie sur plusieurs composants - en plus de la correspondance de motifs habituelle (par exemple, à l'aide d'expressions régulières), l'analyseur utilise un modèle de reconnaissance d'entités nommées (NER) pour extraire des entités telles que :
- `PERSON`
- `LOCATION`
- `DATE_TIME`
- `NRP`
- `ORGANIZATION`

[[Source]](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)

Pour gérer la NER dans des langues spécifiques, nous utilisons des modèles uniques de la bibliothèque `spaCy`, reconnue pour sa vaste sélection couvrant plusieurs langues et tailles. Cependant, ce n'est pas restrictif, permettant l'intégration d'autres frameworks tels que [Stanza](https://microsoft.github.io/presidio/analyzer/nlp_engines/spacy_stanza/) ou [transformers](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/) si nécessaire.

## Démarrage rapide

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

Par défaut, `PresidioAnonymizer` et `PresidioReversibleAnonymizer` utilisent un modèle entraîné sur des textes anglais, donc ils gèrent modérément bien les autres langues.

Par exemple, ici le modèle n'a pas détecté la personne :

```python
anonymizer.anonymize("Me llamo Sofía")  # "My name is Sofía" in Spanish
```

```output
'Me llamo Sofía'
```

Ils peuvent également prendre des mots d'une autre langue comme des entités réelles. Ici, les mots *'Yo'* (*'Je'* en espagnol) et *Sofía* ont tous deux été classés comme `PERSON` :

```python
anonymizer.anonymize("Yo soy Sofía")  # "I am Sofía" in Spanish
```

```output
'Kari Lopez soy Mary Walker'
```

Si vous voulez anonymiser des textes dans d'autres langues, vous devez télécharger d'autres modèles et les ajouter à la configuration de l'anonymiseur :

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

Nous avons donc ajouté un modèle de langue espagnole. Notez également que nous avons téléchargé un modèle alternatif pour l'anglais - dans ce cas, nous avons remplacé le grand modèle `en_core_web_lg` (560 Mo) par sa version plus petite `en_core_web_md` (40 Mo) - la taille est donc réduite de 14 fois ! Si vous vous souciez de la vitesse d'anonymisation, il vaut la peine d'y réfléchir.

Tous les modèles pour les différentes langues peuvent être trouvés dans la [documentation spaCy](https://spacy.io/usage/models).

Maintenant, passez la configuration comme paramètre `languages_config` à Anonymiser. Comme vous pouvez le voir, les deux exemples précédents fonctionnent parfaitement :

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

Par défaut, la langue indiquée en premier dans la configuration sera utilisée lors de l'anonymisation du texte (dans ce cas, l'anglais) :

```python
print(anonymizer.anonymize("My name is John"))
```

```output
My name is Shawna Bennett
```

## Utilisation avec d'autres frameworks

### Détection de la langue

L'un des inconvénients de l'approche présentée est que nous devons passer la **langue** du texte d'entrée directement. Cependant, il existe un remède à cela - les bibliothèques de *détection de langue*.

Nous vous recommandons d'utiliser l'un des frameworks suivants :
- fasttext (recommandé)
- langdetect

D'après notre expérience, *fasttext* a des performances un peu meilleures, mais vous devriez le vérifier sur votre cas d'utilisation.

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

Vous devez d'abord télécharger le modèle fasttext à partir de https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz

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

De cette façon, vous n'avez besoin d'initialiser le modèle qu'avec les moteurs correspondant aux langues pertinentes, mais l'utilisation de l'outil est entièrement automatisée.

## Utilisation avancée

### Étiquettes personnalisées dans le modèle NER

Il se peut que le modèle spaCy ait des noms de classes différents de ceux pris en charge par Microsoft Presidio par défaut. Prenons l'exemple du polonais :

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

Le nom *Victoria* a été classé comme `persName`, ce qui ne correspond pas aux noms de classes par défaut `PERSON`/`PER` implémentés dans Microsoft Presidio (recherchez `CHECK_LABEL_GROUPS` dans [l'implémentation de SpacyRecognizer](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)).

Vous pouvez en savoir plus sur les étiquettes personnalisées dans les modèles spaCy (y compris les vôtres, entraînés) dans [ce fil](https://github.com/microsoft/presidio/issues/851).

C'est pourquoi notre phrase ne sera pas anonymisée :

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

Pour résoudre ce problème, créez votre propre `SpacyRecognizer` avec votre propre mappage de classes et ajoutez-le à l'anonymiseur :

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

Maintenant, tout fonctionne sans problème :

```python
print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```

```output
Nazywam się Morgan Walters
```

Essayons un exemple plus complexe :

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

Comme vous pouvez le voir, grâce au mappage des classes, l'anonymiseur peut gérer différents types d'entités.

### Opérateurs spécifiques à la langue

Dans l'exemple ci-dessus, la phrase a été correctement anonymisée, mais les données factices ne correspondent pas du tout à la langue polonaise. Des opérateurs personnalisés peuvent donc être ajoutés, ce qui résoudra le problème :

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

### Limitations

Rappelez-vous - les résultats sont aussi bons que vos reconnaisseurs et que vos modèles NER !

Regardez l'exemple ci-dessous - nous avons téléchargé le petit modèle pour l'espagnol (12 Mo) et il ne fonctionne plus aussi bien que la version moyenne (40 Mo) :

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

Dans de nombreux cas, même les modèles plus volumineux de spaCy ne seront pas suffisants - il existe déjà d'autres méthodes plus complexes et plus performantes pour détecter les entités nommées, basées sur les transformeurs. Vous pouvez en lire plus à ce sujet [ici](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/).
