import React from 'react';
import { PropTypes as T } from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../../components/card';

const SourceList = styled(CardBody)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Source = styled(Link)``;

export default function SourceInfo({ measurements, sources }) {
  const { data } = measurements;

  if (data.attribution) {
    // filtering attribution[0] b/c it kept showing up with same name and url as sources[0]
    let added = data.attribution.filter((src, index) => index !== 0);
    sources = [...sources, ...added];
  }
  return (
    <Card
      title="Sources"
      gridColumn={'11 / -1'}
      renderBody={() => (
        <SourceList className="card__body">
          {sources.map(source => (
            <Source
              to={source.sourceURL || source.url}
              disabled={!(source.sourceURL || source.url)}
              key={source.name}
            >
              {source.name}
            </Source>
          ))}
        </SourceList>
      )}
      renderFooter={() => (
        <footer className="card__footer">
          {sources[0] && (
            <div>
              For more information contact{' '}
              <a
                href={`mailto:${sources[0].contacts[0]}`}
                title={sources[0].contacts[0]}
              >
                {sources[0].contacts[0]}
              </a>
              .
            </div>
          )}
        </footer>
      )}
    />
  );
}

SourceInfo.propTypes = {
  sources: T.array,

  measurements: T.shape({
    fetching: T.bool,
    fetched: T.bool,
    error: T.string,
    data: T.object,
  }),
};
