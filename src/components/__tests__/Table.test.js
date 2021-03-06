/**
 *
 * Tests for Table
 *
 * Components
 */

import { shallowMount } from '@vue/test-utils';
import { Store } from 'vuex-mock-store';
import moment from 'moment';
import BaseCheckbox from '../BaseCheckbox';
import Table from '../Table';

const TestColumns = [
  {
    title: 'One',
    dataIndex: 'one_index',
    key: 'one_index',
    width: '0.5fr',
  },
  {
    title: 'Two',
    dataIndex: 'two_index',
    key: 'two_index',
    width: '1.5fr',
  },
];

const mocks = {
  $t: (key) => key,
  $moment: moment,
  $store: new Store({
    state: {
      events: {
        state: { events: [] },
        getters: { getEvents: 0 },
        actions: { addEvent: () => {} },
      },
    },
  }),
};

const TestData = [{ id: 'one_index' }, { id: 'two_index' }];

const mountWithOptions = ({ props } = {}) =>
  shallowMount(Table, {
    stubs: {
      'base-checkbox': BaseCheckbox,
      'form-select': true,
      'base-button': true,
      'base-text': true,
    },
    propsData: {
      columns: TestColumns,
      data: TestData,
      ...props,
    },
    mocks,
  });

describe('Table', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should update selected items', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.setChecked({ id: 'one_index' }, true);
    expect(wrapper.vm.selectedItems).toMatchSnapshot();
    wrapper.vm.setChecked({ id: 'one_index' });
    wrapper.vm.setChecked({ id: 'one_index' }, false);
    expect(wrapper.vm.selectedItems).toMatchSnapshot();
  });

  it('should select all items', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.setAllChecked(true);
    expect(wrapper.vm.selectedItems).toEqual(
      new Set(['one_index', 'two_index']),
    );
    wrapper.vm.setAllChecked();
    expect(wrapper.vm.selectedItems).toEqual(new Set([]));
  });

  it('should render correctly with selection', () => {
    const wrapper = mountWithOptions({
      props: {
        enableSelection: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should emit clicked item', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.rowClick({ id: 1 });
    expect(wrapper.emitted().rowClick[0][0]).toEqual({ id: 1 });
  });

  it('should handle page change', () => {
    const wrapper = mountWithOptions({
      props: {
        // TODO: fix prop name typo
        enablePagniation: true,
        enableSelection: true,
        pagination: {
          pageSize: 5,
          page: 1,
          current: 1,
        },
      },
    });
    expect(wrapper.vm.pagination.current).toBe(1);
    wrapper.vm.pageChangeHandle('next');
    expect(wrapper.vm.pagination).toMatchSnapshot();
    wrapper.vm.pageChangeHandle('previous');
    expect(wrapper.vm.pagination).toMatchSnapshot();
    wrapper.vm.pageChangeHandle(10);
    expect(wrapper.vm.pagination).toMatchSnapshot();
  });

  it('should handle page size change', () => {
    const wrapper = mountWithOptions({
      props: {
        // TODO: fix prop name typo
        enablePagniation: true,
        enableSelection: true,
        pagination: {
          pageSize: 5,
          page: 1,
          current: 1,
        },
      },
    });
    wrapper.vm.onSelectPageSize(10);
    expect(wrapper.vm.pagination).toMatchSnapshot();
    wrapper.vm.onSelectPageSize(1000);
    expect(wrapper.vm.pagination).toMatchSnapshot();
  });

  it('should handle sort correctly from cold', () => {
    const wrapper = mountWithOptions({
      props: {
        sorter: {
          key: null,
          direction: null,
        },
        pagination: {
          pageSize: 5,
          page: 1,
          current: 1,
        },
      },
    });
    wrapper.vm.sort('id');
    expect(wrapper.vm.pagination).toMatchSnapshot();
    expect(wrapper.emitted().change[0][0].sorter).toEqual({
      key: 'id',
      direction: 'asc',
    });
  });

  it('should handle sort correctly with existing sort', () => {
    const wrapper = mountWithOptions({
      props: {
        sorter: {
          key: 'id',
          direction: 'asc',
        },
        pagination: {
          pageSize: 5,
          page: 1,
          current: 1,
        },
      },
    });
    wrapper.vm.sort('id');
    expect(wrapper.vm.pagination).toMatchSnapshot();
    expect(wrapper.emitted().change[0][0].sorter).toEqual({
      key: 'id',
      direction: 'desc',
    });
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
