---
translated: true
---

# Anonimización de datos con Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/index.ipynb)

>[Presidio](https://microsoft.github.io/presidio/) (Originario del latín praesidium 'protección, guarnición') ayuda a garantizar que los datos sensibles se gestionen y gobiernen adecuadamente. Proporciona módulos de identificación y anonimización rápidos para entidades privadas en texto e imágenes, como números de tarjetas de crédito, nombres, ubicaciones, números de seguridad social, billeteras de bitcoin, números de teléfono de EE. UU., datos financieros y más.

## Caso de uso

La anonimización de datos es crucial antes de pasar información a un modelo de lenguaje como GPT-4, ya que ayuda a proteger la privacidad y mantener la confidencialidad. Si los datos no se anoniniman, la información sensible, como nombres, direcciones, números de contacto u otros identificadores vinculados a individuos específicos, podría aprenderse y utilizarse indebidamente. Por lo tanto, al oscurecer o eliminar esta información de identificación personal (PII), los datos se pueden utilizar libremente sin comprometer los derechos de privacidad de los individuos ni infringir las leyes y regulaciones de protección de datos.

## Resumen

La anonimización consta de dos pasos:

1. **Identificación:** Identificar todos los campos de datos que contienen información de identificación personal (PII).
2. **Reemplazo**: Reemplazar todos los PII con valores o códigos seudónimos que no revelen ninguna información personal sobre el individuo, pero que se puedan utilizar como referencia. No estamos utilizando cifrado regular, porque el modelo de lenguaje no podrá entender el significado o el contexto de los datos cifrados.

Utilizamos *Microsoft Presidio* junto con el marco *Faker* para fines de anonimización debido a la amplia gama de funcionalidades que proporcionan. La implementación completa está disponible en `PresidioAnonymizer`.

## Inicio rápido

A continuación, encontrará el caso de uso sobre cómo aprovechar la anonimización en LangChain.

```python
%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker
```

```python
# Download model
!python -m spacy download en_core_web_lg
```

\
Veamos cómo funciona la anonimización de PII utilizando una oración de muestra:

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

### Uso con el Lenguaje de Expresión de LangChain

Con LCEL podemos encadenar fácilmente la anonimización con el resto de nuestra aplicación.

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

## Personalización

Podemos especificar ``analyzed_fields`` para anonimizar solo tipos de datos particulares.

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON"])

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Shannon Steele, call me at 313-666-7440 or email me at real.slim.shady@gmail.com'
```

Como se puede observar, el nombre se identificó correctamente y se reemplazó por otro. El atributo `analyzed_fields` es responsable de qué valores se deben detectar y sustituir. Podemos agregar *PHONE_NUMBER* a la lista:

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
Si no se especifican analyzed_fields, de forma predeterminada el anonimizador detectará todos los formatos compatibles. A continuación se muestra la lista completa de ellos:

`['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'IBAN_CODE', 'CREDIT_CARD', 'CRYPTO', 'IP_ADDRESS', 'LOCATION', 'DATE_TIME', 'NRP', 'MEDICAL_LICENSE', 'URL', 'US_BANK_NUMBER', 'US_DRIVER_LICENSE', 'US_ITIN', 'US_PASSPORT', 'US_SSN']`

**Descargo de responsabilidad:** Sugerimos definir cuidadosamente los datos privados que se van a detectar: Presidio no funciona perfectamente y a veces comete errores, por lo que es mejor tener más control sobre los datos.

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
Puede ser que la lista anterior de campos detectados no sea suficiente. Por ejemplo, el campo *PHONE_NUMBER* disponible no admite números de teléfono polacos y lo confunde con otro campo:

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is QESQ21234635370499'
```

\
Entonces, puede escribir sus propios reconocedores y agregarlos al grupo de los presentes. Cómo crear exactamente los reconocedores se describe en la [documentación de Presidio](https://microsoft.github.io/presidio/samples/python/customizing_presidio_analyzer/).

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
Ahora, podemos agregar un reconocedor llamando al método `add_recognizer` en el anonimizador:

```python
anonymizer.add_recognizer(polish_phone_numbers_recognizer)
```

\
¡Y voilà! Con el reconocedor basado en patrones agregado, el anonimizador ahora maneja los números de teléfono polacos.

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
El problema es que, aunque ahora reconocemos los números de teléfono polacos, no tenemos un método (operador) que nos diga cómo sustituir un campo dado, por lo que en la salida solo proporcionamos la cadena `<POLISH_PHONE_NUMBER>`. Necesitamos crear un método para reemplazarlo correctamente:

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
Usamos Faker para crear datos seudónimos. Ahora podemos crear un operador y agregarlo al anonimizador. Para obtener información completa sobre los operadores y su creación, consulte la documentación de Presidio para [anonimización simple](https://microsoft.github.io/presidio/tutorial/10_simple_anonymization/) y [personalizada](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/).

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

## Consideraciones importantes

### Tasas de detección del anonimizador

**El nivel de anonimización y la precisión de la detección son tan buenos como la calidad de los reconocedores implementados.**

Los textos de diferentes fuentes y en diferentes idiomas tienen características variables, por lo que es necesario probar la precisión de la detección e ir agregando reconocedores y operadores de forma iterativa para lograr resultados cada vez mejores.

Microsoft Presidio brinda mucha libertad para refinar la anonimización. El autor de la biblioteca ha proporcionado sus [recomendaciones y una guía paso a paso para mejorar las tasas de detección](https://github.com/microsoft/presidio/discussions/767#discussion-3567223).

### Anonimización de instancia

`PresidioAnonymizer` no tiene memoria incorporada. Por lo tanto, dos apariciones de la entidad en los textos posteriores se reemplazarán con dos valores falsos diferentes:

```python
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Robert Morales. Hi Robert Morales!
My name is Kelly Mccoy. Hi Kelly Mccoy!
```

Para preservar los resultados de anonimización anteriores, use `PresidioReversibleAnonymizer`, que tiene memoria incorporada:

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

Puede obtener más información sobre `PresidioReversibleAnonymizer` en la siguiente sección.
