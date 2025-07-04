/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.zeebe.test.util.record;

import io.camunda.zeebe.protocol.record.Record;
import io.camunda.zeebe.protocol.record.value.DeploymentDistributionRecordValue;
import java.util.stream.Stream;

public final class DeploymentDistributionRecordStream
    extends ExporterRecordStream<
        DeploymentDistributionRecordValue, DeploymentDistributionRecordStream> {

  public DeploymentDistributionRecordStream(
      final Stream<Record<DeploymentDistributionRecordValue>> wrappedStream) {
    super(wrappedStream);
  }

  @Override
  protected DeploymentDistributionRecordStream supply(
      final Stream<Record<DeploymentDistributionRecordValue>> wrappedStream) {
    return new DeploymentDistributionRecordStream(wrappedStream);
  }

  @Override
  public DeploymentDistributionRecordStream withPartitionId(final int partitionId) {
    return valueFilter(v -> v.getPartitionId() == partitionId);
  }
}
