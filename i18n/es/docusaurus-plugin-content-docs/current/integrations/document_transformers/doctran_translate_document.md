---
translated: true
---

# Doctran: traducción de idiomas

Comparar documentos a través de incrustaciones tiene el beneficio de funcionar en varios idiomas. "Harrison dice hola" y "Harrison dice hola" ocuparán posiciones similares en el espacio vectorial porque tienen el mismo significado semántico.

Sin embargo, aún puede ser útil usar un LLM para **traducir documentos a otros idiomas** antes de vectorizarlos. Esto es especialmente útil cuando se espera que los usuarios consulten la base de conocimientos en diferentes idiomas, o cuando los modelos de incrustación de vanguardia no están disponibles para un idioma determinado.

Podemos lograr esto usando la biblioteca [Doctran](https://github.com/psychic-api/doctran), que usa la función de llamada de OpenAI para traducir documentos entre idiomas.

```python
%pip install --upgrade --quiet  doctran
```

```python
from langchain_community.document_transformers import DoctranTextTranslator
from langchain_core.documents import Document
```

```python
from dotenv import load_dotenv

load_dotenv()
```

```output
True
```

## Entrada

Este es el documento que traduciremos

```python
sample_text = """[Generated with ChatGPT]

Confidential Document - For Internal Use Only

Date: July 1, 2023

Subject: Updates and Discussions on Various Topics

Dear Team,

I hope this email finds you well. In this document, I would like to provide you with some important updates and discuss various topics that require our attention. Please treat the information contained herein as highly confidential.

Security and Privacy Measures
As part of our ongoing commitment to ensure the security and privacy of our customers' data, we have implemented robust measures across all our systems. We would like to commend John Doe (email: john.doe@example.com) from the IT department for his diligent work in enhancing our network security. Moving forward, we kindly remind everyone to strictly adhere to our data protection policies and guidelines. Additionally, if you come across any potential security risks or incidents, please report them immediately to our dedicated team at security@example.com.

HR Updates and Employee Benefits
Recently, we welcomed several new team members who have made significant contributions to their respective departments. I would like to recognize Jane Smith (SSN: 049-45-5928) for her outstanding performance in customer service. Jane has consistently received positive feedback from our clients. Furthermore, please remember that the open enrollment period for our employee benefits program is fast approaching. Should you have any questions or require assistance, please contact our HR representative, Michael Johnson (phone: 418-492-3850, email: michael.johnson@example.com).

Marketing Initiatives and Campaigns
Our marketing team has been actively working on developing new strategies to increase brand awareness and drive customer engagement. We would like to thank Sarah Thompson (phone: 415-555-1234) for her exceptional efforts in managing our social media platforms. Sarah has successfully increased our follower base by 20% in the past month alone. Moreover, please mark your calendars for the upcoming product launch event on July 15th. We encourage all team members to attend and support this exciting milestone for our company.

Research and Development Projects
In our pursuit of innovation, our research and development department has been working tirelessly on various projects. I would like to acknowledge the exceptional work of David Rodriguez (email: david.rodriguez@example.com) in his role as project lead. David's contributions to the development of our cutting-edge technology have been instrumental. Furthermore, we would like to remind everyone to share their ideas and suggestions for potential new projects during our monthly R&D brainstorming session, scheduled for July 10th.

Please treat the information in this document with utmost confidentiality and ensure that it is not shared with unauthorized individuals. If you have any questions or concerns regarding the topics discussed, please do not hesitate to reach out to me directly.

Thank you for your attention, and let's continue to work together to achieve our goals.

Best regards,

Jason Fan
Cofounder & CEO
Psychic
jason@psychic.dev
"""
```

```python
documents = [Document(page_content=sample_text)]
qa_translator = DoctranTextTranslator(language="spanish")
```

## Salida

Después de traducir un documento, el resultado se devolverá como un nuevo documento con el page_content traducido al idioma de destino

```python
translated_document = qa_translator.transform_documents(documents)
```

```python
print(translated_document[0].page_content)
```

```output
Documento Confidencial - Solo para Uso Interno

Fecha: 1 de Julio de 2023

Asunto: Actualizaciones y Discusiones sobre Varios Temas

Estimado Equipo,

Espero que este correo electrónico les encuentre bien. En este documento, me gustaría proporcionarles algunas actualizaciones importantes y discutir varios temas que requieren nuestra atención. Por favor, traten la información contenida aquí como altamente confidencial.

Medidas de Seguridad y Privacidad
Como parte de nuestro compromiso continuo de garantizar la seguridad y privacidad de los datos de nuestros clientes, hemos implementado medidas sólidas en todos nuestros sistemas. Nos gustaría elogiar a John Doe (correo electrónico: john.doe@example.com) del departamento de TI por su diligente trabajo en mejorar nuestra seguridad de red. En el futuro, recordamos amablemente a todos que se adhieran estrictamente a nuestras políticas y pautas de protección de datos. Además, si encuentran algún riesgo o incidente de seguridad potencial, por favor, repórtelo de inmediato a nuestro equipo dedicado en security@example.com.

Actualizaciones de Recursos Humanos y Beneficios para Empleados
Recientemente, dimos la bienvenida a varios nuevos miembros del equipo que han realizado contribuciones significativas en sus respectivos departamentos. Me gustaría reconocer a Jane Smith (SSN: 049-45-5928) por su destacado desempeño en servicio al cliente. Jane ha recibido consistentemente comentarios positivos de nuestros clientes. Además, recuerden que el período de inscripción abierta para nuestro programa de beneficios para empleados se acerca rápidamente. Si tienen alguna pregunta o necesitan ayuda, por favor, contacten a nuestro representante de Recursos Humanos, Michael Johnson (teléfono: 418-492-3850, correo electrónico: michael.johnson@example.com).

Iniciativas y Campañas de Marketing
Nuestro equipo de marketing ha estado trabajando activamente en el desarrollo de nuevas estrategias para aumentar el conocimiento de nuestra marca y fomentar la participación de los clientes. Nos gustaría agradecer a Sarah Thompson (teléfono: 415-555-1234) por sus esfuerzos excepcionales en la gestión de nuestras plataformas de redes sociales. Sarah ha logrado aumentar nuestra base de seguidores en un 20% solo en el último mes. Además, marquen sus calendarios para el próximo evento de lanzamiento de productos el 15 de Julio. Animamos a todos los miembros del equipo a asistir y apoyar este emocionante hito para nuestra empresa.

Proyectos de Investigación y Desarrollo
En nuestra búsqueda de la innovación, nuestro departamento de investigación y desarrollo ha estado trabajando incansablemente en varios proyectos. Me gustaría reconocer el trabajo excepcional de David Rodriguez (correo electrónico: david.rodriguez@example.com) en su papel de líder de proyecto. Las contribuciones de David al desarrollo de nuestra tecnología de vanguardia han sido fundamentales. Además, nos gustaría recordar a todos que compartan sus ideas y sugerencias para posibles nuevos proyectos durante nuestra sesión mensual de lluvia de ideas de I+D, programada para el 10 de Julio.

Por favor, traten la información de este documento con la máxima confidencialidad y asegúrense de no compartirla con personas no autorizadas. Si tienen alguna pregunta o inquietud sobre los temas discutidos, por favor, no duden en comunicarse directamente conmigo.

Gracias por su atención y sigamos trabajando juntos para alcanzar nuestros objetivos.

Atentamente,

Jason Fan
Cofundador y CEO
Psychic
jason@psychic.dev
```
