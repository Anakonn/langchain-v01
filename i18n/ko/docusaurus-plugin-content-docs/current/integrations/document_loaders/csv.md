---
translated: true
---

# CSV

>쉼표로 구분된 값(CSV) 파일은 쉼표로 값을 구분하는 구분 텍스트 파일입니다. 파일의 각 줄은 데이터 레코드입니다. 각 레코드는 쉼표로 구분된 하나 이상의 필드로 구성됩니다.

문서당 단일 행으로 [csv](https://en.wikipedia.org/wiki/Comma-separated_values) 데이터를 로드합니다.

```python
from langchain_community.document_loaders.csv_loader import CSVLoader
```

```python
loader = CSVLoader(file_path="./example_data/mlb_teams_2012.csv")

data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='Team: Nationals\n"Payroll (millions)": 81.34\n"Wins": 98', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 0}, lookup_index=0), Document(page_content='Team: Reds\n"Payroll (millions)": 82.20\n"Wins": 97', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 1}, lookup_index=0), Document(page_content='Team: Yankees\n"Payroll (millions)": 197.96\n"Wins": 95', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 2}, lookup_index=0), Document(page_content='Team: Giants\n"Payroll (millions)": 117.62\n"Wins": 94', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 3}, lookup_index=0), Document(page_content='Team: Braves\n"Payroll (millions)": 83.31\n"Wins": 94', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 4}, lookup_index=0), Document(page_content='Team: Athletics\n"Payroll (millions)": 55.37\n"Wins": 94', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 5}, lookup_index=0), Document(page_content='Team: Rangers\n"Payroll (millions)": 120.51\n"Wins": 93', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 6}, lookup_index=0), Document(page_content='Team: Orioles\n"Payroll (millions)": 81.43\n"Wins": 93', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 7}, lookup_index=0), Document(page_content='Team: Rays\n"Payroll (millions)": 64.17\n"Wins": 90', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 8}, lookup_index=0), Document(page_content='Team: Angels\n"Payroll (millions)": 154.49\n"Wins": 89', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 9}, lookup_index=0), Document(page_content='Team: Tigers\n"Payroll (millions)": 132.30\n"Wins": 88', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 10}, lookup_index=0), Document(page_content='Team: Cardinals\n"Payroll (millions)": 110.30\n"Wins": 88', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 11}, lookup_index=0), Document(page_content='Team: Dodgers\n"Payroll (millions)": 95.14\n"Wins": 86', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 12}, lookup_index=0), Document(page_content='Team: White Sox\n"Payroll (millions)": 96.92\n"Wins": 85', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 13}, lookup_index=0), Document(page_content='Team: Brewers\n"Payroll (millions)": 97.65\n"Wins": 83', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 14}, lookup_index=0), Document(page_content='Team: Phillies\n"Payroll (millions)": 174.54\n"Wins": 81', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 15}, lookup_index=0), Document(page_content='Team: Diamondbacks\n"Payroll (millions)": 74.28\n"Wins": 81', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 16}, lookup_index=0), Document(page_content='Team: Pirates\n"Payroll (millions)": 63.43\n"Wins": 79', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 17}, lookup_index=0), Document(page_content='Team: Padres\n"Payroll (millions)": 55.24\n"Wins": 76', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 18}, lookup_index=0), Document(page_content='Team: Mariners\n"Payroll (millions)": 81.97\n"Wins": 75', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 19}, lookup_index=0), Document(page_content='Team: Mets\n"Payroll (millions)": 93.35\n"Wins": 74', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 20}, lookup_index=0), Document(page_content='Team: Blue Jays\n"Payroll (millions)": 75.48\n"Wins": 73', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 21}, lookup_index=0), Document(page_content='Team: Royals\n"Payroll (millions)": 60.91\n"Wins": 72', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 22}, lookup_index=0), Document(page_content='Team: Marlins\n"Payroll (millions)": 118.07\n"Wins": 69', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 23}, lookup_index=0), Document(page_content='Team: Red Sox\n"Payroll (millions)": 173.18\n"Wins": 69', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 24}, lookup_index=0), Document(page_content='Team: Indians\n"Payroll (millions)": 78.43\n"Wins": 68', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 25}, lookup_index=0), Document(page_content='Team: Twins\n"Payroll (millions)": 94.08\n"Wins": 66', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 26}, lookup_index=0), Document(page_content='Team: Rockies\n"Payroll (millions)": 78.06\n"Wins": 64', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 27}, lookup_index=0), Document(page_content='Team: Cubs\n"Payroll (millions)": 88.19\n"Wins": 61', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 28}, lookup_index=0), Document(page_content='Team: Astros\n"Payroll (millions)": 60.65\n"Wins": 55', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 29}, lookup_index=0)]
```

## csv 구문 분석 및 로드 사용자 정의

지원되는 csv 인수에 대한 자세한 내용은 [csv 모듈](https://docs.python.org/3/library/csv.html) 문서를 참조하십시오.

```python
loader = CSVLoader(
    file_path="./example_data/mlb_teams_2012.csv",
    csv_args={
        "delimiter": ",",
        "quotechar": '"',
        "fieldnames": ["MLB Team", "Payroll in millions", "Wins"],
    },
)

data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='MLB Team: Team\nPayroll in millions: "Payroll (millions)"\nWins: "Wins"', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 0}, lookup_index=0), Document(page_content='MLB Team: Nationals\nPayroll in millions: 81.34\nWins: 98', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 1}, lookup_index=0), Document(page_content='MLB Team: Reds\nPayroll in millions: 82.20\nWins: 97', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 2}, lookup_index=0), Document(page_content='MLB Team: Yankees\nPayroll in millions: 197.96\nWins: 95', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 3}, lookup_index=0), Document(page_content='MLB Team: Giants\nPayroll in millions: 117.62\nWins: 94', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 4}, lookup_index=0), Document(page_content='MLB Team: Braves\nPayroll in millions: 83.31\nWins: 94', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 5}, lookup_index=0), Document(page_content='MLB Team: Athletics\nPayroll in millions: 55.37\nWins: 94', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 6}, lookup_index=0), Document(page_content='MLB Team: Rangers\nPayroll in millions: 120.51\nWins: 93', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 7}, lookup_index=0), Document(page_content='MLB Team: Orioles\nPayroll in millions: 81.43\nWins: 93', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 8}, lookup_index=0), Document(page_content='MLB Team: Rays\nPayroll in millions: 64.17\nWins: 90', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 9}, lookup_index=0), Document(page_content='MLB Team: Angels\nPayroll in millions: 154.49\nWins: 89', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 10}, lookup_index=0), Document(page_content='MLB Team: Tigers\nPayroll in millions: 132.30\nWins: 88', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 11}, lookup_index=0), Document(page_content='MLB Team: Cardinals\nPayroll in millions: 110.30\nWins: 88', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 12}, lookup_index=0), Document(page_content='MLB Team: Dodgers\nPayroll in millions: 95.14\nWins: 86', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 13}, lookup_index=0), Document(page_content='MLB Team: White Sox\nPayroll in millions: 96.92\nWins: 85', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 14}, lookup_index=0), Document(page_content='MLB Team: Brewers\nPayroll in millions: 97.65\nWins: 83', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 15}, lookup_index=0), Document(page_content='MLB Team: Phillies\nPayroll in millions: 174.54\nWins: 81', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 16}, lookup_index=0), Document(page_content='MLB Team: Diamondbacks\nPayroll in millions: 74.28\nWins: 81', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 17}, lookup_index=0), Document(page_content='MLB Team: Pirates\nPayroll in millions: 63.43\nWins: 79', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 18}, lookup_index=0), Document(page_content='MLB Team: Padres\nPayroll in millions: 55.24\nWins: 76', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 19}, lookup_index=0), Document(page_content='MLB Team: Mariners\nPayroll in millions: 81.97\nWins: 75', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 20}, lookup_index=0), Document(page_content='MLB Team: Mets\nPayroll in millions: 93.35\nWins: 74', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 21}, lookup_index=0), Document(page_content='MLB Team: Blue Jays\nPayroll in millions: 75.48\nWins: 73', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 22}, lookup_index=0), Document(page_content='MLB Team: Royals\nPayroll in millions: 60.91\nWins: 72', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 23}, lookup_index=0), Document(page_content='MLB Team: Marlins\nPayroll in millions: 118.07\nWins: 69', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 24}, lookup_index=0), Document(page_content='MLB Team: Red Sox\nPayroll in millions: 173.18\nWins: 69', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 25}, lookup_index=0), Document(page_content='MLB Team: Indians\nPayroll in millions: 78.43\nWins: 68', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 26}, lookup_index=0), Document(page_content='MLB Team: Twins\nPayroll in millions: 94.08\nWins: 66', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 27}, lookup_index=0), Document(page_content='MLB Team: Rockies\nPayroll in millions: 78.06\nWins: 64', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 28}, lookup_index=0), Document(page_content='MLB Team: Cubs\nPayroll in millions: 88.19\nWins: 61', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 29}, lookup_index=0), Document(page_content='MLB Team: Astros\nPayroll in millions: 60.65\nWins: 55', lookup_str='', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 30}, lookup_index=0)]
```

## 문서 소스를 식별할 열 지정

`source_column` 인수를 사용하여 각 행에서 생성된 문서의 소스를 지정합니다. 그렇지 않으면 `file_path`가 CSV 파일에서 생성된 모든 문서의 소스로 사용됩니다.

이는 소스를 사용하여 질문에 답변하는 체인에서 CSV 파일에서 로드된 문서를 사용할 때 유용합니다.

```python
loader = CSVLoader(file_path="./example_data/mlb_teams_2012.csv", source_column="Team")

data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='Team: Nationals\n"Payroll (millions)": 81.34\n"Wins": 98', lookup_str='', metadata={'source': 'Nationals', 'row': 0}, lookup_index=0), Document(page_content='Team: Reds\n"Payroll (millions)": 82.20\n"Wins": 97', lookup_str='', metadata={'source': 'Reds', 'row': 1}, lookup_index=0), Document(page_content='Team: Yankees\n"Payroll (millions)": 197.96\n"Wins": 95', lookup_str='', metadata={'source': 'Yankees', 'row': 2}, lookup_index=0), Document(page_content='Team: Giants\n"Payroll (millions)": 117.62\n"Wins": 94', lookup_str='', metadata={'source': 'Giants', 'row': 3}, lookup_index=0), Document(page_content='Team: Braves\n"Payroll (millions)": 83.31\n"Wins": 94', lookup_str='', metadata={'source': 'Braves', 'row': 4}, lookup_index=0), Document(page_content='Team: Athletics\n"Payroll (millions)": 55.37\n"Wins": 94', lookup_str='', metadata={'source': 'Athletics', 'row': 5}, lookup_index=0), Document(page_content='Team: Rangers\n"Payroll (millions)": 120.51\n"Wins": 93', lookup_str='', metadata={'source': 'Rangers', 'row': 6}, lookup_index=0), Document(page_content='Team: Orioles\n"Payroll (millions)": 81.43\n"Wins": 93', lookup_str='', metadata={'source': 'Orioles', 'row': 7}, lookup_index=0), Document(page_content='Team: Rays\n"Payroll (millions)": 64.17\n"Wins": 90', lookup_str='', metadata={'source': 'Rays', 'row': 8}, lookup_index=0), Document(page_content='Team: Angels\n"Payroll (millions)": 154.49\n"Wins": 89', lookup_str='', metadata={'source': 'Angels', 'row': 9}, lookup_index=0), Document(page_content='Team: Tigers\n"Payroll (millions)": 132.30\n"Wins": 88', lookup_str='', metadata={'source': 'Tigers', 'row': 10}, lookup_index=0), Document(page_content='Team: Cardinals\n"Payroll (millions)": 110.30\n"Wins": 88', lookup_str='', metadata={'source': 'Cardinals', 'row': 11}, lookup_index=0), Document(page_content='Team: Dodgers\n"Payroll (millions)": 95.14\n"Wins": 86', lookup_str='', metadata={'source': 'Dodgers', 'row': 12}, lookup_index=0), Document(page_content='Team: White Sox\n"Payroll (millions)": 96.92\n"Wins": 85', lookup_str='', metadata={'source': 'White Sox', 'row': 13}, lookup_index=0), Document(page_content='Team: Brewers\n"Payroll (millions)": 97.65\n"Wins": 83', lookup_str='', metadata={'source': 'Brewers', 'row': 14}, lookup_index=0), Document(page_content='Team: Phillies\n"Payroll (millions)": 174.54\n"Wins": 81', lookup_str='', metadata={'source': 'Phillies', 'row': 15}, lookup_index=0), Document(page_content='Team: Diamondbacks\n"Payroll (millions)": 74.28\n"Wins": 81', lookup_str='', metadata={'source': 'Diamondbacks', 'row': 16}, lookup_index=0), Document(page_content='Team: Pirates\n"Payroll (millions)": 63.43\n"Wins": 79', lookup_str='', metadata={'source': 'Pirates', 'row': 17}, lookup_index=0), Document(page_content='Team: Padres\n"Payroll (millions)": 55.24\n"Wins": 76', lookup_str='', metadata={'source': 'Padres', 'row': 18}, lookup_index=0), Document(page_content='Team: Mariners\n"Payroll (millions)": 81.97\n"Wins": 75', lookup_str='', metadata={'source': 'Mariners', 'row': 19}, lookup_index=0), Document(page_content='Team: Mets\n"Payroll (millions)": 93.35\n"Wins": 74', lookup_str='', metadata={'source': 'Mets', 'row': 20}, lookup_index=0), Document(page_content='Team: Blue Jays\n"Payroll (millions)": 75.48\n"Wins": 73', lookup_str='', metadata={'source': 'Blue Jays', 'row': 21}, lookup_index=0), Document(page_content='Team: Royals\n"Payroll (millions)": 60.91\n"Wins": 72', lookup_str='', metadata={'source': 'Royals', 'row': 22}, lookup_index=0), Document(page_content='Team: Marlins\n"Payroll (millions)": 118.07\n"Wins": 69', lookup_str='', metadata={'source': 'Marlins', 'row': 23}, lookup_index=0), Document(page_content='Team: Red Sox\n"Payroll (millions)": 173.18\n"Wins": 69', lookup_str='', metadata={'source': 'Red Sox', 'row': 24}, lookup_index=0), Document(page_content='Team: Indians\n"Payroll (millions)": 78.43\n"Wins": 68', lookup_str='', metadata={'source': 'Indians', 'row': 25}, lookup_index=0), Document(page_content='Team: Twins\n"Payroll (millions)": 94.08\n"Wins": 66', lookup_str='', metadata={'source': 'Twins', 'row': 26}, lookup_index=0), Document(page_content='Team: Rockies\n"Payroll (millions)": 78.06\n"Wins": 64', lookup_str='', metadata={'source': 'Rockies', 'row': 27}, lookup_index=0), Document(page_content='Team: Cubs\n"Payroll (millions)": 88.19\n"Wins": 61', lookup_str='', metadata={'source': 'Cubs', 'row': 28}, lookup_index=0), Document(page_content='Team: Astros\n"Payroll (millions)": 60.65\n"Wins": 55', lookup_str='', metadata={'source': 'Astros', 'row': 29}, lookup_index=0)]
```

## `UnstructuredCSVLoader`

`UnstructuredCSVLoader`를 사용하여 테이블을 로드할 수도 있습니다. `UnstructuredCSVLoader`를 사용하는 한 가지 장점은 `"elements"` 모드에서 사용하는 경우 테이블의 HTML 표현이 메타데이터에 포함된다는 것입니다.

```python
from langchain_community.document_loaders.csv_loader import UnstructuredCSVLoader
```

```python
loader = UnstructuredCSVLoader(
    file_path="example_data/mlb_teams_2012.csv", mode="elements"
)
docs = loader.load()
```

```python
print(docs[0].metadata["text_as_html"])
```

```output
<table border="1" class="dataframe">
  <tbody>
    <tr>
      <td>Nationals</td>
      <td>81.34</td>
      <td>98</td>
    </tr>
    <tr>
      <td>Reds</td>
      <td>82.20</td>
      <td>97</td>
    </tr>
    <tr>
      <td>Yankees</td>
      <td>197.96</td>
      <td>95</td>
    </tr>
    <tr>
      <td>Giants</td>
      <td>117.62</td>
      <td>94</td>
    </tr>
    <tr>
      <td>Braves</td>
      <td>83.31</td>
      <td>94</td>
    </tr>
    <tr>
      <td>Athletics</td>
      <td>55.37</td>
      <td>94</td>
    </tr>
    <tr>
      <td>Rangers</td>
      <td>120.51</td>
      <td>93</td>
    </tr>
    <tr>
      <td>Orioles</td>
      <td>81.43</td>
      <td>93</td>
    </tr>
    <tr>
      <td>Rays</td>
      <td>64.17</td>
      <td>90</td>
    </tr>
    <tr>
      <td>Angels</td>
      <td>154.49</td>
      <td>89</td>
    </tr>
    <tr>
      <td>Tigers</td>
      <td>132.30</td>
      <td>88</td>
    </tr>
    <tr>
      <td>Cardinals</td>
      <td>110.30</td>
      <td>88</td>
    </tr>
    <tr>
      <td>Dodgers</td>
      <td>95.14</td>
      <td>86</td>
    </tr>
    <tr>
      <td>White Sox</td>
      <td>96.92</td>
      <td>85</td>
    </tr>
    <tr>
      <td>Brewers</td>
      <td>97.65</td>
      <td>83</td>
    </tr>
    <tr>
      <td>Phillies</td>
      <td>174.54</td>
      <td>81</td>
    </tr>
    <tr>
      <td>Diamondbacks</td>
      <td>74.28</td>
      <td>81</td>
    </tr>
    <tr>
      <td>Pirates</td>
      <td>63.43</td>
      <td>79</td>
    </tr>
    <tr>
      <td>Padres</td>
      <td>55.24</td>
      <td>76</td>
    </tr>
    <tr>
      <td>Mariners</td>
      <td>81.97</td>
      <td>75</td>
    </tr>
    <tr>
      <td>Mets</td>
      <td>93.35</td>
      <td>74</td>
    </tr>
    <tr>
      <td>Blue Jays</td>
      <td>75.48</td>
      <td>73</td>
    </tr>
    <tr>
      <td>Royals</td>
      <td>60.91</td>
      <td>72</td>
    </tr>
    <tr>
      <td>Marlins</td>
      <td>118.07</td>
      <td>69</td>
    </tr>
    <tr>
      <td>Red Sox</td>
      <td>173.18</td>
      <td>69</td>
    </tr>
    <tr>
      <td>Indians</td>
      <td>78.43</td>
      <td>68</td>
    </tr>
    <tr>
      <td>Twins</td>
      <td>94.08</td>
      <td>66</td>
    </tr>
    <tr>
      <td>Rockies</td>
      <td>78.06</td>
      <td>64</td>
    </tr>
    <tr>
      <td>Cubs</td>
      <td>88.19</td>
      <td>61</td>
    </tr>
    <tr>
      <td>Astros</td>
      <td>60.65</td>
      <td>55</td>
    </tr>
  </tbody>
</table>
```
