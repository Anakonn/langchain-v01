---
sidebar_class_name: hidden
translated: true
---

# Gráficos

Uno de los tipos comunes de bases de datos para las que podemos construir sistemas de preguntas y respuestas son las bases de datos de gráficos. LangChain viene con una serie de cadenas y agentes integrados que son compatibles con dialectos de lenguaje de consulta de gráficos como Cypher, SparQL y otros (por ejemplo, Neo4j, MemGraph, Amazon Neptune, Kùzu, OntoText, Tigergraph). Permiten casos de uso como:

* Generar consultas que se ejecutarán en función de preguntas en lenguaje natural,
* Crear chatbots que puedan responder preguntas basadas en datos de la base de datos,
* Construir paneles personalizados basados en los análisis que un usuario quiere realizar,

y mucho más.

## ⚠️ Nota de seguridad ⚠️

La construcción de sistemas de preguntas y respuestas de bases de datos de gráficos puede requerir la ejecución de consultas a la base de datos generadas por modelos. Hay riesgos inherentes en hacer esto. Asegúrese de que los permisos de conexión a la base de datos siempre estén delimitados lo más estrechamente posible a las necesidades de su cadena/agente. Esto mitigará, aunque no eliminará, los riesgos de construir un sistema impulsado por modelos. Para obtener más información sobre las mejores prácticas de seguridad en general, [consulte aquí](/docs/security).

![graphgrag_usecase.png](../../../../../../static/img/graph_usecase.png)

> El uso de plantillas de consultas a la base de datos dentro de una capa semántica proporciona la ventaja de evitar la necesidad de generar consultas a la base de datos. Este enfoque elimina efectivamente las vulnerabilidades de seguridad vinculadas a la generación de consultas a la base de datos.

## Inicio rápido

Dirígete a la página **[Inicio rápido](/docs/use_cases/graph/quickstart)** para empezar.

## Avanzado

Una vez que te hayas familiarizado con los conceptos básicos, puedes dirigirte a las guías avanzadas:

* [Estrategias de solicitud](/docs/use_cases/graph/prompting): Técnicas avanzadas de ingeniería de solicitudes.
* [Asignación de valores](/docs/use_cases/graph/mapping): Técnicas para asignar valores de preguntas a la base de datos.
* [Capa semántica](/docs/use_cases/graph/semantic): Técnicas para implementar capas semánticas.
* [Construcción de gráficos](/docs/use_cases/graph/constructing): Técnicas para construir gráficos de conocimiento.
