import { Model } from '@vuex-orm/core';
import Organization from '@/models/Organization';
import User from '@/models/User';
import WorkType from '@/models/WorkType';
import Location from '@/models/Location';
import { getQueryString } from '@/utils/urls';

export default class Worksite extends Model {
  static entity = 'worksites';

  static fields() {
    return {
      id: this.string(),
      address: this.string(''),
      location: this.attr(null),
      case_number: this.attr(null),
      city: this.attr(null),
      county: this.attr(null),
      form_data: this.attr(null),
      postal_code: this.attr(null),
      map_location: this.attr(null),
      incident: this.attr(null),
      name: this.attr(null),
      state: this.attr(null),
      work_types: this.attr(null),
      what3words: this.attr(null),
      notes: this.attr(null),
      events: this.attr(null),
      reported_by: this.attr(null),
    };
  }

  get latitude() {
    return this.location ? this.location.coordinates[1] : 10;
  }

  get longitude() {
    return this.location ? this.location.coordinates[0] : 10;
  }

  get form_fields() {
    if (!this.form_data) {
      return {};
    }

    return this.form_data.reduce((obj, item) => {
      return {
        ...obj,
        [item.field_key]: item.field_value,
      };
    }, {});
  }

  static getWorkType(work_types, filters, organization) {
    // TODO: Unit Test
    let currentFilteredTypes = [];
    if (filters) {
      const { fields } = filters;
      currentFilteredTypes = Object.keys(fields).filter(field_key =>
        Boolean(fields[field_key]),
      );
    }

    const filterByClaimedOrg = array => {
      return array
        .filter(type => type.claimed_by === organization.id)
        .sort((a, b) => {
          return (
            WorkType.commercialValues[b.work_type] -
            WorkType.commercialValues[a.work_type]
          );
        });
    };

    const filterByUnclaimed = array => {
      return array
        .filter(type => type.claimed_by === null)
        .sort((a, b) => {
          return (
            WorkType.commercialValues[b.work_type] -
            WorkType.commercialValues[a.work_type]
          );
        });
    };

    const allWorkTypes = [...work_types].sort((a, b) => {
      return (
        WorkType.commercialValues[b.work_type] -
        WorkType.commercialValues[a.work_type]
      );
    });
    const workTypesInFilter = [...work_types]
      .filter(type => currentFilteredTypes.includes(type.work_type))
      .sort((a, b) => {
        return (
          WorkType.commercialValues[b.work_type] -
          WorkType.commercialValues[a.work_type]
        );
      });

    if (allWorkTypes.length === 1) {
      return allWorkTypes[0];
    }
    if (workTypesInFilter.length === 1) {
      return workTypesInFilter[0];
    }
    if (workTypesInFilter > 1) {
      if (filterByClaimedOrg(workTypesInFilter).length) {
        return filterByClaimedOrg(workTypesInFilter)[0];
      }

      if (filterByUnclaimed(workTypesInFilter).length) {
        return filterByUnclaimed(workTypesInFilter)[0];
      }
      return workTypesInFilter[0];
    }
    if (filterByClaimedOrg(allWorkTypes).length) {
      return filterByClaimedOrg(allWorkTypes)[0];
    }

    if (filterByUnclaimed(allWorkTypes).length) {
      return filterByUnclaimed(allWorkTypes)[0];
    }
    return allWorkTypes[0];
  }

  static apiConfig = {
    actions: {
      async fetch(id, incident = null) {
        const worksiteParams = {};
        if (incident) {
          worksiteParams.incident = incident;
        }
        const worksite = await this.get(
          `/worksites/${id}?${getQueryString(worksiteParams)}`,
        );
        const organizations = worksite.response.data.work_types
          .filter(work_type => Boolean(work_type.claimed_by))
          .map(work_type => work_type.claimed_by);
        await Organization.api().get(
          `/organizations?id__in=${organizations.join(',')}`,
          {
            dataKey: 'results',
          },
        );
        const users = worksite.response.data.events.map(event => event.user);
        await User.api().get(`/users?id__in=${users.join(',')}`, {
          dataKey: 'results',
        });
        return worksite;
      },
      claimWorksite(id, work_types) {
        return this.post(
          `/worksites/${id}/claim`,
          {
            work_types,
          },
          { save: false },
        );
      },
      unclaimWorksite(id, work_types) {
        return this.post(
          `/worksites/${id}/unclaim`,
          {
            work_types,
          },
          { save: false },
        );
      },
      requestWorksite(id, work_types) {
        return this.post(
          `/worksites/${id}/request_take`,
          {
            work_types,
          },
          { save: false },
        );
      },
      addNote(id, note) {
        return this.post(
          `/worksites/${id}/notes`,
          {
            note,
          },
          { save: false },
        );
      },
      searchWorksites(search, incident) {
        return this.get(
          `/worksites?fields=id,name,address,case_number,postal_code,city,state,incident,work_types&limit=5&search=${search}&incident=${incident}`,
          {
            dataKey: 'results',
          },
          { save: false },
        );
      },
      updateWorkTypeStatus(work_type_id, status) {
        return this.patch(
          `/worksite_work_types/${work_type_id}`,
          {
            status,
          },
          { save: false },
        );
      },
      printWorksite(id) {
        try {
          return this.request({
            url: `/worksites/${id}/download`,
            method: 'POST',
            responseType: 'blob',
            headers: { Accept: 'application/pdf' },
            save: false,
          });
        } catch (e) {
          // console.error(e)
        }
      },
      downloadWorksite(id) {
        try {
          return this.request({
            url: `/worksites/${id}`,
            method: 'GET',
            responseType: 'blob',
            headers: { Accept: 'text/csv' },
            save: false,
          });
        } catch (e) {
          // console.error(e)
        }
      },
    },
  };
}
