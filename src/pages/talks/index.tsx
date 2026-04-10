import React from 'react';
import Layout from '@theme/Layout';

interface Talk {
  slug: string;
  title: string;
  description: string;
  unlisted?: boolean;
}

const talks: Talk[] = [];

export default function TalksIndex(): React.JSX.Element {
  const listedTalks = talks.filter((talk) => !talk.unlisted);

  return (
    <Layout title="Talks" description="Presentations and talks">
      <main className="container margin-vert--lg">
        <h1>Talks</h1>
        <div className="row">
          {listedTalks.map((talk) => (
            <div key={talk.slug} className="col col--6 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <h3>
                    <a href={`/talks/${talk.slug}/`}>{talk.title}</a>
                  </h3>
                </div>
                <div className="card__body">
                  <p>{talk.description}</p>
                </div>
                <div className="card__footer">
                  <a className="button button--primary" href={`/talks/${talk.slug}/`}>
                    View Slides
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
