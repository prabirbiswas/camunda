/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react';

import {flowNodeSelectionStore} from 'modules/stores/flowNodeSelection';
import {variablesStore} from 'modules/stores/variables';
import {TabView} from 'modules/components/TabView';
import {useProcessInstancePageParams} from '../../../useProcessInstancePageParams';
import {InputOutputMappings} from '../InputOutputMappings';
import {VariablesContent as VariablesContentV2} from './VariablesContent';
import {Listeners} from './Listeners';
import {WarningFilled} from '../styled';
import {init, startPolling} from 'modules/utils/variables';
import {useProcessInstance} from 'modules/queries/processInstance/useProcessInstance';
import {useJobs} from 'modules/queries/jobs/useJobs';
import {useIsRootNodeSelected} from 'modules/hooks/flowNodeSelection';

// TODO: Remove when listeners tab is fully migrated to v2
import {processInstanceListenersStore} from 'modules/stores/processInstanceListeners';
import {Listeners as ListenersLegacy} from '../Listeners';
import {IS_LISTENERS_TAB_V2} from 'modules/feature-flags';

type Props = {
  setListenerTabVisibility: React.Dispatch<React.SetStateAction<boolean>>;
};

const VariablePanel: React.FC<Props> = observer(function VariablePanel({
  setListenerTabVisibility,
}) {
  const {processInstanceId = ''} = useProcessInstancePageParams();
  const {data: processInstance} = useProcessInstance();
  const isRootNodeSelected = useIsRootNodeSelected();

  const flowNodeId = flowNodeSelectionStore.state.selection?.flowNodeId;
  const flowNodeInstanceId =
    flowNodeSelectionStore.state.selection?.flowNodeInstanceId;

  const [listenerTypeFilter, setListenerTypeFilter] =
    useState<ListenerEntity['listenerType']>();

  const shouldUseFlowNodeId = !flowNodeInstanceId && flowNodeId;

  let jobsFilter = {};
  if (shouldUseFlowNodeId) {
    jobsFilter = {
      processInstanceKey: {$eq: processInstanceId},
      elementId: {$eq: flowNodeId},
      ...(listenerTypeFilter && {kind: {$eq: listenerTypeFilter}}),
    };
  } else if (flowNodeInstanceId) {
    jobsFilter = {
      processInstanceKey: {$eq: processInstanceId},
      elementId: {$eq: flowNodeInstanceId},
      ...(listenerTypeFilter && {kind: {$eq: listenerTypeFilter}}),
    };
  }

  // TODO: remove when listeners tab is fully migrated to v2
  const {listenersFailureCount, fetchListeners, reset} =
    processInstanceListenersStore;

  const {
    data: jobs,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useJobs({
    payload: {filter: jobsFilter},
    disabled:
      !IS_LISTENERS_TAB_V2 || (!shouldUseFlowNodeId && !flowNodeInstanceId),
    select: (data) => data.pages?.flatMap((page) => page.items),
  });

  const hasFailedListeners = jobs?.some(({state}) => state === 'FAILED');

  useEffect(() => {
    init(processInstance);

    return () => {
      variablesStore.reset();
    };
  }, [processInstance]);

  // TODO: remove when listeners tab is fully migrated to v2
  useEffect(() => {
    if (IS_LISTENERS_TAB_V2) {
      return;
    }
    reset();
  }, [flowNodeId, flowNodeInstanceId, reset]);
  useEffect(() => {
    if (IS_LISTENERS_TAB_V2) {
      return;
    }

    if (shouldUseFlowNodeId) {
      fetchListeners({
        fetchType: 'initial',
        processInstanceId: processInstanceId,
        payload: {
          flowNodeId,
          ...(listenerTypeFilter && {listenerTypeFilter}),
        },
      });
    } else if (flowNodeInstanceId) {
      fetchListeners({
        fetchType: 'initial',
        processInstanceId: processInstanceId,
        payload: {
          flowNodeInstanceId,
          ...(listenerTypeFilter && {listenerTypeFilter}),
        },
      });
    }
  }, [
    fetchListeners,
    processInstanceId,
    flowNodeId,
    flowNodeInstanceId,
    shouldUseFlowNodeId,
    listenerTypeFilter,
  ]);

  return (
    <TabView
      tabs={[
        {
          id: 'variables',
          label: 'Variables',
          content: <VariablesContentV2 />,
          removePadding: true,
          onClick: () => {
            setListenerTabVisibility(false);
            startPolling(processInstance);
            variablesStore.refreshVariables(processInstanceId);
          },
        },
        ...(isRootNodeSelected
          ? []
          : [
              {
                id: 'input-mappings',
                label: 'Input Mappings',
                content: <InputOutputMappings type="Input" />,
                onClick: () => {
                  setListenerTabVisibility(false);
                  return variablesStore.stopPolling;
                },
              },
              {
                id: 'output-mappings',
                label: 'Output Mappings',
                content: <InputOutputMappings type="Output" />,
                onClick: () => {
                  setListenerTabVisibility(false);
                  return variablesStore.stopPolling;
                },
              },
            ]),
        ...(IS_LISTENERS_TAB_V2
          ? [
              {
                id: 'listeners',
                testId: 'listeners-tab-button',
                ...(hasFailedListeners && {
                  labelIcon: <WarningFilled />,
                }),
                label: 'Listeners',
                content: (
                  <Listeners
                    jobs={jobs}
                    setListenerTypeFilter={setListenerTypeFilter}
                    fetchNextPage={fetchNextPage}
                    fetchPreviousPage={fetchPreviousPage}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                  />
                ),
                removePadding: true,
                onClick: () => {
                  setListenerTabVisibility(true);
                  return variablesStore.stopPolling;
                },
              },
            ]
          : [
              {
                id: 'listeners',
                testId: 'listeners-tab-button',
                ...(listenersFailureCount > 0 && {
                  labelIcon: <WarningFilled />,
                }),
                label: 'Listeners',
                content: <ListenersLegacy />,
                removePadding: true,
                onClick: () => {
                  setListenerTabVisibility(true);
                  return variablesStore.stopPolling;
                },
              },
            ]),
      ]}
      key={`tabview-${flowNodeId}-${flowNodeInstanceId}`}
    />
  );
});

export {VariablePanel};
