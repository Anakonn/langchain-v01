---
sidebar_position: 4
translated: true
---

# Plantillas de solicitud parcial

Al igual que otros métodos, tiene sentido "parcializar" una plantilla de solicitud, es decir, pasar un subconjunto de los valores requeridos, para crear una nueva plantilla de solicitud que espere solo el subconjunto restante de valores.

LangChain admite esto de dos maneras:
1. Formato parcial con valores de cadena.
2. Formato parcial con funciones que devuelven valores de cadena.

Estas dos formas diferentes admiten diferentes casos de uso. En los ejemplos a continuación, analizamos las motivaciones para ambos casos de uso, así como cómo hacerlo en LangChain.

## Parcial con cadenas

Un caso de uso común para querer parcializar una plantilla de solicitud es si obtiene algunas de las variables antes que otras. Por ejemplo, supongamos que tiene una plantilla de solicitud que requiere dos variables, `foo` y `baz`. Si obtiene el valor de `foo` al principio de la cadena, pero el valor de `baz` más tarde, puede ser molesto esperar hasta que tenga ambas variables en el mismo lugar para pasarlas a la plantilla de solicitud. En su lugar, puede parcializar la plantilla de solicitud con el valor de `foo` y luego pasar la plantilla de solicitud parcializada y simplemente usarla. A continuación se muestra un ejemplo de cómo hacer esto:

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("{foo}{bar}")
partial_prompt = prompt.partial(foo="foo")
print(partial_prompt.format(bar="baz"))
```

```output
foobaz
```

También puede inicializar la solicitud con las variables parcializadas.

```python
prompt = PromptTemplate(
    template="{foo}{bar}", input_variables=["bar"], partial_variables={"foo": "foo"}
)
print(prompt.format(bar="baz"))
```

```output
foobaz
```

## Parcial con funciones

El otro uso común es parcializar con una función. El caso de uso para esto es cuando tiene una variable que sabe que siempre quiere buscar de una manera común. Un ejemplo principal de esto es con la fecha o la hora. Imagine que tiene una solicitud que siempre quiere tener la fecha actual. No puede codificarla en la solicitud y pasarla junto con las otras variables de entrada es un poco molesto. En este caso, es muy útil poder parcializar la solicitud con una función que siempre devuelva la fecha actual.

```python
from datetime import datetime


def _get_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y, %H:%M:%S")
```

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective", "date"],
)
partial_prompt = prompt.partial(date=_get_datetime)
print(partial_prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:22
```

También puede inicializar la solicitud con las variables parcializadas, lo que a menudo tiene más sentido en este flujo de trabajo.

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective"],
    partial_variables={"date": _get_datetime},
)
print(prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:36
```
