/**
 * Phone Controller Store Tests
 */

import { getModule } from 'vuex-module-decorators';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import ControllerStore, { Metrics } from '@/store/modules/phone/controller';

const localVue = createLocalVue();
localVue.use(Vuex);

const mockStore = new Vuex.Store({
  modules: {
    'phone.controller': ControllerStore,
  },
});

const MockMetrics = ({ queueCount = 2, online = 1 } = {}) => [
  {
    name: 'AGENTS_AVAILABLE',
    type: 'realtime',
    value: String(online),
  },
  {
    name: 'AGENTS_ONLINE',
    type: 'realtime',
    value: String(online),
  },
  {
    name: 'AGENTS_ON_CALL',
    type: 'realtime',
    value: '1',
  },
  {
    name: 'CONTACTS_IN_QUEUE',
    type: 'realtime',
    value: String(queueCount),
  },
  {
    name: 'CONTACTS_IN_QUEUE_OUTBOUND',
    type: 'realtime',
    value: '0',
  },
];

describe('phone.controller store', () => {
  it('updateMetrics', async () => {
    const ctrlStore = getModule(ControllerStore, mockStore);

    const metricsIn = MockMetrics();
    await ctrlStore.updateMetrics({ metrics: metricsIn });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "agentsAvailable": 1,
        "agentsNeeded": 0,
        "agentsOnCall": 1,
        "agentsOnline": 1,
        "calldowns": 0,
        "contactsInQueue": 2,
        "contactsInQueueOutbound": 0,
        "totalWaiting": 2,
      }
    `);
    await ctrlStore.updateMetrics({ metrics: MockMetrics({ queueCount: 12 }) });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "agentsAvailable": 1,
        "agentsNeeded": 0,
        "agentsOnCall": 1,
        "agentsOnline": 1,
        "calldowns": 0,
        "contactsInQueue": 12,
        "contactsInQueueOutbound": 0,
        "totalWaiting": 12,
      }
    `);

    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 35, online: 0 }),
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "agentsAvailable": 0,
        "agentsNeeded": 3,
        "agentsOnCall": 1,
        "agentsOnline": 0,
        "calldowns": 0,
        "contactsInQueue": 35,
        "contactsInQueueOutbound": 0,
        "totalWaiting": 35,
      }
    `);

    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: 35, online: 1 }),
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "agentsAvailable": 1,
        "agentsNeeded": 2,
        "agentsOnCall": 1,
        "agentsOnline": 1,
        "calldowns": 0,
        "contactsInQueue": 35,
        "contactsInQueueOutbound": 0,
        "totalWaiting": 35,
      }
    `);

    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: -1, online: 1 }),
    });
    expect(ctrlStore.metrics).toMatchInlineSnapshot(`
      Object {
        "agentsAvailable": 1,
        "agentsNeeded": 0,
        "agentsOnCall": 1,
        "agentsOnline": 1,
        "calldowns": 0,
        "contactsInQueue": 0,
        "contactsInQueueOutbound": 0,
        "totalWaiting": 0,
      }
    `);
  });
  it('getGeneralMetrics', async () => {
    const ctrlStore = getModule(ControllerStore, mockStore);
    await ctrlStore.updateMetrics({
      metrics: MockMetrics({ queueCount: -1, online: 1 }),
    });

    const metricOrder = [
      Metrics.CONTACTS_QUEUED,
      Metrics.CALLBACKS_QUEUED,
      Metrics.TOTAL_WAITING,
      Metrics.ONLINE,
      Metrics.ONLINE,
      Metrics.AGENTS_ON_CALL,
      Metrics.NEEDED,
    ];

    expect(ctrlStore.getGeneralMetrics(metricOrder)).toMatchInlineSnapshot(`
      Map {
        "~~On hold now" => 0,
        "~~Remaining Callbacks" => 0,
        "~~Total People Waiting" => 0,
        "~~Volunteers Online" => 1,
        "~~Volunteers on the Phone" => 1,
        "~~Additional Volunteers Needed" => 0,
      }
    `);
  });
});
