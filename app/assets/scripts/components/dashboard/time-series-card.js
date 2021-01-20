import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import qs from 'qs';
import config from '../../config';
import LoadingMessage from '../loading-message';
import ErrorMessage from '../error-message';
import Card, {
  CardHeader as BaseHeader,
  CardTitle,
  CardHeadline,
} from '../card';
import TabbedSelector from '../tabbed-selector';
import LineChart from '../line-chart';
import InfoButton from '../info-button';

const ChartContainer = styled.div`
  max-height: 24rem;
  min-height: 20rem;
  padding: 0;
`;

const CardHeader = styled(BaseHeader)`
  display: grid;
  grid-template-rows: min-content 1fr;
  grid-gap: 0.5rem;
`;

const defaultState = {
  fetched: false,
  fetching: false,
  error: null,
  data: null,
};

export default function TimeSeriesCard({
  locationId,
  projectId,
  parameters,
  prefetchedData,
  dateRange,
  titleInfo,
}) {
  // eslint-disable-next-line no-unused-vars
  const [{ fetched, fetching, error, data }, setState] = useState(defaultState);

  const [activeTab, setActiveTab] = useState({
    id: parameters[0].parameter || parameters[0],
    name: parameters[0].parameter || parameters[0],
  });

  const [year, month, day] = (dateRange ? dateRange.split('/') : []).map(
    Number
  );

  const temporal = day ? 'hour' : 'day';
  const activeData = prefetchedData && prefetchedData[activeTab.id];

  useEffect(() => {
    if (!prefetchedData) {
      fetchData();
    } else {
      setState(state => ({
        ...state,
        fetched: true,
        fetching: false,
      }));
    }

    return () => {
      setState(defaultState);
    };
  }, [activeTab, dateRange]);

  const fetchData = () => {
    setState(state => ({ ...state, fetching: true, error: null }));

    let query = {
      parameter: activeTab.id,
      temporal,
      ...(dateRange
        ? {
            // In user space, month is 1 indexed
            date_from: new Date(year, month - 1, day || 1),
            date_to: day
              ? new Date(year, month - 1, day + 1)
              : new Date(year, month, 0),
          }
        : {}),
    };

    if (locationId) {
      query = { ...query, location: locationId, spatial: 'location' };
    } else if (projectId) {
      query = { ...query, project: projectId, spatial: 'project' };
    }

    fetch(`${config.api}/averages?${qs.stringify(query, { skipNulls: true })}`)
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
            data: json.results,
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

  if (!fetched && !fetching) {
    return null;
  }

  return (
    <Card
      id="time-series"
      className="card--time-series"
      renderHeader={() => (
        <CardHeader className="card__header">
          <TabbedSelector
            tabs={parameters.map(x => ({
              id: x.parameter || x.id,
              name: x.displayName || x.name,
            }))}
            activeTab={activeTab}
            onTabSelect={t => {
              setActiveTab(t);
            }}
          />
          <CardHeadline>
            <CardTitle className="card__title">Time Series Data</CardTitle>
            {titleInfo && <InfoButton info={titleInfo} id="time-series-info" />}
          </CardHeadline>
        </CardHeader>
      )}
      renderBody={() => (
        <ChartContainer className="card__body">
          {prefetchedData && activeData?.length ? (
            <LineChart
              data={activeData.map(m => ({
                x: new Date(m['day']),
                y: m.average,
              }))}
              yLabel={activeData && activeData[0].displayName}
              yUnit={activeData && activeData[0].unit}
            />
          ) : fetching ? (
            <LoadingMessage />
          ) : data && data.length ? (
            <LineChart
              data={data.map(m => ({ x: new Date(m[temporal]), y: m.average }))}
              yLabel={data && data[0].displayName}
              yUnit={data && data[0].unit}
              xUnit={temporal}
            />
          ) : (
            <ErrorMessage instructions="Please try a different time or parameter" />
          )}
        </ChartContainer>
      )}
    />
  );
}

TimeSeriesCard.propTypes = {
  titleInfo: PropTypes.string,
  locationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prefetchedData: PropTypes.object,
  parameters: PropTypes.arrayOf(
    PropTypes.shape({
      parameter: PropTypes.string.isRequired,
    })
  ),
  dateRange: PropTypes.string,
};