import React from 'react';
import { PropTypes as T } from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import qs from 'qs';

import MapComponent from '../components/map';
import LocationsSource from '../components/map/locations-source';
import MeasurementsLayer from '../components/map/measurements-layer';
import Legend from '../components/map/legend';

function WorldMap({ parameters, location }) {
  const query = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
  let parameterData = _.find(parameters, { name: query.parameter });
  let activeParam = parameterData || _.find(parameters, { name: 'PM25' });
  return (
    <section className="inpage">
      <header className="inpage__header">
        <div className="inner">
          <div className="inpage__headline">
            <h1 className="inpage__title">Map</h1>
          </div>
        </div>
      </header>
      <div className="inpage__body">
        <MapComponent>
          <LocationsSource activeParameter={activeParam.name.toLowerCase()}>
            <MeasurementsLayer
              activeParameter={activeParam.name.toLowerCase()}
            />
          </LocationsSource>
          <Legend
            parameters={parameters}
            activeParameter={activeParam.name.toLowerCase()}
          />
        </MapComponent>
      </div>
    </section>
  );
}

WorldMap.propTypes = {
  location: T.object,
  history: T.object,

  parameters: T.array,
};

// /////////////////////////////////////////////////////////////////////
// Connect functions

function selector(state) {
  return {
    parameters: state.baseData.data.parameters,
  };
}

export default connect(selector)(WorldMap);
