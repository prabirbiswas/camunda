/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.migration.api;

import java.util.concurrent.Callable;

/** Scanned interface for migration tasks. */
public interface Migrator extends Callable<Void> {
  default String getName() {
    return getClass().getSimpleName();
  }
}
