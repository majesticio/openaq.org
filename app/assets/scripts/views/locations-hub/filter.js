import React, { useState } from 'react';
import { PropTypes as T } from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'qs';
import c from 'classnames';
import _ from 'lodash';
import { Dropdown } from 'openaq-design-system';
import ParamSelect from '../../components/parameters-selection';
import SensorTypeFilter from './sensor-type-filter';

import { buildQS } from '../../utils/url';
import { toggleValue } from '../../utils/array';

const defaultSelected = {
  parameters: [],
  countries: [],
  sources: [],
  order_by: [],
  source_type: [],
};

const sortOptions = ['location', 'country', 'city', 'count'];

const initFromLocation = ({
  countries,
  parameters,
  sources,
  order_by,
  grade,
  manufacturer,
  mobility,
  entity,
}) => {
  return {
    parameters: parameters ? parameters.split(',').map(Number) : [],
    countries: countries ? countries.split(',') : [],
    sources: sources ? sources.split(',') : [],
    order_by: order_by ? order_by.split(',') : [],

    grade: grade,
    manufacturer: manufacturer,
    mobility: mobility,
    entity: entity,
  };
};
export default function Filter({
  countries,
  parameters,
  sources,
  manufacturers,
}) {
  let history = useHistory();
  let location = useLocation();

  const [selected, setSelected] = useState(
    initFromLocation(qs.parse(location.search, { ignoreQueryPrefix: true }))
  );

  // alphabetizes filter names
  const sortList = list => list.sort((a, b) => a.name.localeCompare(b.name));
  sortList(countries);
  sortList(parameters);

  function onFilterSelect(what, value) {
    let query = qs.parse(location.search, {
      ignoreQueryPrefix: true,
    });

    switch (what) {
      case 'order_by': {
        if (query.order_by && query.order_by.includes(value)) {
          query.order_by = [];
          setSelected(prev => ({
            ...prev,
            ['order_by']: [],
          }));
        } else {
          query.order_by = [value];
          setSelected(prev => ({
            ...prev,
            ['order_by']: [value],
          }));
        }
        break;
      }

      case 'source_type': {
        const { grade, manufacturer, mobility, entity } = value;
        query.grade = grade;
        query.manufacturer = manufacturer;
        query.mobility = mobility;
        query.entity = entity;
        setSelected(prev => ({
          ...prev,
          grade: query.grade,
          manufacturer: query.manufacturer,
          mobility: query.mobility,
          entity: query.entity,
        }));
        break;
      }

      case 'parameters': {
        // Parameters are tracked by id which is a Number so it needs to be cast
        const parameters =
          query && query.parameters
            ? query.parameters.split(',').map(Number)
            : [];
        query.parameters = toggleValue(parameters, value);

        setSelected(prev => ({
          ...prev,
          ['parameters']: toggleValue(prev['parameters'], value),
        }));
        break;
      }

      case 'countries': {
        const countries =
          query && query.countries ? query.countries.split(',') : [];

        query.countries = toggleValue(countries, value);

        setSelected(prev => ({
          ...prev,
          countries: toggleValue(prev['countries'], value),
        }));
        break;
      }
      case 'sources': {
        const sources = query && query.sources ? query.sources.split(',') : [];

        query.sources = toggleValue(sources, value);

        setSelected(prev => ({
          ...prev,
          ['sources']: toggleValue(prev['sources'], value),
        }));
        break;
      }

      case 'clear':
        query = null;
        setSelected(defaultSelected);
        break;
    }

    // update url
    history.push(`/locations?${buildQS(query)}`);
  }

  return (
    <>
      <div className="hub-filters">
        <div className="inner">
          <div className="filters__group">
            <h2>Filter by</h2>
            <div className="filter__values">
              <Dropdown
                triggerElement="a"
                triggerTitle="View country options"
                triggerText="Country"
                triggerClassName="button--drop-filter filter--drop"
              >
                <ul
                  role="menu"
                  data-cy="filter-countries"
                  className="drop__menu drop__menu--select scrollable"
                >
                  {_.sortBy(countries).map(o => {
                    return (
                      <li key={o.code}>
                        <div
                          data-cy="filter-menu-item"
                          className={c('drop__menu-item', {
                            'drop__menu-item--active': selected.countries.includes(
                              o.code
                            ),
                          })}
                          data-hook="dropdown:close"
                          onClick={() => {
                            onFilterSelect('countries', o.code);
                          }}
                        >
                          <span data-cy={o.name}>{o.name}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Dropdown>

              <Dropdown
                triggerElement="a"
                triggerTitle="View filter options"
                triggerText="Parameter"
                triggerClassName="button--drop-filter filter--drop"
              >
                <ParamSelect
                  parameters={parameters}
                  onFilterSelect={onFilterSelect}
                  selected={selected}
                />
              </Dropdown>

              <Dropdown
                triggerElement="a"
                triggerTitle="View source options"
                triggerText="Data Source"
                triggerClassName="button--drop-filter"
              >
                <ul
                  role="menu"
                  data-cy="filter-sources"
                  className="drop__menu drop__menu--select scrollable"
                >
                  {_.sortBy(sources).map(o => {
                    return (
                      <li key={o.sourceSlug}>
                        <div
                          data-cy="filter-menu-item"
                          className={c('drop__menu-item', {
                            'drop__menu-item--active': selected.sources.includes(
                              o.sourceSlug
                            ),
                          })}
                          data-hook="dropdown:close"
                          onClick={() => {
                            onFilterSelect('sources', o.sourceSlug);
                          }}
                        >
                          <span data-cy={o.sourceSlug}>{o.sourceName}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Dropdown>
              <Dropdown
                triggerElement="a"
                triggerTitle="View source type options"
                triggerText="Sensor Type"
                triggerClassName="button--drop-filter"
                className="sensor__type-filter"
              >
                <SensorTypeFilter
                  onApplyClick={(grade, manufacturer, mobility, entity) => {
                    onFilterSelect('source_type', {
                      grade,
                      manufacturer,
                      mobility,
                      entity,
                    });
                  }}
                  grade={selected.grade}
                  mobility={selected.mobility}
                  entity={selected.entity}
                  manufacturers={manufacturers}
                />
              </Dropdown>
            </div>
          </div>
          <div className="filters__group">
            <h2>Order by</h2>
            <div className="filter__values">
              <Dropdown
                triggerElement="a"
                triggerTitle="View sort options"
                triggerText="Order By"
                triggerClassName="button--drop-filter filter--drop sort-order"
              >
                <ul
                  role="menu"
                  className="drop__menu drop__menu--select scrollable"
                >
                  {_.sortBy(sortOptions).map(o => {
                    return (
                      <li key={o}>
                        <div
                          data-cy="filter-menu-item"
                          className={c('drop__menu-item', {
                            'drop__menu-item--active': selected.order_by.includes(
                              o
                            ),
                          })}
                          data-hook="dropdown:close"
                          onClick={() => onFilterSelect('order_by', o)}
                        >
                          <span>{`${o[0].toUpperCase()}${o.slice(1)}`}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {Object.values(selected).find(o => {
        return Array.isArray(o) ? o.length > 0 : o;
      }) && (
        <div className="filters-summary">
          {selected.countries.map(o => {
            const country = countries.find(x => x.code === o);
            return (
              <button
                type="button"
                className="button--filter-pill"
                data-cy="filter-pill"
                key={country.code}
                onClick={() => onFilterSelect('countries', country.code)}
              >
                <span>{country.name}</span>
              </button>
            );
          })}

          {selected.parameters.map(o => {
            const parameter = parameters.find(x => x.id === o);
            return (
              <button
                type="button"
                className="button--filter-pill"
                data-cy="filter-pill"
                key={parameter.id}
                onClick={() => onFilterSelect('parameters', parameter.id)}
              >
                <span>{parameter.displayName}</span>
              </button>
            );
          })}

          {selected.sources.map(o => {
            const source = sources.find(x => x.sourceSlug === o);
            return (
              <button
                type="button"
                className="button--filter-pill"
                data-cy="filter-pill"
                key={source.sourceSlug}
                onClick={() => onFilterSelect('sources', source.sourceSlug)}
              >
                <span>{source.sourceName}</span>
              </button>
            );
          })}

          {['grade', 'manufacturer', 'mobility', 'entity'].map(key => {
            const o = selected[key];
            return (
              o && (
                <button
                  type="button"
                  className="button--filter-pill"
                  key={o}
                  onClick={() =>
                    onFilterSelect('source_type', {
                      grade: selected.grade,
                      mobility: selected.mobility,
                      entity: selected.entity,
                      manufacturer: selected.manufacturer,

                      [key]: null,
                    })
                  }
                >
                  <span>{o}</span>
                </button>
              )
            );
          })}

          {selected.order_by.map(o => {
            return (
              <button
                type="button"
                className="button--filter-pill orderBy"
                key={o}
                onClick={() => onFilterSelect('order_by', o)}
              >
                <span>{o}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="button button--small button--primary-unbounded"
            title="Clear all selected filters"
            data-cy="filter-clear"
            onClick={e => {
              e.preventDefault();
              onFilterSelect('clear');
            }}
          >
            <small> (Clear Filters)</small>
          </button>
        </div>
      )}
    </>
  );
}

Filter.propTypes = {
  organizations: T.array,
  parameters: T.array,
  countries: T.array,
  sources: T.array,
  order_by: T.array,
  manufacturers: T.array,
};
