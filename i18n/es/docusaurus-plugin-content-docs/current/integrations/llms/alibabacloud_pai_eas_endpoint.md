---
translated: true
---

# Alibaba Cloud PAI EAS

>[Plataforma de aprendizaje automático para IA de Alibaba Cloud](https://www.alibabacloud.com/help/en/pai) es una plataforma de ingeniería de aprendizaje automático o aprendizaje profundo destinada a empresas y desarrolladores. Proporciona complementos fáciles de usar, rentables, de alto rendimiento y fáciles de escalar que se pueden aplicar a diversos escenarios industriales. Con más de 140 algoritmos de optimización integrados, `Plataforma de aprendizaje automático para IA` proporciona capacidades de ingeniería de IA de todo el proceso, incluido el etiquetado de datos (`PAI-iTAG`), la creación de modelos (`PAI-Designer` y `PAI-DSW`), el entrenamiento de modelos (`PAI-DLC`), la optimización de la compilación y el despliegue de inferencia (`PAI-EAS`). `PAI-EAS` admite diferentes tipos de recursos de hardware, incluidos CPU y GPU, y se caracteriza por un alto rendimiento y baja latencia. Le permite implementar modelos complejos a gran escala con solo unos clics y realizar ampliaciones y reducciones elásticas en tiempo real. También proporciona un sistema integral de O&M y monitoreo.

```python
from langchain.chains import LLMChain
from langchain_community.llms.pai_eas_endpoint import PaiEasEndpoint
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

Quien quiera usar EAS LLMs debe configurar primero el servicio EAS. Cuando se inicia el servicio EAS, se pueden obtener `EAS_SERVICE_URL` y `EAS_SERVICE_TOKEN`. Los usuarios pueden consultar https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/ para obtener más información.

```python
import os

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
llm = PaiEasEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

```python
llm_chain = prompt | llm

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
llm_chain.invoke({"question": question})
```

```output
'  Thank you for asking! However, I must respectfully point out that the question contains an error. Justin Bieber was born in 1994, and the Super Bowl was first played in 1967. Therefore, it is not possible for any NFL team to have won the Super Bowl in the year Justin Bieber was born.\n\nI hope this clarifies things! If you have any other questions, please feel free to ask.'
```
