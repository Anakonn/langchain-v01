---
sidebar_position: 1
title: Anonimización reversible
translated: true
---

# Anonimización de datos reversible con Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/reversible.ipynb)

## Caso de uso

Ya hemos escrito sobre la importancia de anonimizar datos sensibles en la sección anterior. La **Anonimización Reversible** es una tecnología igualmente esencial mientras se comparte información con modelos de lenguaje, ya que equilibra la protección de datos con la usabilidad de los datos. Esta técnica implica enmascarar información de identificación personal (PII) sensible, pero se puede revertir y restaurar los datos originales cuando los usuarios autorizados lo necesiten. Su principal ventaja radica en el hecho de que, si bien oculta las identidades individuales para evitar el mal uso, también permite que los datos ocultos se desenmascararen con precisión si fuera necesario por motivos legales o de cumplimiento.

## Resumen

Implementamos el `PresidioReversibleAnonymizer`, que consta de dos partes:

1. anonimización: funciona de la misma manera que `PresidioAnonymizer`, además el objeto en sí almacena un mapeo de los valores ficticios a los originales, por ejemplo:

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

2. deanonimización: usando el mapeo descrito anteriormente, hace coincidir los datos ficticios con los datos originales y luego los sustituye.

Entre la anonimización y la deanonimización, el usuario puede realizar diferentes operaciones, por ejemplo, pasar la salida a LLM.

## Inicio rápido

```python
# Install necessary packages
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai presidio-analyzer presidio-anonymizer spacy Faker
# ! python -m spacy download en_core_web_lg
```

`PresidioReversibleAnonymizer` no es significativamente diferente de su predecesor (`PresidioAnonymizer`) en términos de anonimización:

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

Esto es lo que parece la cadena completa que queremos deanonimizar:

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

Y ahora, usando el método `deanonymize`, podemos revertir el proceso:

```python
print(anonymizer.deanonymize(anonymized_text))
```

```output
Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com.
Slim Shady would be very grateful!
```

### Uso con LangChain Expression Language

Con LCEL podemos encadenar fácilmente la anonimización y la deanonimización con el resto de nuestra aplicación. Este es un ejemplo de usar el mecanismo de anonimización con una consulta a LLM (sin deanonimización por ahora):

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

Ahora, agreguemos el **paso de deanonimización** a nuestra secuencia:

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

Los datos anonimizados se entregaron al modelo en sí, y por lo tanto estaban protegidos de ser filtrados al mundo exterior. Luego, la respuesta del modelo se procesó y el valor fáctico se reemplazó con el real.

## Conocimiento adicional

`PresidioReversibleAnonymizer` almacena el mapeo de los valores ficticios a los valores originales en el parámetro `deanonymizer_mapping`, donde la clave es el PII falso y el valor es el original:

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

Anonimi zar más textos dará como resultado nuevas entradas de mapeo:

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

Gracias a la memoria incorporada, las entidades que ya se han detectado y anonimizado tendrán la misma forma en los textos procesados posteriormente, por lo que no habrá duplicados en el mapeo:

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

Podemos guardar el mapeo en sí en un archivo para su uso futuro:

```python
# We can save the deanonymizer mapping as a JSON or YAML file

anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.json")
# anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.yaml")
```

Y luego, cargarlo en otra instancia de `PresidioReversibleAnonymizer`:

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

### Estrategia de deanonimización personalizada

La estrategia de deanonimización predeterminada es hacer coincidir exactamente el substring en el texto con la entrada de mapeo. Debido al indeterminismo de los LLM, puede ser que el modelo cambie ligeramente el formato de los datos privados o cometa un error de escritura, por ejemplo:
- *Keanu Reeves* -> *Kaenu Reeves*
- *John F. Kennedy* -> *John Kennedy*
- *Main St, New York* -> *New York*

Por lo tanto, vale la pena considerar la ingeniería de indicaciones apropiada (hacer que el modelo devuelva PII en formato sin cambios) o intentar implementar su propia estrategia de reemplazo. Por ejemplo, puede usar coincidencia difusa: esto resolverá problemas con errores de escritura y cambios menores en el texto. Algunas implementaciones de la estrategia de intercambio se pueden encontrar en el archivo `deanonymizer_matching_strategies.py`.

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

Parece que el método combinado funciona mejor:
- primero aplicar la estrategia de coincidencia exacta
- luego hacer coincidir el resto usando la estrategia difusa

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

Por supuesto, no hay un método perfecto y vale la pena experimentar y encontrar el más adecuado para su caso de uso.

## Trabajos futuros

- **Mejor coincidencia y sustitución de valores ficticios por reales** - actualmente la estrategia se basa en hacer coincidir cadenas completas y luego sustituirlas. Debido al indeterminismo de los modelos de lenguaje, puede suceder que el valor en la respuesta se cambie ligeramente (p. ej., *John Doe* -> *John* o *Main St, New York* -> *New York*) y entonces ya no sea posible dicha sustitución. Por lo tanto, vale la pena ajustar la coincidencia a sus necesidades.
