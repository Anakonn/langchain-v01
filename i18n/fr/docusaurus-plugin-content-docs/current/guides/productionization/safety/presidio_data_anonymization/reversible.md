---
sidebar_position: 1
title: Anonymisation réversible
translated: true
---

# Anonymisation réversible des données avec Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/reversible.ipynb)

## Cas d'utilisation

Nous avons déjà écrit sur l'importance de l'anonymisation des données sensibles dans la section précédente. **L'anonymisation réversible** est une technologie tout aussi essentielle lors du partage d'informations avec des modèles de langage, car elle équilibre la protection des données et leur utilisabilité. Cette technique implique de masquer les informations d'identification personnelle (PII) sensibles, mais elle peut être inversée et les données d'origine peuvent être restaurées lorsque les utilisateurs autorisés en ont besoin. Son principal avantage réside dans le fait que, bien qu'elle dissimule les identités individuelles pour éviter tout usage abusif, elle permet également de démasquer les données dissimulées si nécessaire à des fins légales ou de conformité.

## Aperçu

Nous avons implémenté le `PresidioReversibleAnonymizer`, qui se compose de deux parties :

1. Anonymisation - elle fonctionne de la même manière que `PresidioAnonymizer`, en plus l'objet lui-même stocke une correspondance entre les valeurs fictives et les valeurs d'origine, par exemple :

```output
    {
        "PERSON": {
            "<anonymized>": "<original>",
            "John Doe": "Slim Shady"
        },
        "PHONE_NUMBER": {
            "111-111-1111": "555-555-5555"
        }
        ...
    }
```

2. Dé-anonymisation - en utilisant la correspondance décrite ci-dessus, elle fait correspondre les données fictives aux données d'origine, puis les substitue.

Entre l'anonymisation et la dé-anonymisation, l'utilisateur peut effectuer différentes opérations, par exemple, transmettre la sortie à un LLM.

## Démarrage rapide

```python
# Install necessary packages
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai presidio-analyzer presidio-anonymizer spacy Faker
# ! python -m spacy download en_core_web_lg
```

`PresidioReversibleAnonymizer` ne diffère pas significativement de son prédécesseur (`PresidioAnonymizer`) en termes d'anonymisation :

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com. "
    "By the way, my card number is: 4916 0387 9536 0861"
)
```

```output
'My name is Maria Lynch, call me at 7344131647 or email me at jamesmichael@example.com. By the way, my card number is: 4838637940262'
```

Voici à quoi ressemble la chaîne complète que nous voulons dé-anonymiser :

```python
# We know this data, as we set the faker_seed parameter
fake_name = "Maria Lynch"
fake_phone = "7344131647"
fake_email = "jamesmichael@example.com"
fake_credit_card = "4838637940262"

anonymized_text = f"""{fake_name} recently lost his wallet.
Inside is some cash and his credit card with the number {fake_credit_card}.
If you would find it, please call at {fake_phone} or write an email here: {fake_email}.
{fake_name} would be very grateful!"""

print(anonymized_text)
```

```output
Maria Lynch recently lost his wallet.
Inside is some cash and his credit card with the number 4838637940262.
If you would find it, please call at 7344131647 or write an email here: jamesmichael@example.com.
Maria Lynch would be very grateful!
```

Et maintenant, en utilisant la méthode `deanonymize`, nous pouvons inverser le processus :

```python
print(anonymizer.deanonymize(anonymized_text))
```

```output
Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com.
Slim Shady would be very grateful!
```

### Utilisation avec LangChain Expression Language

Avec LCEL, nous pouvons facilement enchaîner l'anonymisation et la dé-anonymisation avec le reste de notre application. Voici un exemple d'utilisation du mécanisme d'anonymisation avec une requête à LLM (sans dé-anonymisation pour le moment) :

```python
text = """Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com."""
```

```python
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI

anonymizer = PresidioReversibleAnonymizer()

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

We regret to inform you that Monique Turner has recently misplaced his wallet, which contains a sum of cash and his credit card with the number 213152056829866.

If you happen to come across this wallet, kindly contact us at (770)908-7734x2835 or send an email to barbara25@example.net.

Thank you for your cooperation.

Sincerely,
[Your Name]
```

Maintenant, ajoutons l'étape de **dé-anonymisation** à notre séquence :

```python
chain = chain | (lambda ai_message: anonymizer.deanonymize(ai_message.content))
response = chain.invoke(text)
print(response)
```

```output
Dear Sir/Madam,

We regret to inform you that Slim Shady has recently misplaced his wallet, which contains a sum of cash and his credit card with the number 4916 0387 9536 0861.

If you happen to come across this wallet, kindly contact us at 313-666-7440 or send an email to real.slim.shady@gmail.com.

Thank you for your cooperation.

Sincerely,
[Your Name]
```

Les données anonymisées ont été transmises au modèle lui-même, et donc protégées contre toute fuite vers l'extérieur. Ensuite, la réponse du modèle a été traitée, et la valeur factuelle a été remplacée par la valeur réelle.

## Connaissances supplémentaires

`PresidioReversibleAnonymizer` stocke la correspondance entre les valeurs fictives et les valeurs d'origine dans le paramètre `deanonymizer_mapping`, où la clé est le PII fictif et la valeur est le PII d'origine :

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com. "
    "By the way, my card number is: 4916 0387 9536 0861"
)

anonymizer.deanonymizer_mapping
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861'}}
```

