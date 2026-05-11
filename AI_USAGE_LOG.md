# AI Usage Log

This document captures how AI tools were used during the development of this assignment.

The intent of using AI was:

- brainstorming architecture approaches
- validating tradeoffs
- discussing scalable frontend patterns
- improving documentation quality
- accelerating boilerplate setup

The implementation decisions, architecture choices, and final code structure were manually reviewed and adapted based on engineering judgment.

---

# Overall Development Approach

The project was intentionally developed in phases instead of implementing all features at once.

The primary focus areas were:

1. Scalable architecture
2. Extensible field system
3. Separation of concerns
4. Type safety
5. Conditional logic correctness
6. Maintainable project structure

The implementation was approached similarly to how a small frontend platform would be designed within a real engineering team.

---

# Phase 1 — Architecture Planning

## Prompt

> Help me design a scalable frontend architecture for a browser-based form builder application supporting configurable field types, conditional logic, calculations, persistence, and runtime rendering.

## What Was Discussed

The discussion focused on:

- domain-oriented folder structure
- registry-based field architecture
- separation of builder mode vs runtime mode
- localStorage schema design
- extensibility for future field types

## What I Verified

Before adopting the suggestions, I manually verified:

- whether the architecture avoided tight coupling
- whether new field types could be added with minimal changes
- whether the proposed structure separated business logic from UI logic
- whether state ownership boundaries were clean

## Decisions Taken

I adopted:

- registry-driven field rendering
- discriminated union TypeScript models
- domain-oriented project structure

I intentionally avoided:

- Redux
- overly generic utility-driven architecture
- large monolithic form components

---

# Phase 2 — Field Registry Design

## Prompt

> Suggest a scalable pattern where each form field owns its renderer, config UI, validation, and operators independently.

## What Was Discussed

The AI suggested:

- a field registry pattern
- field definition contracts
- independent field modules

The discussion also covered:

- avoiding switch-case driven rendering
- creating reusable field interfaces
- scalable operator registration for conditional logic

## What I Verified

I validated:

- whether the pattern reduced future modification cost
- whether the registry avoided circular dependencies
- whether TypeScript inference remained strong

## Final Adaptation

The final implementation was simplified compared to the original suggestions.

I reduced abstraction levels to keep the MVP maintainable within assignment scope.

---

# Phase 3 — Conditional Logic Engine

## Prompt

> How would you design a frontend conditional visibility engine for dynamic forms?

## What Was Discussed

The AI suggested:

- operator registries
- pure evaluation functions
- field-type specific condition handlers
- visibility and required-state separation

## What I Verified

I manually reviewed:

- hidden field validation behavior
- chained condition handling
- real-time updates
- whether conditions remained framework-agnostic

## Significant Changes Made

I simplified:

- nested condition grouping
- recursive evaluation strategies

The original suggestion became unnecessarily complex for the assignment scope.

The final solution focused on:

- predictability
- readability
- testability

---

# Phase 4 — Calculation System

## Prompt

> Design a calculation engine for dynamic forms supporting sum, average, minimum, and maximum aggregation.

## What Was Discussed

The conversation covered:

- source field dependency tracking
- realtime updates
- handling invalid number inputs
- avoiding circular calculation dependencies

## What I Verified

I tested:

- recalculation correctness
- decimal precision handling
- empty field behavior
- runtime update performance

## Final Changes

I intentionally avoided:

- memoized dependency graphs
- advanced reactive architectures

The simpler aggregation model was sufficient for the assignment.

---

# Phase 5 — Folder Structure & Separation of Concerns

## Prompt

> Suggest a frontend folder structure optimized for scalability and separation of concerns.

## What Was Discussed

The AI suggested:

- domain-driven folders
- shared service layers
- isolated runtime engines
- centralized type definitions

## What I Verified

I reviewed:

- import ergonomics
- feature ownership boundaries
- whether business logic remained discoverable
- whether future contributors could scale the structure

## Final Decision

I adopted a hybrid structure:

- domain-oriented organization
- shared reusable infrastructure
- isolated engine logic

while avoiding excessive nesting.

---

# Phase 6 — Testing Strategy

## Prompt

> Which parts of this application are most critical to unit test?

## What Was Discussed

The discussion focused on:

- conditional logic evaluation
- validation behavior
- calculation correctness
- hidden-field handling

## What I Verified

I ensured:

- business logic remained testable independently of React
- evaluation functions stayed pure
- tests targeted critical behavior rather than implementation details

## Final Testing Scope

Due to assignment scope and time constraints, testing focused primarily on:

- conditional logic
- calculations
- validation behavior
- registry resolution

rather than exhaustive UI snapshot testing.

---

# Example of AI Output Rejected or Significantly Changed

## Rejected Suggestion

One AI suggestion proposed:

- deeply abstracted plugin architectures
- generic event buses
- multiple middleware layers
- highly normalized runtime stores

## Why It Was Rejected

While technically valid, it introduced:

- unnecessary complexity
- increased cognitive load
- excessive abstraction for an MVP assignment

The assignment emphasized:

- correctness
- engineering judgment
- maintainability

A simpler architecture was more appropriate.

---

# Example of Plausible But Incorrect AI Output

## AI Suggestion

One suggestion proposed centralizing all form state, UI state, validation state, and builder interactions into a single global store.

## Why It Was Incorrect

After reviewing the approach, it became clear that:

- it tightly coupled unrelated concerns
- it made runtime debugging harder
- it increased accidental re-renders
- it reduced maintainability as the application scaled

## Final Approach Taken

I instead separated:

- template management state
- builder interaction state
- runtime form values
- conditional evaluation logic

This kept responsibilities isolated and improved maintainability.

---

# How AI Was Used Overall

AI was primarily used as:

- an architectural discussion partner
- a reviewer for tradeoffs
- a brainstorming assistant

All final implementation decisions, simplifications, and architectural tradeoffs were manually reviewed and adapted for:

- assignment scope
- maintainability
- extensibility
- engineering clarity

The goal was not to maximize generated code volume, but to design a clean, scalable, and understandable frontend system.
