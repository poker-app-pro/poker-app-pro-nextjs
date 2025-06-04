/**
 * Application Facade Module
 * 
 * This module provides a clean interface between the application's core domain
 * and the external infrastructure. It implements the Facade pattern to simplify
 * complex subsystems and provide a unified interface to the client code.
 * 
 * The facades handle all the complexity of interacting with external services,
 * data sources, and APIs, while presenting a simple, domain-oriented interface
 * to the application.
 */

// Export all interfaces
export type * from './interfaces';

// Export all implementations
export * from './implementations';

// Factory function to create facade instances
export const createFacades = () => {
  // Import implementations
  const { 
    QualificationFacade,
    ResultsFacade,
    SeasonFacade,
    SeriesFacade,
    StandingsFacade
  } = require('./implementations');

  // Create and return facade instances
  return {
    qualificationFacade: new QualificationFacade(),
    resultsFacade: new ResultsFacade(),
    seasonFacade: new SeasonFacade(),
    seriesFacade: new SeriesFacade(),
    standingsFacade: new StandingsFacade()
  };
};
