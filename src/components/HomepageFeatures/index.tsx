import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const feature: FeatureItem = {
  title: 'Translate LangChain',
  Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
  description: (
    <>
      This project provides translations of the <a href='https://python.langchain.com/'>LangChain documentation</a>. Our goal is to convey the value of LangChain and expand the community of developers and users who can benefit from this technology.
    </>
  ),
};

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--6', 'col--offset-3')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <Feature {...feature} />
        </div>
      </div>
    </section>
  );
}