---
translated: true
---

# Anonymisation des données avec Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/index.ipynb)

>[Presidio](https://microsoft.github.io/presidio/) (Origine du latin praesidium 'protection, garnison') aide à s'assurer que les données sensibles sont correctement gérées et gouvernées. Il fournit des modules d'identification et d'anonymisation rapides pour les entités privées dans le texte et les images telles que les numéros de carte de crédit, les noms, les lieux, les numéros de sécurité sociale, les portefeuilles bitcoin, les numéros de téléphone américains, les données financières et plus encore.

## Cas d'utilisation

L'anonymisation des données est cruciale avant de transmettre des informations à un modèle de langue comme GPT-4 car elle aide à protéger la vie privée et à maintenir la confidentialité. Si les données ne sont pas anonymisées, des informations sensibles telles que les noms, les adresses, les numéros de contact ou d'autres identifiants liés à des personnes spécifiques pourraient potentiellement être appris et mal utilisés. Ainsi, en obscurcissant ou en supprimant ces informations d'identification personnelle (PII), les données peuvent être utilisées librement sans compromettre les droits à la vie privée des individus ou enfreindre les lois et réglementations sur la protection des données.

## Aperçu

L'anonymisation se compose de deux étapes :

1. **Identification :** Identifier tous les champs de données contenant des informations d'identification personnelle (PII).
2. **Remplacement** : Remplacer tous les PII par des valeurs ou des codes pseudo-aléatoires qui ne révèlent aucune information personnelle sur l'individu mais peuvent être utilisés comme référence. Nous n'utilisons pas le chiffrement standard, car le modèle de langue ne pourra pas comprendre le sens ou le contexte des données chiffrées.

Nous utilisons *Microsoft Presidio* avec le framework *Faker* à des fins d'anonymisation en raison de la large gamme de fonctionnalités qu'ils offrent. La mise en œuvre complète est disponible dans `PresidioAnonymizer`.

## Démarrage rapide

Vous trouverez ci-dessous le cas d'utilisation sur la façon d'utiliser l'anonymisation dans LangChain.

```python
%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker
```

```python
# Download model
!python -m spacy download en_core_web_lg
```

\
Voyons comment fonctionne l'anonymisation des PII à l'aide d'une phrase d'exemple :

```python
from langchain_experimental.data_anonymizer import PresidioAnonymizer

anonymizer = PresidioAnonymizer()

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is James Martinez, call me at (576)928-1972x679 or email me at lisa44@example.com'
```

### Utilisation avec l'expression LangChain Language

Avec LCEL, nous pouvons facilement enchaîner l'anonymisation avec le reste de notre application.

```python
# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv

# dotenv.load_dotenv()
```

```python
text = """Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com."""
```

```python
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI

anonymizer = PresidioAnonymizer()

template = """Rewrite this text into an official, short email:

{anonymized_text}"""
prompt = PromptTemplate.from_template(template)
llm = ChatOpenAI(temperature=0)

chain = {"anonymized_text": anonymizer.anonymize} | prompt | llm
response = chain.invoke(text)
print(response.content)
```

```output
Dear Sir/Madam,

We regret to inform you that Mr. Dennis Cooper has recently misplaced his wallet. The wallet contains a sum of cash and his credit card, bearing the number 3588895295514977.

Should you happen to come across the aforementioned wallet, kindly contact us immediately at (428)451-3494x4110 or send an email to perryluke@example.com.

Your prompt assistance in this matter would be greatly appreciated.

Yours faithfully,

[Your Name]
```

## Personnalisation

Nous pouvons spécifier `analyzed_fields` pour n'anonymiser que des types de données particuliers.

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON"])

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Shannon Steele, call me at 313-666-7440 or email me at real.slim.shady@gmail.com'
```

Comme on peut le constater, le nom a été correctement identifié et remplacé par un autre. L'attribut `analyzed_fields` est responsable des valeurs à détecter et à substituer. Nous pouvons ajouter *PHONE_NUMBER* à la liste :

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON", "PHONE_NUMBER"])
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Wesley Flores, call me at (498)576-9526 or email me at real.slim.shady@gmail.com'
```

\
Si aucun `analyzed_fields` n'est spécifié, par défaut l'anonymiseur détectera tous les formats pris en charge. Voici la liste complète :

`['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'IBAN_CODE', 'CREDIT_CARD', 'CRYPTO', 'IP_ADDRESS', 'LOCATION', 'DATE_TIME', 'NRP', 'MEDICAL_LICENSE', 'URL', 'US_BANK_NUMBER', 'US_DRIVER_LICENSE', 'US_ITIN', 'US_PASSPORT', 'US_SSN']`

**Avertissement :** Nous vous suggérons de définir soigneusement les données privées à détecter - Presidio ne fonctionne pas parfaitement et fait parfois des erreurs, il est donc préférable d'avoir plus de contrôle sur les données.

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Carla Fisher, call me at 001-683-324-0721x0644 or email me at krausejeremy@example.com'
```

\
Il se peut que la liste ci-dessus des champs détectés ne soit pas suffisante. Par exemple, le champ *PHONE_NUMBER* déjà disponible ne prend pas en charge les numéros de téléphone polonais et les confond avec un autre champ :

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is QESQ21234635370499'
```

\
Vous pouvez alors écrire vos propres reconnaisseurs et les ajouter à l'ensemble de ceux présents. La façon exacte de créer des reconnaisseurs est décrite dans la [documentation de Presidio](https://microsoft.github.io/presidio/samples/python/customizing_presidio_analyzer/).

```python
# Define the regex pattern in a Presidio `Pattern` object:
from presidio_analyzer import Pattern, PatternRecognizer

polish_phone_numbers_pattern = Pattern(
    name="polish_phone_numbers_pattern",
    regex="(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)",
    score=1,
)

# Define the recognizer with one or more patterns
polish_phone_numbers_recognizer = PatternRecognizer(
    supported_entity="POLISH_PHONE_NUMBER", patterns=[polish_phone_numbers_pattern]
)
```

\
Maintenant, nous pouvons ajouter un reconnaisseur en appelant la méthode `add_recognizer` sur l'anonymiseur :

```python
anonymizer.add_recognizer(polish_phone_numbers_recognizer)
```

\
Et voilà ! Avec le reconnaisseur basé sur des modèles ajouté, l'anonymiseur gère maintenant les numéros de téléphone polonais.

```python
print(anonymizer.anonymize("My polish phone number is 666555444"))
print(anonymizer.anonymize("My polish phone number is 666 555 444"))
print(anonymizer.anonymize("My polish phone number is +48 666 555 444"))
```

```output
My polish phone number is <POLISH_PHONE_NUMBER>
My polish phone number is <POLISH_PHONE_NUMBER>
My polish phone number is <POLISH_PHONE_NUMBER>
```

\
Le problème est que, même si nous reconnaissons maintenant les numéros de téléphone polonais, nous n'avons pas de méthode (opérateur) qui dirait comment substituer un champ donné - à cause de cela, dans la sortie, nous ne fournissons que la chaîne `<POLISH_PHONE_NUMBER>` Nous devons créer une méthode pour le remplacer correctement :

```python
from faker import Faker

fake = Faker(locale="pl_PL")


def fake_polish_phone_number(_=None):
    return fake.phone_number()


fake_polish_phone_number()
```

```output
'665 631 080'
```

\
Nous avons utilisé Faker pour créer des données pseudo-aléatoires. Maintenant, nous pouvons créer un opérateur et l'ajouter à l'anonymiseur. Pour des informations complètes sur les opérateurs et leur création, consultez la documentation de Presidio pour l'[anonymisation simple](https://microsoft.github.io/presidio/tutorial/10_simple_anonymization/) et [personnalisée](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/).

```python
from presidio_anonymizer.entities import OperatorConfig

new_operators = {
    "POLISH_PHONE_NUMBER": OperatorConfig(
        "custom", {"lambda": fake_polish_phone_number}
    )
}
```

```python
anonymizer.add_operators(new_operators)
```

```python
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is 538 521 657'
```

## Considérations importantes

### Taux de détection de l'anonymiseur

**Le niveau d'anonymisation et la précision de la détection sont aussi bons que la qualité des reconnaisseurs mis en œuvre.**

Les textes provenant de différentes sources et dans différentes langues ont des caractéristiques variables, il est donc nécessaire de tester la précision de la détection et d'ajouter itérativement des reconnaisseurs et des opérateurs pour obtenir de meilleurs résultats.

Microsoft Presidio offre beaucoup de liberté pour affiner l'anonymisation. L'auteur de la bibliothèque a fourni ses [recommandations et un guide étape par étape pour améliorer les taux de détection](https://github.com/microsoft/presidio/discussions/767#discussion-3567223).

### Anonymisation d'instance

`PresidioAnonymizer` n'a pas de mémoire intégrée. Par conséquent, deux occurrences de l'entité dans les textes suivants seront remplacées par deux valeurs fictives différentes :

```python
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Robert Morales. Hi Robert Morales!
My name is Kelly Mccoy. Hi Kelly Mccoy!
```

Pour préserver les résultats d'anonymisation précédents, utilisez `PresidioReversibleAnonymizer`, qui a une mémoire intégrée :

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer_with_memory = PresidioReversibleAnonymizer()

print(anonymizer_with_memory.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer_with_memory.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Ashley Cervantes. Hi Ashley Cervantes!
My name is Ashley Cervantes. Hi Ashley Cervantes!
```

Vous pouvez en apprendre davantage sur `PresidioReversibleAnonymizer` dans la prochaine section.
