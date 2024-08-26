---
fixed: true
translated: true
---

# Seguridad

LangChain tiene un gran ecosistema de integraciones con varios recursos externos como sistemas de archivos locales y remotos, APIs y bases de datos. Estas integraciones permiten a los desarrolladores crear aplicaciones versátiles que combinan el poder de los LLM con la capacidad de acceder, interactuar y manipular recursos externos.

## Mejores Prácticas

Al construir este tipo de aplicaciones, los desarrolladores deben recordar seguir buenas prácticas de seguridad:

* [**Limitar Permisos**](https://en.wikipedia.org/wiki/Principle_of_least_privilege): Limitar los permisos específicamente a las necesidades de la aplicación. Otorgar permisos amplios o excesivos puede introducir vulnerabilidades de seguridad significativas. Para evitar tales vulnerabilidades, considere usar credenciales de solo lectura, denegar el acceso a recursos sensibles, utilizar técnicas de aislamiento (como ejecutar dentro de un contenedor), etc. según corresponda para su aplicación.

* **Anticipar Posible Mal Uso**: Así como los humanos pueden equivocarse, los Modelos de Lenguaje Grande (LLM) también pueden hacerlo. Siempre asuma que cualquier acceso al sistema o credenciales pueden ser utilizados de cualquier manera permitida por los permisos que se les hayan asignado. Por ejemplo, si un par de credenciales de base de datos permite eliminar datos, es más seguro asumir que cualquier LLM capaz de usar esas credenciales puede, de hecho, eliminar datos.

* [**Defensa en Profundidad**](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)): Ninguna técnica de seguridad es perfecta. El ajuste fino y un buen diseño de la cadena pueden reducir, pero no eliminar, las probabilidades de que un Modelo de Lenguaje Grande (LLM) cometa un error. Es mejor combinar múltiples enfoques de seguridad en capas en lugar de confiar en una sola capa de defensa para garantizar la seguridad. Por ejemplo: use tanto permisos de solo lectura como aislamiento para asegurarse de que los LLM solo puedan acceder a los datos que se les permite explícitamente utilizar.

Los riesgos de no hacerlo incluyen, entre otros:

* Corrupción o pérdida de datos.
* Acceso no autorizado a información confidencial.
* Comprometimiento del rendimiento o la disponibilidad de recursos críticos.

Escenarios de ejemplo con estrategias de mitigación:

* Un usuario puede pedirle a un agente con acceso al sistema de archivos que elimine archivos que no deberían eliminarse o lea el contenido de archivos que contienen información confidencial. Para mitigar, limite al agente a usar solo un directorio específico y permítale solo leer o escribir archivos que sea seguro leer o escribir. Considere aislar aún más al agente ejecutándolo en un contenedor.

* Un usuario puede pedirle a un agente con acceso de escritura a una API externa que escriba datos maliciosos en la API o elimine datos de esa API. Para mitigar, otorgue al agente claves de API de solo lectura o límitelo a usar solo los extremos que ya sean resistentes a dicho mal uso.

* Un usuario puede pedirle a un agente con acceso a una base de datos que elimine una tabla o modifique el esquema. Para mitigar, limite las credenciales solo a las tablas que el agente necesita acceder y considere emitir credenciales de SOLO LECTURA.

Si está construyendo aplicaciones que acceden a recursos externos como sistemas de archivos, APIs o bases de datos, considere hablar con el equipo de seguridad de su empresa para determinar cómo diseñar y asegurar mejor sus aplicaciones.

## Informar una Vulnerabilidad

Informe las vulnerabilidades de seguridad por correo electrónico a security@langchain.dev. Esto asegurará que el problema se triage y se aborde de inmediato según sea necesario.
