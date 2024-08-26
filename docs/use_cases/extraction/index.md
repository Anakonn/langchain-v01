---
canonical: https://python.langchain.com/v0.1/docs/use_cases/extraction
sidebar_class_name: hidden
title: Extracting structured output
translated: false
---

## Overview

Large Language Models (LLMs) are emerging as an extremely capable technology for powering information extraction applications.

Classical solutions to information extraction rely on a combination of people, (many) hand-crafted rules (e.g., regular expressions), and custom fine-tuned ML models.

Such systems tend to get complex over time and become progressively more expensive to maintain and more difficult to enhance.

LLMs can be adapted quickly for specific extraction tasks just by providing appropriate instructions to them and appropriate reference examples.

This guide will show you how to use LLMs for extraction applications!

## Approaches

There are 3 broad approaches for information extraction using LLMs:

- **Tool/Function Calling** Mode: Some LLMs support a *tool or function calling* mode. These LLMs can structure output according to a given **schema**. Generally, this approach is the easiest to work with and is expected to yield good results.

- **JSON Mode**: Some LLMs are can be forced to output valid JSON. This is similar to **tool/function Calling** approach, except that the schema is provided as part of the prompt. Generally, our intuition is that this performs worse than a **tool/function calling** approach, but don't trust us and verify for your own use case!

- **Prompting Based**: LLMs that can follow instructions well can be instructed to generate text in a desired format. The generated text can be parsed downstream using existing [Output Parsers](/docs/modules/model_io/output_parsers/) or using [custom parsers](/docs/modules/model_io/output_parsers/custom) into a structured format like JSON. This approach can be used with LLMs that **do not support** JSON mode or tool/function calling modes. This approach is more broadly applicable, though may yield worse results than models that have been fine-tuned for extraction or function calling.

## Quickstart

Head to the [quickstart](/docs/use_cases/extraction/quickstart) to see how to extract information using LLMs using a basic end-to-end example.

The quickstart focuses on information extraction using the **tool/function calling** approach.

## How-To Guides

- [Use Reference Examples](/docs/use_cases/extraction/how_to/examples): Learn how to use **reference examples** to improve performance.
- [Handle Long Text](/docs/use_cases/extraction/how_to/handle_long_text): What should you do if the text does not fit into the context window of the LLM?
- [Handle Files](/docs/use_cases/extraction/how_to/handle_files): Examples of using LangChain document loaders and parsers to extract from files like PDFs.
- [Use a Parsing Approach](/docs/use_cases/extraction/how_to/parse): Use a prompt based approach to extract with models that do not support **tool/function calling**.

## Guidelines

Head to the [Guidelines](/docs/use_cases/extraction/guidelines) page to see a list of opinionated guidelines on how to get the best performance for extraction use cases.

## Use Case Accelerant

[langchain-extract](https://github.com/langchain-ai/langchain-extract) is a starter repo that implements a simple web server for information extraction from text and files using LLMs. It is build using **FastAPI**, **LangChain** and **Postgresql**. Feel free to adapt it to your own use cases.

## Other Resources

* The [output parser](/docs/modules/model_io/output_parsers/) documentation includes various parser examples for specific types (e.g., lists, datetime, enum, etc).
* LangChain [document loaders](/docs/modules/data_connection/document_loaders/) to load content from files. Please see list of [integrations](/docs/integrations/document_loaders).
* The experimental [Anthropic function calling](/docs/integrations/chat/anthropic_functions) support provides similar functionality to Anthropic chat models.
* [LlamaCPP](/docs/integrations/llms/llamacpp#grammars) natively supports constrained decoding using custom grammars, making it easy to output structured content using local LLMs
* [JSONFormer](/docs/integrations/llms/jsonformer_experimental) offers another way for structured decoding of a subset of the JSON Schema.
* [Kor](https://eyurtsev.github.io/kor/) is another library for extraction where schema and examples can be provided to the LLM. Kor is optimized to work for a parsing approach.
* [OpenAI's function and tool calling](https://platform.openai.com/docs/guides/function-calling)
* For example, see [OpenAI's JSON mode](https://platform.openai.com/docs/guides/text-generation/json-mode).