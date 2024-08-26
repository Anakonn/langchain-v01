---
translated: true
---

# ラベルスタジオ

>[Label Studio](https://labelstud.io/guide/get_started) は、大規模言語モデル（LLM）の微調整のためのデータラベリングに柔軟性を提供するオープンソースのデータラベリングプラットフォームです。また、カスタムトレーニングデータの準備や人間のフィードバックを通じた応答の収集と評価も可能にします。

このガイドでは、LangChain パイプラインを `Label Studio` に接続する方法を学びます：

- すべての入力プロンプト、会話、および応答を単一の `Label Studio` プロジェクトに集約します。これにより、すべてのデータが一箇所に集まり、ラベリングと分析が容易になります。
- プロンプトと応答を精査して、教師あり微調整（SFT）および人間のフィードバックによる強化学習（RLHF）シナリオのためのデータセットを作成します。ラベリングされたデータは、LLM の性能を向上させるためにさらにトレーニングするために使用できます。
- 人間のフィードバックを通じてモデルの応答を評価します。`Label Studio` は、モデルの応答を人間がレビューしフィードバックを提供するためのインターフェースを提供し、評価と反復を可能にします。

## インストールとセットアップ

まず、最新バージョンの Label Studio と Label Studio API クライアントをインストールします：

```python
%pip install --upgrade --quiet langchain label-studio label-studio-sdk langchain-openai
```

次に、コマンドラインで `label-studio` を実行して、ローカルの LabelStudio インスタンスを `http://localhost:8080` で開始します。詳細なオプションについては、[Label Studio インストールガイド](https://labelstud.io/guide/install) を参照してください。

API 呼び出しを行うためのトークンが必要です。

ブラウザで LabelStudio インスタンスを開き、`Account & Settings > Access Token` に進み、キーをコピーします。

LabelStudio URL、API キー、および OpenAI API キーで環境変数を設定します：

```python
import os

os.environ["LABEL_STUDIO_URL"] = "<YOUR-LABEL-STUDIO-URL>"  # e.g. http://localhost:8080
os.environ["LABEL_STUDIO_API_KEY"] = "<YOUR-LABEL-STUDIO-API-KEY>"
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

## LLM のプロンプトと応答の収集

ラベリングのために使用されるデータは、Label Studio 内のプロジェクトに保存されます。各プロジェクトは、入力および出力データの仕様を詳細に記述した XML 構成によって識別されます。

テキスト形式で人間の入力を受け取り、テキストエリアで編集可能な LLM 応答を出力するプロジェクトを作成します：

```xml
<View>
<Style>
    .prompt-box {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }
</Style>
<View className="root">
    <View className="prompt-box">
        <Text name="prompt" value="$prompt"/>
    </View>
    <TextArea name="response" toName="prompt"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="prompt"/>
</View>
```

1. Label Studio でプロジェクトを作成するには、「Create」ボタンをクリックします。
2. 「Project Name」フィールドに `My Project` などのプロジェクト名を入力します。
3. `Labeling Setup > Custom Template` に移動し、上記の XML 構成を貼り付けます。

`LabelStudioCallbackHandler` を介して LabelStudio プロジェクトに入力された LLM プロンプトと出力応答を収集できます：

```python
from langchain_community.callbacks.labelstudio_callback import (
    LabelStudioCallbackHandler,
)
```

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0, callbacks=[LabelStudioCallbackHandler(project_name="My Project")]
)
print(llm.invoke("Tell me a joke"))
```

Label Studio で `My Project` を開きます。プロンプト、応答、モデル名などのメタデータが表示されます。

## チャットモデルの対話の収集

LabelStudio では、完全なチャット対話を追跡および表示し、最後の応答を評価および変更することもできます：

1. Label Studio を開き、「Create」ボタンをクリックします。
2. 「Project Name」フィールドに `New Project with Chat` などのプロジェクト名を入力します。
3. `Labeling Setup > Custom Template` に移動し、次の XML 構成を貼り付けます：

```xml
<View>
<View className="root">
     <Paragraphs name="dialogue"
               value="$prompt"
               layout="dialogue"
               textKey="content"
               nameKey="role"
               granularity="sentence"/>
  <Header value="Final response:"/>
    <TextArea name="response" toName="dialogue"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="dialogue"/>
</View>
```

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    callbacks=[
        LabelStudioCallbackHandler(
            mode="chat",
            project_name="New Project with Chat",
        )
    ]
)
llm_results = chat_llm.invoke(
    [
        SystemMessage(content="Always use a lot of emojis"),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

Label Studio で "New Project with Chat" を開きます。作成されたタスクをクリックして、対話履歴を表示し、応答を編集/注釈付けします。

## カスタムラベリング構成

LabelStudio のデフォルトのラベリング構成を変更して、応答の感情、関連性、および多くの[他の種類のアノテータのフィードバック](https://labelstud.io/tags/)などのターゲットラベルを追加できます。

新しいラベリング構成は UI から追加できます：`Settings > Labeling Interface` に移動し、`Choices` のような感情や `Rating` のような関連性の追加タグを使用してカスタム構成を設定します。LLM 応答を表示するためには、[`TextArea` タグ](https://labelstud.io/tags/textarea) が構成に含まれている必要があることに注意してください。

また、プロジェクト作成前の最初の呼び出しでラベリング構成を指定することもできます：

```python
ls = LabelStudioCallbackHandler(
    project_config="""
<View>
<Text name="prompt" value="$prompt"/>
<TextArea name="response" toName="prompt"/>
<TextArea name="user_feedback" toName="prompt"/>
<Rating name="rating" toName="prompt"/>
<Choices name="sentiment" toName="prompt">
    <Choice value="Positive"/>
    <Choice value="Negative"/>
</Choices>
</View>
"""
)
```

プロジェクトが存在しない場合、指定されたラベリング構成で作成されることに注意してください。

## その他のパラメータ

`LabelStudioCallbackHandler` はいくつかのオプションパラメータを受け付けます：

- **api_key** - Label Studio API キー。環境変数 `LABEL_STUDIO_API_KEY` を上書きします。
- **url** - Label Studio URL。`LABEL_STUDIO_URL` を上書き、デフォルトは `http://localhost:8080`。
- **project_id** - 既存の Label Studio プロジェクト ID。`LABEL_STUDIO_PROJECT_ID` を上書き。このプロジェクトにデータを保存します。
- **project_name** - プロジェクト ID が指定されていない場合のプロジェクト名。新しいプロジェクトを作成します。デフォルトは現在の日付でフォーマットされた `"LangChain-%Y-%m-%d"`。
- **project_config** - [カスタムラベリング構成](#custom-labeling-configuration)
- **mode**: これを使用してターゲット構成をゼロから作成するショートカット：
   - `"prompt"` - 単一プロンプト、単一応答。デフォルト。
   - `"chat"` - マルチターンチャットモード。
