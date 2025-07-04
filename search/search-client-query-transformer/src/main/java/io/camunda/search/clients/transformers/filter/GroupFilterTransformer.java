/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.search.clients.transformers.filter;

import static io.camunda.search.clients.query.SearchQueryBuilders.and;
import static io.camunda.search.clients.query.SearchQueryBuilders.hasChildQuery;
import static io.camunda.search.clients.query.SearchQueryBuilders.hasParentQuery;
import static io.camunda.search.clients.query.SearchQueryBuilders.matchNone;
import static io.camunda.search.clients.query.SearchQueryBuilders.or;
import static io.camunda.search.clients.query.SearchQueryBuilders.stringTerms;
import static io.camunda.search.clients.query.SearchQueryBuilders.term;
import static io.camunda.webapps.schema.descriptors.index.GroupIndex.GROUP_ID;
import static io.camunda.webapps.schema.descriptors.index.GroupIndex.KEY;
import static io.camunda.webapps.schema.descriptors.index.GroupIndex.MEMBER_ID;
import static io.camunda.webapps.schema.descriptors.index.GroupIndex.NAME;

import io.camunda.search.clients.query.SearchQuery;
import io.camunda.search.filter.GroupFilter;
import io.camunda.webapps.schema.descriptors.IndexDescriptor;
import io.camunda.webapps.schema.descriptors.index.GroupIndex;
import io.camunda.webapps.schema.entities.usermanagement.EntityJoinRelation.IdentityJoinRelationshipType;

public class GroupFilterTransformer extends IndexFilterTransformer<GroupFilter> {
  public GroupFilterTransformer(final IndexDescriptor indexDescriptor) {
    super(indexDescriptor);
  }

  @Override
  public SearchQuery toSearchQuery(final GroupFilter filter) {
    if (filter.memberIdsByType() != null && !filter.memberIdsByType().isEmpty()) {
      return createMultipleMemberTypeQuery(filter);
    }

    return and(
        filter.groupKey() == null ? null : term(KEY, filter.groupKey()),
        filter.groupId() == null ? null : term(GroupIndex.GROUP_ID, filter.groupId()),
        filter.name() == null ? null : term(NAME, filter.name()),
        filter.description() == null ? null : term(GroupIndex.DESCRIPTION, filter.description()),
        filter.memberIds() == null
            ? null
            : filter.memberIds().isEmpty()
                ? matchNone()
                : hasChildQuery(
                    IdentityJoinRelationshipType.MEMBER.getType(),
                    stringTerms(MEMBER_ID, filter.memberIds())),
        filter.memberType() == null
            ? null
            : term(GroupIndex.MEMBER_TYPE, filter.memberType().name()),
        filter.joinParentId() == null
            ? term(GroupIndex.JOIN, IdentityJoinRelationshipType.GROUP.getType())
            : hasParentQuery(
                IdentityJoinRelationshipType.GROUP.getType(),
                term(GROUP_ID, filter.joinParentId())),
        filter.groupIds() == null
            ? null
            : filter.groupIds().isEmpty() ? matchNone() : stringTerms(GROUP_ID, filter.groupIds()),
        filter.childMemberType() == null
            ? null
            : hasChildQuery(
                IdentityJoinRelationshipType.MEMBER.getType(),
                term(GroupIndex.MEMBER_TYPE, filter.childMemberType().name())));
  }

  private SearchQuery createMultipleMemberTypeQuery(final GroupFilter filter) {
    return or(
        filter.memberIdsByType().entrySet().stream()
            .map(
                entry ->
                    hasChildQuery(
                        IdentityJoinRelationshipType.MEMBER.getType(),
                        and(
                            term(GroupIndex.MEMBER_TYPE, entry.getKey().name()),
                            stringTerms(GroupIndex.MEMBER_ID, entry.getValue()))))
            .toList());
  }
}
