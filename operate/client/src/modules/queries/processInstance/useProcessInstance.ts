/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import {skipToken, useQuery, UseQueryResult} from '@tanstack/react-query';
import {RequestError} from 'modules/request';
import {ProcessInstance} from '@vzeta/camunda-api-zod-schemas';
import {useProcessInstancePageParams} from 'App/ProcessInstance/useProcessInstancePageParams';
import {fetchProcessInstance} from 'modules/api/v2/processInstances/fetchProcessInstance';

const PROCESS_INSTANCE_QUERY_KEY = 'processInstance';

function getQueryKey(processInstanceKey?: string) {
  return [PROCESS_INSTANCE_QUERY_KEY, processInstanceKey];
}

const useProcessInstance = <T = ProcessInstance>(
  select?: (data: ProcessInstance) => T,
): UseQueryResult<T, RequestError> => {
  const {processInstanceId} = useProcessInstancePageParams();

  return useQuery({
    queryKey: getQueryKey(processInstanceId),
    queryFn: !!processInstanceId
      ? async () => {
          const {response, error} =
            await fetchProcessInstance(processInstanceId);

          if (response !== null) {
            return response;
          }

          throw error;
        }
      : skipToken,
    select,
  });
};

export {PROCESS_INSTANCE_QUERY_KEY, useProcessInstance};
