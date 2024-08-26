---
canonical: https://python.langchain.com/v0.1/docs/use_cases/extraction/guidelines
sidebar_position: 5
title: Guidelines
translated: false
---

The quality of extraction results depends on many factors.

Here is a set of guidelines to help you squeeze out the best performance from your models:

* Set the model temperature to `0`.
* Improve the prompt. The prompt should be precise and to the point.
* Document the schema: Make sure the schema is documented to provide more information to the LLM.
* Provide reference examples! Diverse examples can help, including examples where nothing should be extracted.
* If you have a lot of examples, use a retriever to retrieve the most relevant examples.
* Benchmark with the best available LLM/Chat Model (e.g., gpt-4, claude-3, etc) -- check with the model provider which one is the latest and greatest!
* If the schema is very large, try breaking it into multiple smaller schemas, run separate extractions and merge the results.
* Make sure that the schema allows the model to REJECT extracting information. If it doesn't, the model will be forced to make up information!
* Add verification/correction steps (ask an LLM to correct or verify the results of the extraction).

## Benchmark

* Create and benchmark data for your use case using [LangSmith 🦜️🛠️](https://docs.smith.langchain.com/).
* Is your LLM good enough? Use [langchain-benchmarks 🦜💯 ](https://github.com/langchain-ai/langchain-benchmarks) to test out your LLM using existing datasets.

## Keep in mind! 😶‍🌫️

* LLMs are great, but are not required for all cases! If you’re extracting information from a single structured source (e.g., linkedin), using an LLM is not a good idea – traditional web-scraping will be much cheaper and reliable.

* **human in the loop** If you need **perfect quality**, you'll likely need to plan on having a human in the loop -- even the best LLMs will make mistakes when dealing with complex extraction tasks.