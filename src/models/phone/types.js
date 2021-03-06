// @flow

/**
 * Phone model type definitions.
 */

import { AgentStates, RouteStates } from '@/models/phone/AgentClient';
import { ConnectionStates } from '@/models/phone/Connection';
import {
  ContactActions,
  ContactAttributes,
  ContactStates,
} from '@/models/phone/Contact';
import Language from '@/models/Language';

type AgentState = $Values<typeof AgentStates>;
type RouteState = $Values<typeof RouteStates>;
type ConnectionState = $Values<typeof ConnectionStates>;
type ContactState = $Values<typeof ContactStates>;
type ContactAction = $Values<typeof ContactActions>;
type ContactAttribute = $Values<typeof ContactAttributes>;

type RawContactAttribute = {|
  name: string,
  value: string,
|};

type RawContactAttributes = { [key: ContactAttribute]: RawContactAttribute };

type ContactAttributesType = {
  [key: ContactAttribute]: string | number[],
};

type ConnectionType = {|
  connectionId: string,
  contactId: string,
  state: ConnectionState,
  streamsConnectionId?: string,
  // duration: number
|};

type ContactType = {|
  contactId: string | null,
  agentId: string | null,
  state: ContactState,
  action: ContactAction,
  connection: ConnectionType,
  attributes?: ?ContactAttributesType,
|};

type AgentClientType = {|
  userId: number,
  agentId: string,
  state: AgentState,
  routeState: RouteState,
  contacts: ContactType[],
  connections: ConnectionType[],
  localeIds: number[] | null,
  locale?: Language[],
|};

export type {
  AgentState,
  RouteState,
  ConnectionState,
  ContactState,
  ContactAction,
  ContactAttribute,
  AgentClientType,
  ContactType,
  ConnectionType,
  RawContactAttribute,
  RawContactAttributes,
  ContactAttributesType,
};
