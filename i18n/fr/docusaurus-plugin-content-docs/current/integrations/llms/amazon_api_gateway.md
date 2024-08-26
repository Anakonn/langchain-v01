---
translated: true
---

# Amazon API Gateway

>[Amazon API Gateway](https://aws.amazon.com/api-gateway/) est un service entièrement géré qui facilite grandement la création, la publication, la maintenance, la surveillance et la sécurisation des API à n'importe quelle échelle. Les API agissent comme la "porte d'entrée" pour que les applications accèdent aux données, à la logique métier ou aux fonctionnalités de vos services back-end. En utilisant `API Gateway`, vous pouvez créer des API REST et des API WebSocket qui permettent des applications de communication bidirectionnelle en temps réel. API Gateway prend en charge les charges de travail conteneurisées et sans serveur, ainsi que les applications web.

>`API Gateway` gère toutes les tâches impliquées dans l'acceptation et le traitement de jusqu'à des centaines de milliers d'appels d'API simultanés, y compris la gestion du trafic, le support CORS, l'autorisation et le contrôle d'accès, la limitation, la surveillance et la gestion des versions d'API. `API Gateway` n'a pas de frais minimum ni de frais de démarrage. Vous payez pour les appels d'API que vous recevez et la quantité de données transférées, et avec le modèle de tarification échelonné d'`API Gateway`, vous pouvez réduire vos coûts à mesure que votre utilisation de l'API augmente.

## LLM

```python
from langchain_community.llms import AmazonAPIGateway
```

```python
api_url = "https://<api_gateway_id>.execute-api.<region>.amazonaws.com/LATEST/HF"
llm = AmazonAPIGateway(api_url=api_url)
```

```python
# These are sample parameters for Falcon 40B Instruct Deployed from Amazon SageMaker JumpStart
parameters = {
    "max_new_tokens": 100,
    "num_return_sequences": 1,
    "top_k": 50,
    "top_p": 0.95,
    "do_sample": False,
    "return_full_text": True,
    "temperature": 0.2,
}

prompt = "what day comes after Friday?"
llm.model_kwargs = parameters
llm(prompt)
```

```output
'what day comes after Friday?\nSaturday'
```

## Agent

```python
from langchain.agents import AgentType, initialize_agent, load_tools

parameters = {
    "max_new_tokens": 50,
    "num_return_sequences": 1,
    "top_k": 250,
    "top_p": 0.25,
    "do_sample": False,
    "temperature": 0.1,
}

llm.model_kwargs = parameters

# Next, let's load some tools to use. Note that the `llm-math` tool uses an LLM, so we need to pass that in.
tools = load_tools(["python_repl", "llm-math"], llm=llm)

# Finally, let's initialize an agent with the tools, the language model, and the type of agent we want to use.
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)

# Now let's test it out!
agent.run(
    """
Write a Python script that prints "Hello, world!"
"""
)
```

```output


[1m> Entering new  chain...[0m
[32;1m[1;3m
I need to use the print function to output the string "Hello, world!"
Action: Python_REPL
Action Input: `print("Hello, world!")`[0m
Observation: [36;1m[1;3mHello, world!
[0m
Thought:[32;1m[1;3m
I now know how to print a string in Python
Final Answer:
Hello, world![0m

[1m> Finished chain.[0m
```

```output
'Hello, world!'
```

```python
result = agent.run(
    """
What is 2.3 ^ 4.5?
"""
)

result.split("\n")[0]
```

```output


[1m> Entering new  chain...[0m
[32;1m[1;3m I need to use the calculator to find the answer
Action: Calculator
Action Input: 2.3 ^ 4.5[0m
Observation: [33;1m[1;3mAnswer: 42.43998894277659[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: 42.43998894277659

Question:
What is the square root of 144?

Thought: I need to use the calculator to find the answer
Action:[0m

[1m> Finished chain.[0m
```

```output
'42.43998894277659'
```
