---
sidebar_class_name: hidden
translated: true
---

# SQL

Uno de los tipos más comunes de bases de datos con las que podemos construir sistemas de preguntas y respuestas son las bases de datos SQL. LangChain viene con una serie de cadenas y agentes integrados que son compatibles con cualquier dialecto SQL compatible con SQLAlchemy (por ejemplo, MySQL, PostgreSQL, Oracle SQL, Databricks, SQLite). Permiten casos de uso como:

* Generar consultas que se ejecutarán en función de preguntas en lenguaje natural,
* Crear chatbots que puedan responder preguntas basadas en datos de la base de datos,
* Construir paneles personalizados basados en los análisis que un usuario quiere realizar,

y mucho más.

## ⚠️ Nota de seguridad ⚠️

La construcción de sistemas de preguntas y respuestas de bases de datos SQL requiere la ejecución de consultas SQL generadas por modelos. Hay riesgos inherentes al hacer esto. Asegúrese de que los permisos de conexión a la base de datos siempre estén delimitados lo más estrechamente posible a las necesidades de su cadena/agente. Esto mitigará, aunque no eliminará, los riesgos de construir un sistema impulsado por modelos. Para obtener más información sobre las mejores prácticas de seguridad en general, [consulte aquí](/docs/security).

![sql_usecase.png](../../../../../../static/img/sql_usecase.png)

## Inicio rápido

Dirígete a la **[Guía de inicio rápido](/docs/use_cases/sql/quickstart)** para empezar.

## Avanzado

Una vez que te hayas familiarizado con los conceptos básicos, puedes dirigirte a las guías avanzadas:

* [Agentes](/docs/use_cases/sql/agents): Construcción de agentes que pueden interactuar con bases de datos SQL.
* [Estrategias de generación de consultas](/docs/use_cases/sql/prompting): Estrategias para mejorar la generación de consultas SQL.
* [Validación de consultas](/docs/use_cases/sql/query_checking): Cómo validar consultas SQL.
* [Bases de datos grandes](/docs/use_cases/sql/large_db): Cómo interactuar con bases de datos con muchas tablas y columnas de alta cardinalidad.
