/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import {authenticationStore} from 'modules/stores/authentication';
import {operationsStore} from 'modules/stores/operations';
import {variablesStore} from 'modules/stores/variables';
import {createBatchOperation, createInstance} from 'modules/testUtils';
import {useEffect} from 'react';
import {Paths} from 'modules/Routes';
import {LocationLog} from 'modules/utils/LocationLog';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {ProcessDefinitionKeyContext} from 'App/Processes/ListView/processDefinitionKeyContext';
import {QueryClientProvider} from '@tanstack/react-query';
import {getMockQueryClient} from 'modules/react-query/mockQueryClient';
import {ProcessInstance} from '@vzeta/camunda-api-zod-schemas';

const mockOperationCreated = createBatchOperation();

const mockInstanceWithActiveOperation = createInstance({
  operations: [
    {
      id: '8292773a-4cc5-4129-be11-eafe3e39a052',
      batchOperationId: 'a8104a2d-642d-46f2-ad5d-d4447b85e378',
      type: 'RESOLVE_INCIDENT',
      state: 'SENT',
      errorMessage: null,
      completedDate: null,
    },
  ],
  hasActiveOperation: true,
});

const mockCanceledInstance = createInstance({
  state: 'CANCELED',
});

const mockInstanceWithParentInstance = createInstance({
  parentInstanceId: '8724390842390124',
});

const mockInstanceWithoutOperations = createInstance({
  operations: [],
});

const mockProcess = {
  id: '2251799813688076',
  name: 'Complex Process',
  version: 3,
  bpmnProcessId: 'complexProcess',
  versionTag: 'myVersionTag',
};

const mockProcessInstance: ProcessInstance = {
  processInstanceKey: '123',
  processDefinitionName: 'someProcessName',
  state: 'ACTIVE',
  processDefinitionVersion: 1,
  processDefinitionVersionTag: 'myVersionTag',
  processDefinitionId: 'someKey',
  processDefinitionKey: '',
  tenantId: '<default>',
  startDate: '2018-06-21',
  hasIncident: false,
};

const Wrapper: React.FC<{children?: React.ReactNode}> = ({children}) => {
  useEffect(() => {
    return () => {
      operationsStore.reset();
      variablesStore.reset();
      authenticationStore.reset();
    };
  }, []);

  return (
    <ProcessDefinitionKeyContext.Provider value="123">
      <QueryClientProvider client={getMockQueryClient()}>
        <MemoryRouter initialEntries={[Paths.processInstance('1')]}>
          <Routes>
            <Route path={Paths.processInstance()} element={children} />
            <Route path={Paths.processes()} element={children} />
          </Routes>
          <LocationLog />
        </MemoryRouter>
      </QueryClientProvider>
    </ProcessDefinitionKeyContext.Provider>
  );
};

export {
  mockOperationCreated,
  mockInstanceWithActiveOperation,
  mockCanceledInstance,
  mockInstanceWithParentInstance,
  mockInstanceWithoutOperations,
  mockProcess,
  mockProcessInstance,
  Wrapper,
};
