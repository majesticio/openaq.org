import React, { useEffect, useState } from 'react';
import { PropTypes as T } from 'prop-types';
import fetch from 'isomorphic-fetch';
import qs from 'qs';

import { HeaderMessage } from '../../components/header';
import Header from '../../components/header';
import { buildQS } from '../../utils/url';

import styled from 'styled-components';
import CardList from '../../components/card-list';
import config from '../../config';
import DetailsCard from '../../components/dashboard/details-card';
import LatestMeasurementsCard from '../../components/dashboard/lastest-measurements-card';
import SourcesCard from '../../components/dashboard/sources-card';
import MeasureandsCard from '../../components/dashboard/measurands-card';
import TemporalCoverageCard from '../../components/dashboard/temporal-coverage-card';
import TimeSeriesCard from '../../components/dashboard/time-series-card';
import MapCard from '../../components/dashboard/map-card';
import DateSelector from '../../components/date-selector';

const defaultState = {
  fetched: false,
  fetching: false,
  error: null,
  data: null,
};

const Dashboard = styled(CardList)`
  padding: 2rem 4rem;
`;

function Project({ match, history, location }) {
  const { id } = match.params;

  const [dateRange, setDateRange] = useState(
    qs.parse(location.search, { ignoreQueryPrefix: true }).dateRange
  );

  useEffect(() => {
    let query = qs.parse(location.search, {
      ignoreQueryPrefix: true,
    });
    query.dateRange = dateRange;
    history.push(`${location.pathname}?${buildQS(query)}`);
  }, [dateRange]);

  const [{ fetched, fetching, error, data }, setState] = useState(defaultState);

  useEffect(() => {
    const fetchData = id => {
      setState(state => ({ ...state, fetching: true, error: null }));
      fetch(`${config.api}/projects/${encodeURIComponent(id)}`)
        .then(response => {
          if (response.status >= 400) {
            throw new Error('Bad response');
          }
          return response.json();
        })
        .then(
          json => {
            setState(state => ({
              ...state,
              fetched: true,
              fetching: false,
              data: json.results[0],
            }));
          },
          e => {
            console.log('e', e);
            setState(state => ({
              ...state,
              fetched: true,
              fetching: false,
              error: e,
            }));
          }
        );
    };

    fetchData(id);

    return () => {
      setState(defaultState);
    };
  }, []);

  if (!fetched && !fetching) {
    return null;
  }

  if (fetching) {
    return (
      <HeaderMessage>
        <h1>Take a deep breath.</h1>
        <div className="prose prose--responsive">
          <p>Location data is loading...</p>
        </div>
      </HeaderMessage>
    );
  }

  if (error || !data) {
    return (
      <HeaderMessage>
        <h1>Uh oh, something went wrong.</h1>
        <div className="prose prose--responsive">
          <p>
            There was a problem getting the data. If you continue to have
            problems, please let us know.
          </p>
          <p>
            <a href="mailto:info@openaq.org" title="Send us an email">
              Send us an Email
            </a>
          </p>
        </div>
      </HeaderMessage>
    );
  }

  return (
    <section className="inpage">
      <Header
        tagline="Datasets"
        title={data.name}
        subtitle={data.subtitle}
        action={{
          api: `${config.apiDocs}`,
          download: () => {},
        }}
        sourceType={data.sourceType}
        isMobile={data.isMobile}
      />
      <div className="inpage__body">
        <DateSelector setDateRange={setDateRange} dateRange={dateRange} />
        <Dashboard
          gridTemplateRows={'repeat(4, 20rem)'}
          gridTemplateColumns={'repeat(12, 1fr)'}
          className="inner"
        >
          <DetailsCard
            measurements={data.measurements}
            date={{
              start: data.firstUpdated,
              end: data.lastUpdated,
            }}
          />
          <LatestMeasurementsCard parameters={data.parameters} />
          <SourcesCard sources={data.sources} />
          <TimeSeriesCard
            projectId={data.id}
            parameters={data.parameters}
            xUnit="day"
          />
          <MeasureandsCard parameters={data.parameters} />
          <TemporalCoverageCard
            parameters={data.parameters}
            spatial="project"
            id={data.name}
          />
        </Dashboard>
      </div>
    </section>
  );
}

Project.propTypes = {
  match: T.object, // from react-router
  history: T.object,
  location: T.object,
};

export default Project;