L'anonymisation de plus de textes entraînera de nouvelles entrées dans la correspondance :

```python
print(
    anonymizer.anonymize(
        "Do you have his VISA card number? Yep, it's 4001 9192 5753 7193. I'm John Doe by the way."
    )
)

anonymizer.deanonymizer_mapping
```

```output
Do you have his VISA card number? Yep, it's 3537672423884966. I'm William Bowman by the way.
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

Grâce à la mémoire intégrée, les entités qui ont déjà été détectées et anonymisées prendront la même forme dans les textes traités ultérieurement, de sorte qu'il n'y aura pas de doublons dans la correspondance :

```python
print(
    anonymizer.anonymize(
        "My VISA card number is 4001 9192 5753 7193 and my name is John Doe."
    )
)

anonymizer.deanonymizer_mapping
```

```output
My VISA card number is 3537672423884966 and my name is William Bowman.
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

Nous pouvons enregistrer la correspondance elle-même dans un fichier pour une utilisation future :

```python
# We can save the deanonymizer mapping as a JSON or YAML file

anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.json")
# anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.yaml")
```

Et ensuite, la charger dans une autre instance de `PresidioReversibleAnonymizer` :

```python
anonymizer = PresidioReversibleAnonymizer()

anonymizer.deanonymizer_mapping
```

```output
{}
```

```python
anonymizer.load_deanonymizer_mapping("deanonymizer_mapping.json")

anonymizer.deanonymizer_mapping
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

### Stratégie de dé-anonymisation personnalisée

La stratégie de dé-anonymisation par défaut consiste à faire correspondre exactement le sous-chaîne dans le texte avec l'entrée de la correspondance. En raison du non-déterminisme des LLM, il se peut que le modèle change légèrement le format des données privées ou fasse une faute de frappe, par exemple :
- *Keanu Reeves* -> *Kaenu Reeves*
- *John F. Kennedy* -> *John Kennedy*
- *Main St, New York* -> *New York*

Il vaut donc la peine d'envisager un ingénierie de prompt appropriée (demander au modèle de renvoyer le PII dans un format inchangé) ou d'essayer de mettre en œuvre votre propre stratégie de remplacement. Par exemple, vous pouvez utiliser la correspondance floue - cela résoudra les problèmes de fautes de frappe et de changements mineurs dans le texte. Certaines implémentations de la stratégie de remplacement peuvent être trouvées dans le fichier `deanonymizer_matching_strategies.py`.

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    case_insensitive_matching_strategy,
)

# Original name: Maria Lynch
print(anonymizer.deanonymize("maria lynch"))
print(
    anonymizer.deanonymize(
        "maria lynch", deanonymizer_matching_strategy=case_insensitive_matching_strategy
    )
)
```

```output
maria lynch
Slim Shady
```

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    fuzzy_matching_strategy,
)

# Original name: Maria Lynch
# Original phone number: 7344131647 (without dashes)
print(anonymizer.deanonymize("Call Maria K. Lynch at 734-413-1647"))
print(
    anonymizer.deanonymize(
        "Call Maria K. Lynch at 734-413-1647",
        deanonymizer_matching_strategy=fuzzy_matching_strategy,
    )
)
```

```output
Call Maria K. Lynch at 734-413-1647
Call Slim Shady at 313-666-7440
```

Il semble que la méthode combinée fonctionne le mieux :
- appliquer d'abord la stratégie de correspondance exacte
- puis faire correspondre le reste en utilisant la stratégie floue

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    combined_exact_fuzzy_matching_strategy,
)

# Changed some values for fuzzy match showcase:
# - "Maria Lynch" -> "Maria K. Lynch"
# - "7344131647" -> "734-413-1647"
# - "213186379402654" -> "2131 8637 9402 654"
print(
    anonymizer.deanonymize(
        (
            "Are you Maria F. Lynch? I found your card with number 4838 6379 40262.\n"
            "Is this your phone number: 734-413-1647?\n"
            "Is this your email address: wdavis@example.net"
        ),
        deanonymizer_matching_strategy=combined_exact_fuzzy_matching_strategy,
    )
)
```

```output
Are you Slim Shady? I found your card with number 4916 0387 9536 0861.
Is this your phone number: 313-666-7440?
Is this your email address: wdavis@example.net
```

Bien sûr, il n'y a pas de méthode parfaite et il vaut la peine d'expérimenter et de trouver celle qui convient le mieux à votre cas d'utilisation.

## Travaux futurs

- **Améliorer la correspondance et la substitution des valeurs fictives par les valeurs réelles** - actuellement, la stratégie est basée sur la correspondance de chaînes complètes puis leur substitution. En raison du non-déterminisme des modèles de langage, il peut arriver que la valeur dans la réponse soit légèrement modifiée (par exemple, *John Doe* -> *John* ou *Main St, New York* -> *New York*) et une telle substitution n'est alors plus possible. Il est donc important d'ajuster la correspondance à vos besoins.
