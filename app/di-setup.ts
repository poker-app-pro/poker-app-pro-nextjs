/**
 * Dependency Injection Setup
 * 
 * This file sets up the dependency injection for the application.
 * It initializes all the facades and provides them to the application.
 */

import { createFacades } from '@/src/application-facade';
import type { 
  IQualificationFacade,
  IResultsFacade,
  ISeasonFacade,
  ISeriesFacade,
  IStandingsFacade
} from '@/src/application-facade';

// Initialize facades
const {
  qualificationFacade,
  resultsFacade,
  seasonFacade,
  seriesFacade,
  standingsFacade
} = createFacades();

// Export facades for use in server actions and API routes
export const getFacades = () => ({
  qualificationFacade,
  resultsFacade,
  seasonFacade,
  seriesFacade,
  standingsFacade
});

// Export individual facades for direct use
export const getQualificationFacade = (): IQualificationFacade => qualificationFacade;
export const getResultsFacade = (): IResultsFacade => resultsFacade;
export const getSeasonFacade = (): ISeasonFacade => seasonFacade;
export const getSeriesFacade = (): ISeriesFacade => seriesFacade;
export const getStandingsFacade = (): IStandingsFacade => standingsFacade;

// Export types for use in server actions and components
export type Facades = {
  qualificationFacade: IQualificationFacade;
  resultsFacade: IResultsFacade;
  seasonFacade: ISeasonFacade;
  seriesFacade: ISeriesFacade;
  standingsFacade: IStandingsFacade;
};
