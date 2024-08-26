---
translated: true
---

# AWS Lambda

>[`Amazon AWS Lambda`](https://aws.amazon.com/pm/lambda/) es un servicio de computación sin servidor proporcionado por `Amazon Web Services` (`AWS`). Ayuda a los desarrolladores a construir y ejecutar aplicaciones y servicios sin aprovisionar ni administrar servidores. Esta arquitectura sin servidor le permite centrarse en escribir y implementar código, mientras que AWS se encarga automáticamente de escalar, parchar y administrar la infraestructura necesaria para ejecutar sus aplicaciones.

Este cuaderno analiza cómo usar la herramienta `AWS Lambda`.

Al incluir `AWS Lambda` en la lista de herramientas proporcionadas a un Agente, puede otorgarle a su Agente la capacidad de invocar código en ejecución en su Nube de AWS para los propósitos que necesite.

Cuando un Agente usa la herramienta `AWS Lambda`, proporcionará un argumento de tipo cadena que, a su vez, se pasará a la función Lambda a través del parámetro de evento.

Primero, debe instalar el paquete de Python `boto3`.

```python
%pip install --upgrade --quiet  boto3 > /dev/null
```

Para que un agente pueda usar la herramienta, debe proporcionarle el nombre y la descripción que coincidan con la funcionalidad de la lógica de su función lambda.

También debe proporcionar el nombre de su función.

Tenga en cuenta que, debido a que esta herramienta es simplemente un envoltorio alrededor de la biblioteca boto3, deberá ejecutar `aws configure` para poder usar la herramienta. Para más detalles, consulte [aquí](https://docs.aws.amazon.com/cli/index.html)

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["awslambda"],
    awslambda_tool_name="email-sender",
    awslambda_tool_description="sends an email with the specified content to test@testing123.com",
    function_name="testFunction1",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("Send an email to test@testing123.com saying hello world.")
```
